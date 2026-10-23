# Tasks

## Completed — Phase 0, 2026-10-23

- [x] Inspect the workspace and create the documentation foundation.
- [x] Record product direction, macOS/Ubuntu/Windows targets, and M2/8 GB development hardware.
- [x] Obtain and record stack approval: Tauri + React/TypeScript + Rust + Ollama.
- [x] Define phase boundaries and the initial local-chat scope.
- [x] Inspect existing tools and runtime; identify missing Rust build prerequisite.
- [x] Collect initial synthetic model and interruption evidence.
- [x] Record user-reported successful 3B/4B testing and explicit instruction to skip further model testing.
- [x] Close Phase 0 with outstanding model qualification deferred, not passed.
- [x] Prepare [Phase 1 acceptance criteria](PHASE_1_HANDOFF.md).

## Next — Phase 1, not started

- [ ] Verify/install Rust build tools and pin compatible dependencies.
- [ ] Scaffold the Tauri + React/TypeScript desktop shell and Rust provider adapter.
- [ ] Connect to local Ollama and list installed models for manual selection.
- [ ] Implement streamed conversation, stop behavior, and runtime error recovery.
- [ ] Verify functional checks and native builds on available platforms; document unavailable target environments.

## Later phases

- [ ] Phase 2: read-only project awareness.
- [ ] Phase 3: reviewed file edits.
- [ ] Phase 4: approved commands and verification.
- [ ] Phase 5: persistence and usability.
- [ ] Phase 6: cross-platform beta and packaging.

## Deferred and unresolved

Further model benchmarks are skipped at user request. Minimum OS versions, actual Windows/Ubuntu validation environments, and production resource limits remain unverified. SQLite remains proposed. No application phase is implemented. Public GitHub push approval remains unresolved.
