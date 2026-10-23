mod ollama;

use ollama::{ChatMessage, Model, StreamEvent};
use std::{collections::VecDeque, sync::Mutex};
use tauri::{ipc::Channel, Manager, State};
use tokio_util::sync::CancellationToken;

struct Active {
    id: String,
    token: CancellationToken,
}

#[derive(Default)]
struct Registry {
    active: Option<Active>,
    cancelled: VecDeque<String>,
}

impl Registry {
    fn begin(&mut self, id: &str, token: CancellationToken) -> Result<bool, String> {
        if let Some(index) = self.cancelled.iter().position(|entry| entry == id) {
            self.cancelled.remove(index);
            return Ok(false);
        }
        if self.active.is_some() {
            return Err(
                "Another response is still active. Stop it or wait for it to finish.".into(),
            );
        }
        self.active = Some(Active {
            id: id.to_string(),
            token,
        });
        Ok(true)
    }
    fn cancel(&mut self, id: &str) {
        if let Some(active) = self.active.as_ref().filter(|a| a.id == id) {
            active.token.cancel();
        } else {
            // A stop can arrive before its asynchronous chat command is registered.
            if self.cancelled.len() == 64 {
                self.cancelled.pop_front();
            }
            self.cancelled.push_back(id.to_string());
        }
    }
}

#[derive(Default)]
struct ChatState(Mutex<Registry>);

#[tauri::command]
async fn list_models() -> Result<Vec<Model>, String> {
    ollama::list_models().await
}

#[tauri::command]
async fn chat(
    request_id: String,
    model: String,
    messages: Vec<ChatMessage>,
    on_event: Channel<StreamEvent>,
    state: State<'_, ChatState>,
) -> Result<String, String> {
    ollama::validate(&request_id, &model, &messages)?;
    let token = CancellationToken::new();
    {
        let mut active = state.0.lock().map_err(|_| "Chat state unavailable")?;
        if !active.begin(&request_id, token.clone())? {
            return Ok("cancelled".into());
        }
    }
    let result = ollama::generate(&model, messages, &token, |event| {
        on_event
            .send(event)
            .map_err(|_| "The chat window disconnected".to_string())
    })
    .await;
    // Release only after the HTTP future has been dropped, including on cancellation.
    if let Ok(mut active) = state.0.lock() {
        if active.active.as_ref().is_some_and(|a| a.id == request_id) {
            active.active = None;
        }
    }
    result
}

#[tauri::command]
fn stop_chat(request_id: String, state: State<'_, ChatState>) -> Result<(), String> {
    if request_id.is_empty() || request_id.len() > 100 {
        return Err("Invalid request ID".into());
    }
    state
        .0
        .lock()
        .map_err(|_| "Chat state unavailable")?
        .cancel(&request_id);
    Ok(())
}

pub fn run() {
    tauri::Builder::default()
        .manage(ChatState::default())
        .on_window_event(|window, event| {
            if matches!(event, tauri::WindowEvent::Destroyed) {
                let state = window.state::<ChatState>();
                if let Ok(active) = state.0.lock() {
                    if let Some(active) = active.active.as_ref() {
                        active.token.cancel();
                    }
                };
            }
        })
        .invoke_handler(tauri::generate_handler![list_models, chat, stop_chat])
        .run(tauri::generate_context!())
        .expect("Unable to launch Local Code");
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn single_flight_and_request_scoped_cancellation() {
        let mut registry = Registry::default();
        let first = CancellationToken::new();
        assert!(registry.begin("first", first.clone()).unwrap());
        assert!(registry.begin("second", CancellationToken::new()).is_err());
        registry.cancel("other");
        assert!(!first.is_cancelled());
        registry.cancel("first");
        assert!(first.is_cancelled());
        assert!(registry.active.is_some()); // retain slot until HTTP worker exits
    }
    #[test]
    fn stop_before_start_prevents_generation_and_is_bounded() {
        let mut registry = Registry::default();
        registry.cancel("early");
        assert!(!registry.begin("early", CancellationToken::new()).unwrap());
        assert!(registry.active.is_none());
        for i in 0..100 {
            registry.cancel(&i.to_string());
        }
        assert_eq!(registry.cancelled.len(), 64);
    }
}
