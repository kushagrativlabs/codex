# Technology Stack

Approved: Tauri + React/TypeScript + Rust + separately installed Ollama. SQLite remains proposed for later persistence.

## Implemented versions

| Component | Version/evidence |
| --- | --- |
| React / React DOM | 19.3.1, exact `package.json` versions |
| TypeScript | 5.9.3 |
| Vite | 8.3.5 |
| Tauri JS API / CLI | 2.12.4 |
| Tauri Rust crate | 2.12.5 resolved in `src-tauri/Cargo.lock` |
| Rust compiler used | 1.99.1 on aarch64-apple-darwin |
| Node.js / npm used | 22.14.0 / 10.9.2 |
| reqwest | 0.12.28 resolved; local HTTP with JSON and streaming features |
| Tokio / tokio-util | Async I/O, timeouts, and cancellation; see Cargo.lock |
| Vitest | 5.0.5 |
| React Testing Library / jsdom | 16.3.3 / 29.1.1 |
| Ollama service/client observed | 0.40.8; external runtime, not bundled |

Npm dependencies are pinned in `package.json` and `package-lock.json`; Rust dependency resolutions are pinned by `src-tauri/Cargo.lock`. No database, Markdown-rendering package, file-access plugin, or shell plugin is installed.

Mac-only SwiftUI was superseded by the cross-platform stack before application implementation. Sources and version decisions are recorded in [DECISIONS.md](DECISIONS.md); do not change the stack without approval.
