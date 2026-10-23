# Local Code

A desktop chat app for models running locally through Ollama. Built with Tauri, React/TypeScript, and Rust.

Phase 1 is implemented and verified on the development Mac. Windows and Ubuntu are intended targets, but native builds and runtime behavior on those systems have not been verified. Repository tools, file editing, commands, and persistent history belong to later phases.

## Requirements

- Node.js 22.14+ within the supported 22.x range, or another version allowed by `package.json`.
- Rust and the platform prerequisites in [Tauri's guide](https://tauri.app/start/prerequisites/).
- Separately installed and running [Ollama](https://ollama.com/download), with at least one installed model.

The initial Mac has a project-local Rust installation in ignored `.toolchains/`. The command wrapper uses it if present, otherwise it uses a standard Rust installation on PATH. It does not install tools automatically or modify shell profiles.

## Run

```sh
npm ci
npm run desktop
```

Choose an installed model, type a message, and press Enter. Shift+Enter adds a line. Stop interrupts the active request and keeps partial text. New chat clears the in-memory conversation. Chats disappear when the app closes.

Ollama must listen at `127.0.0.1:11434`. The app does not start Ollama, download models, or fall back to cloud inference. No `.env` file is required. Responses are displayed as plain text, including code fences, without executing HTML or links.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run desktop` | Run the native app with the frontend development server |
| `npm run dev` | Browser layout preview only; native Ollama access is unavailable |
| `npm run build` | Type-check TypeScript and build frontend assets |
| `npm test` | Frontend context and interaction tests |
| `npm run test:rust` | Backend unit and local HTTP fixture tests |
| `npm run lint:rust` | Rust Clippy with warnings treated as errors |
| `npm run format:rust` | Format Rust sources |
| `npm run desktop:build -- --debug --bundles app` | Build a local debug macOS app bundle |

The verified local macOS bundle is at `src-tauri/target/debug/bundle/macos/Local Code.app`. It is a development build, not a published or notarized release. Native packaging commands for Windows/Ubuntu remain to be verified. Lockfiles are tracked; toolchains, dependencies, and generated build artifacts are ignored.

## Resource limits

One generation at a time. Requests ask Ollama for a 2,048-token context and up to 512 output tokens. Input is limited to 2,048 UTF-8 bytes; sent conversation text to 4,096 bytes across whole completed turns. A notice appears when the app omits earlier context. Byte budgeting is not exact tokenization; the model runtime may also shorten context. Stop cancels the HTTP request; exact inference-engine cancellation timing is not guaranteed.

## Project map

- `src/App.tsx` and `src/styles.css`: chat interface.
- `src/chat.ts`: context preparation and streamed-message updates.
- `src-tauri/src/lib.rs`: native commands and single-request state.
- `src-tauri/src/ollama.rs`: loopback provider, validation, streaming, and backend tests.
- `scripts/run-tool.mjs`: local/system Rust toolchain wrapper.
- [AI instructions](AGENTS.md), [architecture](docs/ARCHITECTURE.md), [testing](docs/TESTING.md), [security](docs/SECURITY.md).
- [Roadmap](docs/ROADMAP.md), [tasks](planning/TASKS.md), [context](planning/CONTEXT.md), [Phase 1 verification](planning/PHASE_1_VERIFICATION.md).

Further model benchmarking is deferred at the user's request. Existing synthetic results remain in `planning/benchmarks/`; they do not certify model accuracy or authorize autonomous tools.
