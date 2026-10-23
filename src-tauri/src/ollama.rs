use futures_util::StreamExt;
use reqwest::{Client, Response};
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio_util::sync::CancellationToken;

const BASE: &str = "http://127.0.0.1:11434";
const MAX_LINE: usize = 64 * 1024;
const MAX_OUTPUT: usize = 256 * 1024;
pub const MAX_HISTORY: usize = 4096;

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct Model {
    pub name: String,
    #[serde(default)]
    pub size: u64,
}

#[derive(Debug, Deserialize)]
struct Tags {
    models: Vec<Model>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum StreamEvent {
    Delta { content: String, thinking: String },
}

#[derive(Debug, Default, Deserialize)]
struct IncomingMessage {
    #[serde(default)]
    content: String,
    #[serde(default)]
    thinking: String,
    #[serde(default)]
    tool_calls: Vec<serde_json::Value>,
}

#[derive(Debug, Deserialize)]
struct Chunk {
    #[serde(default)]
    message: IncomingMessage,
    #[serde(default)]
    done: bool,
    done_reason: Option<String>,
    error: Option<String>,
}

fn client() -> Result<Client, String> {
    Client::builder()
        .no_proxy()
        .redirect(reqwest::redirect::Policy::none())
        .connect_timeout(Duration::from_secs(5))
        .read_timeout(Duration::from_secs(30))
        .timeout(Duration::from_secs(180))
        .build()
        .map_err(|_| "Could not initialize local connection".into())
}

fn connection_error(e: reqwest::Error) -> String {
    if e.is_timeout() {
        "Ollama took too long to respond. Try a smaller model or retry.".into()
    } else if e.is_connect() {
        "Cannot reach Ollama at 127.0.0.1:11434. Open Ollama, then refresh models.".into()
    } else {
        "The local Ollama connection was interrupted. Please retry.".into()
    }
}

async fn bounded_body(response: Response, limit: usize) -> Result<Vec<u8>, String> {
    let mut stream = response.bytes_stream();
    let mut body = Vec::new();
    while let Some(part) = stream.next().await {
        let part = part.map_err(connection_error)?;
        if body.len() + part.len() > limit {
            return Err("Ollama returned an oversized response".into());
        }
        body.extend_from_slice(&part);
    }
    Ok(body)
}

pub async fn list_models() -> Result<Vec<Model>, String> {
    fetch_models(&client()?, BASE).await
}

async fn fetch_models(http: &Client, base: &str) -> Result<Vec<Model>, String> {
    // The base argument is internal and used for isolated local fixture tests only.
    let response = http
        .get(format!("{base}/api/tags"))
        .send()
        .await
        .map_err(connection_error)?;
    if !response.status().is_success() {
        return Err(format!(
            "Ollama model listing failed (HTTP {}).",
            response.status().as_u16()
        ));
    }
    let body = bounded_body(response, 1024 * 1024).await?;
    let mut tags: Tags =
        serde_json::from_slice(&body).map_err(|_| "Ollama returned an invalid model list")?;
    tags.models
        .retain(|m| !m.name.is_empty() && m.name.len() <= 200);
    tags.models.sort_by(|a, b| a.name.cmp(&b.name));
    tags.models.dedup_by(|a, b| a.name == b.name);
    Ok(tags.models)
}

pub fn validate(id: &str, model: &str, messages: &[ChatMessage]) -> Result<(), String> {
    if id.is_empty() || id.len() > 100 || model.is_empty() || model.len() > 200 {
        return Err("Choose an installed model and retry.".into());
    }
    if messages.is_empty()
        || messages.len() > 32
        || messages.last().is_none_or(|m| m.role != "user")
    {
        return Err("A conversation must end with a user message.".into());
    }
    let mut size = 0;
    for (i, m) in messages.iter().enumerate() {
        let expected = if i % 2 == 0 { "user" } else { "assistant" };
        if m.role != expected || m.content.trim().is_empty() {
            return Err("Conversation roles must alternate between user and assistant.".into());
        }
        size += m.content.len();
    }
    if size > MAX_HISTORY {
        return Err("Conversation is too large. Shorten your message or start a new chat.".into());
    }
    Ok(())
}

#[derive(Default)]
struct Decoder {
    pending: Vec<u8>,
    total: usize,
}

impl Decoder {
    fn push(&mut self, bytes: &[u8]) -> Result<Vec<Chunk>, String> {
        self.total += bytes.len();
        if self.total > MAX_OUTPUT {
            return Err(
                "Response exceeded the safe size limit. Please ask a shorter question.".into(),
            );
        }
        self.pending.extend_from_slice(bytes);
        let mut chunks = Vec::new();
        while let Some(end) = self.pending.iter().position(|b| *b == b'\n') {
            if end > MAX_LINE {
                return Err("Ollama returned an oversized stream record".into());
            }
            let record: Vec<u8> = self.pending.drain(..=end).collect();
            if let Some(chunk) = Self::parse(&record)? {
                chunks.push(chunk);
            }
        }
        if self.pending.len() > MAX_LINE {
            return Err("Ollama returned an oversized stream record".into());
        }
        Ok(chunks)
    }
    fn parse(bytes: &[u8]) -> Result<Option<Chunk>, String> {
        if bytes.iter().all(u8::is_ascii_whitespace) {
            return Ok(None);
        }
        serde_json::from_slice(bytes)
            .map(Some)
            .map_err(|_| "Ollama sent a malformed stream record".into())
    }
    fn finish(&mut self) -> Result<Option<Chunk>, String> {
        Self::parse(&std::mem::take(&mut self.pending))
    }
}

fn deliver(
    chunk: Chunk,
    emit: &mut impl FnMut(StreamEvent) -> Result<(), String>,
) -> Result<Option<String>, String> {
    if chunk.error.is_some() {
        return Err(
            "Ollama could not generate a response. Check that the selected model is available."
                .into(),
        );
    }
    if !chunk.message.tool_calls.is_empty() {
        return Err(
            "This model requested a tool. Tools are not available in this chat-only version."
                .into(),
        );
    }
    if !chunk.message.content.is_empty() || !chunk.message.thinking.is_empty() {
        emit(StreamEvent::Delta {
            content: chunk.message.content,
            thinking: chunk.message.thinking,
        })?;
    }
    Ok(chunk
        .done
        .then(|| chunk.done_reason.unwrap_or_else(|| "stop".into())))
}

pub async fn generate(
    model: &str,
    messages: Vec<ChatMessage>,
    token: &CancellationToken,
    mut emit: impl FnMut(StreamEvent) -> Result<(), String>,
) -> Result<String, String> {
    generate_at(&client()?, BASE, model, messages, token, &mut emit).await
}

async fn generate_at(
    http: &Client,
    base: &str,
    model: &str,
    messages: Vec<ChatMessage>,
    token: &CancellationToken,
    emit: &mut impl FnMut(StreamEvent) -> Result<(), String>,
) -> Result<String, String> {
    let work = async {
        let response = http
            .post(format!("{base}/api/chat"))
            .json(&serde_json::json!({
                "model": model, "messages": messages, "stream": true, "think": false,
                "options": { "num_ctx": 2048, "num_predict": 512 }, "keep_alive": "1m"
            }))
            .send()
            .await
            .map_err(connection_error)?;
        if !response.status().is_success() {
            return Err(format!(
                "Ollama could not start this response (HTTP {}). Refresh models and retry.",
                response.status().as_u16()
            ));
        }
        let mut decoder = Decoder::default();
        let mut stream = response.bytes_stream();
        while let Some(bytes) = stream.next().await {
            for chunk in decoder.push(&bytes.map_err(connection_error)?)? {
                if token.is_cancelled() {
                    return Ok("cancelled".into());
                }
                if let Some(reason) = deliver(chunk, emit)? {
                    return Ok(reason);
                }
            }
        }
        if token.is_cancelled() {
            return Ok("cancelled".into());
        }
        if let Some(chunk) = decoder.finish()? {
            if let Some(reason) = deliver(chunk, emit)? {
                return Ok(reason);
            }
        }
        Err("Ollama disconnected before completing its response. Partial text was kept.".into())
    };
    tokio::select! {
        biased;
        _ = token.cancelled() => Ok("cancelled".into()),
        result = work => result,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::{Read, Write};
    use std::net::TcpListener;

    #[test]
    fn split_utf8_and_multiple_records_are_preserved() {
        let input = "{\"message\":{\"content\":\"héllo\"}}\n{\"done\":true}\n".as_bytes();
        let mut decoder = Decoder::default();
        let mut output = Vec::new();
        for byte in input {
            output.extend(decoder.push(&[*byte]).unwrap());
        }
        assert_eq!(output.len(), 2);
        assert_eq!(output[0].message.content, "héllo");
        assert!(output[1].done);
    }

    #[test]
    fn malformed_and_oversized_streams_fail() {
        assert!(Decoder::default().push(b"bad json\n").is_err());
        assert!(Decoder::default().push(&vec![b'x'; MAX_LINE + 1]).is_err());
        assert!(Decoder::default()
            .push(&vec![b'x'; MAX_OUTPUT + 1])
            .is_err());
    }

    #[test]
    fn final_record_without_newline_and_error_are_handled() {
        let mut d = Decoder::default();
        assert!(d.push(b"{\"done\":true}").unwrap().is_empty());
        assert!(d.finish().unwrap().unwrap().done);
        let bad: Chunk = serde_json::from_str("{\"error\":\"secret server details\"}").unwrap();
        assert!(!deliver(bad, &mut |_| Ok(()))
            .unwrap_err()
            .contains("secret"));
        let tool: Chunk = serde_json::from_str("{\"message\":{\"tool_calls\":[{}]}}").unwrap();
        assert!(deliver(tool, &mut |_| Ok(())).is_err());
    }

    #[test]
    fn invalid_roles_and_large_history_are_rejected() {
        let msg = |role: &str, content: &str| ChatMessage {
            role: role.into(),
            content: content.into(),
        };
        assert!(validate("1", "local", &[msg("user", "hi")]).is_ok());
        assert!(validate("1", "local", &[msg("system", "hi")]).is_err());
        assert!(validate("1", "local", &[msg("assistant", "hi")]).is_err());
        assert!(validate("1", "local", &[msg("user", &"x".repeat(MAX_HISTORY + 1))]).is_err());
    }

    fn fixture(body: &str, status: &str) -> String {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let response = format!(
            "HTTP/1.1 {status}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
            body.len()
        );
        std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut buf = [0; 8192];
            let _ = stream.read(&mut buf);
            stream.write_all(response.as_bytes()).unwrap();
        });
        format!("http://{addr}")
    }

    #[tokio::test]
    async fn model_list_covers_valid_empty_malformed_and_server_error() {
        let http = client().unwrap();
        let base = fixture(r#"{"models":[{"name":"b"},{"name":"a"}]}"#, "200 OK");
        assert_eq!(fetch_models(&http, &base).await.unwrap()[0].name, "a");
        assert!(fetch_models(&http, &fixture(r#"{"models":[]}"#, "200 OK"))
            .await
            .unwrap()
            .is_empty());
        assert!(fetch_models(&http, &fixture("oops", "200 OK"))
            .await
            .is_err());
        assert!(fetch_models(&http, &fixture("oops", "503 Unavailable"))
            .await
            .is_err());
    }

    #[tokio::test]
    async fn cancelled_before_connect_returns_without_inference() {
        let token = CancellationToken::new();
        token.cancel();
        assert_eq!(
            generate("unavailable", vec![], &token, |_| panic!("must not emit"))
                .await
                .unwrap(),
            "cancelled"
        );
    }
    #[tokio::test]
    async fn stream_integration_delivers_chunks_and_detects_incomplete_response() {
        let http = client().unwrap();
        let body =
            "{\"message\":{\"content\":\"hello\"}}\n{\"done\":true,\"done_reason\":\"length\"}\n";
        let mut output = String::new();
        let result = generate_at(
            &http,
            &fixture(body, "200 OK"),
            "test",
            vec![],
            &CancellationToken::new(),
            &mut |e| {
                let StreamEvent::Delta { content, .. } = e;
                output.push_str(&content);
                Ok(())
            },
        )
        .await
        .unwrap();
        assert_eq!(output, "hello");
        assert_eq!(result, "length");
        let incomplete = generate_at(
            &http,
            &fixture("{\"message\":{\"content\":\"partial\"}}\n", "200 OK"),
            "test",
            vec![],
            &CancellationToken::new(),
            &mut |_| Ok(()),
        )
        .await;
        assert!(incomplete.unwrap_err().contains("before completing"));
        assert!(generate_at(
            &http,
            &fixture("", "404 Not Found"),
            "test",
            vec![],
            &CancellationToken::new(),
            &mut |_| Ok(())
        )
        .await
        .is_err());
    }

    #[tokio::test]
    async fn cancellation_drops_connection_while_waiting_for_response_headers() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let base = format!("http://{}", listener.local_addr().unwrap());
        let (ready_tx, ready_rx) = tokio::sync::oneshot::channel();
        let (closed_tx, closed_rx) = tokio::sync::oneshot::channel();
        std::thread::spawn(move || {
            let (mut socket, _) = listener.accept().unwrap();
            socket
                .set_read_timeout(Some(Duration::from_secs(3)))
                .unwrap();
            let mut buf = [0; 8192];
            let _ = socket.read(&mut buf);
            let _ = ready_tx.send(());
            // No response headers: simulates loading a model before it can answer.
            let closed = matches!(socket.read(&mut buf), Ok(0));
            let _ = closed_tx.send(closed);
        });
        let token = CancellationToken::new();
        let stop = token.clone();
        let cancellation = async move {
            ready_rx.await.unwrap();
            stop.cancel();
        };
        let http = client().unwrap();
        let mut emit = |_| Ok(());
        let generation = generate_at(&http, &base, "test", vec![], &token, &mut emit);
        let (result, _) = tokio::join!(generation, cancellation);
        assert_eq!(result.unwrap(), "cancelled");
        assert!(tokio::time::timeout(Duration::from_secs(3), closed_rx)
            .await
            .unwrap()
            .unwrap());
    }

    #[tokio::test]
    async fn cancellation_during_stream_stops_further_delivery() {
        let token = CancellationToken::new();
        let stop = token.clone();
        let mut calls = 0;
        let body = "{\"message\":{\"content\":\"first\"}}\n";
        let result = generate_at(
            &client().unwrap(),
            &fixture(body, "200 OK"),
            "test",
            vec![],
            &token,
            &mut |_| {
                calls += 1;
                stop.cancel();
                Ok(())
            },
        )
        .await;
        // Cancellation must be checked inside record delivery, not only at network awaits.
        assert_eq!(result.unwrap(), "cancelled");
        assert_eq!(calls, 1);
    }

    #[tokio::test]
    async fn unreachable_service_has_actionable_error() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let base = format!("http://{}", listener.local_addr().unwrap());
        drop(listener);
        assert!(fetch_models(&client().unwrap(), &base)
            .await
            .unwrap_err()
            .contains("Cannot reach Ollama"));
    }
}
