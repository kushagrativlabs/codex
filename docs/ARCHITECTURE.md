# Architecture

## Implemented Phase 1

A Tauri desktop application hosts a React interface. Rust commands communicate only with a fixed local Ollama service. No separately hosted backend, project filesystem access, command executor, or database is implemented.

```text
React interface (src/App.tsx)
  → typed Tauri invoke + per-request IPC Channel
Rust commands / single active request (src-tauri/src/lib.rs)
  → bounded local HTTP requests and NDJSON decoder
Ollama at 127.0.0.1:11434 (src-tauri/src/ollama.rs)
  → deltas / completion / errors back to the interface
```

## Responsibilities

| Module | Responsibility |
| --- | --- |
| `src/App.tsx` | Model listing, selection, chat state, streaming UI, error recovery, stop, session reset |
| `src/chat.ts` | Whole-turn context budgeting and safe delta application |
| `src-tauri/src/lib.rs` | Command registration, single-flight registry, request-scoped cancellation, window-close cancellation |
| `src-tauri/src/ollama.rs` | Fixed endpoint, HTTP limits/timeouts, model listing, role validation, bounded byte-stream parsing |
| `scripts/run-tool.mjs` | Resolve project-local or system Rust tools without changing shell profiles |

## Data flow and lifetime

The frontend sends alternating user/assistant messages ending in the latest user message. It omits older whole turns as needed and excludes incomplete answers. Native code validates role order and total bytes again. Ollama receives a 2,048-token context request and 512-token output cap. These are requested engine settings, not a promise of effective limits on every model/backend.

Each request has a unique ID and IPC channel. The native registry retains its slot until the request future exits. Stop-before-start IDs are retained in a bounded queue to handle command-order races. Cancellation drops the HTTP future; the frontend ignores subsequent chunks. No other runtime process is stopped or model unloaded by the app.

History lives in React memory only. Streaming text and optional reasoning fields are rendered as untrusted text. No native tool executor is exposed. SQLite remains a proposal for Phase 5.

## Next boundaries

Project selection/read access, reviewed patches, and approved command execution remain future phases. They require separate capability and permission designs. See [ROADMAP.md](ROADMAP.md) and [DECISIONS.md](DECISIONS.md).
