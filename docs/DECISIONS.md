# Decision Log

Application decisions below reflect explicit user approval; implementation status is recorded separately.

## Recording future decisions

For each significant choice, record an ID, date, status (proposed, accepted, superseded), context, alternatives, rationale, consequences, and supporting evidence or approval. Record the reason only when it is known; otherwise mark it **Needs Verification**.

The documentation foundation was requested on 2026-10-23; it does not imply approval of any application stack or architecture.

## ADR-001 — Cross-platform desktop stack

- Date: 2026-10-23. Status: accepted.
- Decision: Tauri, React/TypeScript, Rust, and separately installed Ollama.
- Approval: user answered “Yes” to the explicit stack approval question during Phase 0.
- Context: local-model desktop coding assistant for macOS, Ubuntu, and Windows; initial development hardware M2/8 GB.
- Rationale: shared interface and native core with a replaceable local model connection. Actual resource savings remain to be measured.
- Alternatives discussed: macOS-only SwiftUI; llama.cpp, MLX, and LM Studio for inference.
- Consequences: install/verify Rust before native builds; maintain platform-specific file/process and packaging checks. Do not claim OS support without testing.
- Not decided: exact dependency versions, default model, minimum OS versions, and SQLite adoption. No application code has been implemented.

## ADR-002 — Defer further model testing and proceed with local chat

- Date: 2026-10-23. Status: accepted user direction.
- Evidence: user reports 3B/4B models work well and explicitly asks to skip further testing.
- Decision: close Phase 0 planning/feasibility; defer additional model benchmarks. Proceed with manual model selection and local chat as the Phase 1 scope.
- Consequences: no benchmark-qualified default is claimed. Existing failures remain documented, but do not block Phase 1. Verify application streaming/cancellation and later tool permissions independently of model testing.
