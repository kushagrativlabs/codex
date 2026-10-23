# Phase 1 Implementation Handoff

Status: ready for Phase 1 after Phase 0 closure; implementation specification only. No application code or platform builds exist.

## Scope

Build a local chat client using the approved Tauri + React/TypeScript + Rust + Ollama stack. Users select an installed model; do not label any model as a qualified coding agent until evidence meets the relevant gates. Do not run shell commands, read repositories, edit files, or download models in this phase.

## Acceptance criteria

| ID | Behavior | Verification |
| --- | --- | --- |
| P1-01 | App opens a chat window with model selector, conversation, input, send, and stop controls | Launch and keyboard navigation |
| P1-02 | Rust core checks local Ollama health and lists installed models | Test reachable service, service absent, malformed response, and no installed models |
| P1-03 | Responses stream incrementally and preserve conversation roles | Test split JSON chunks, UTF-8 boundaries, service errors, and final completion |
| P1-04 | Stop ends the app's active request and suppresses late chunks | Test cancellation during load and streaming; prove backend release separately |
| P1-05 | Only one generation can run at a time | Repeated Send cannot start concurrent inference |
| P1-06 | Local inference only, with explicit error recovery | No automatic remote provider or external model endpoint fallback |
| P1-07 | Output is rendered as untrusted text/Markdown | Raw HTML and executable links cannot trigger native tools; no tool executor exposed |
| P1-08 | Context and output are bounded | Start with a 2,048-token model context, budget conversation history, disclose truncation; verify effective limit per backend |
| P1-09 | Existing user runtime state is respected | No automatic stopping of Ollama, deletion of models, or unloading models used outside the app |
| P1-10 | Basic app builds on all proposed platforms | Native builds/smoke tests required; untested targets remain explicitly unverified |

## Technical boundaries

The UI sends typed chat requests through a minimal native bridge. The Rust provider adapter owns loopback HTTP, streamed parsing, timeouts, request IDs, and cancellation. Do not expose an unrestricted HTTP proxy or generic command bridge. Default Ollama connection: 127.0.0.1:11434. Validate responses and bound payload sizes. Render model reasoning separately when the API provides it; do not assume markers embedded in content prove safe separation.

Ollama remains separately installed. Keep model selection manual, with measured limitations visible in development documentation. Model downloads require a later explicit workflow. Session history can remain in memory until Phase 5; SQLite is not required for Phase 1.

## Development readiness

Node/npm and Apple command-line tools were observed. Rust is missing; verify/install through the official Rust workflow when beginning implementation, then pin compatible project dependencies. Do not infer a usable Tauri build from a tool inventory.

## Platform validation plan

Proposed initial test targets: observed Apple Silicon macOS, Ubuntu 24.04 x86_64, Windows 11 x86_64. No other-OS runner is available in this session. Use appropriate native environments or CI runners when separately configured. Check platform prerequisites against [Tauri's official guide](https://tauri.app/start/prerequisites/). No CI account, paid runner, or deployment has been configured.

## Deferred gates

The user instructed us to skip further model testing after reporting successful 3B/4B usage. Do not require more synthetic model benchmarks before starting Phase 1. General model accuracy, controlled memory measurements, inference-engine cancellation telemetry, and longer-context behavior remain unverified. Native platform validation and actual application functional tests remain required before claiming release readiness. Model-selected tools, patch handling, and command permissions belong to later phases and must be tested independently of model compliance.
