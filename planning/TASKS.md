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

## Phase 1 — implemented, cross-platform acceptance pending

- [x] Install project-local Rust tools without changing shell profiles.
- [x] Scaffold Tauri + React/TypeScript and native provider adapter; add lockfiles.
- [x] Connect to local Ollama and list installed models for manual selection.
- [x] Implement streamed conversation, Stop, single-flight protection, context bounds, and error recovery.
- [x] Pass 8 frontend tests, 12 Rust tests, frontend build, and Rust lint.
- [x] Build and open a debug macOS app; verify live chat and Stop.
- [x] Update documentation with actual setup and verified behavior.
- [ ] Build and smoke-test Windows and Ubuntu in native environments.
- [ ] Complete full keyboard/accessibility review.

See [PHASE_1_VERIFICATION.md](PHASE_1_VERIFICATION.md). No additional model benchmarks are required.

## Later phases

- [ ] Phase 2: read-only project awareness.
- [ ] Phase 3: reviewed file edits.
- [ ] Phase 4: approved commands and verification.
- [ ] Phase 5: persistence and usability.
- [ ] Phase 6: cross-platform beta and packaging.

## Deferred and unresolved

Further model benchmarks are skipped at user request. Minimum OS versions, actual Windows/Ubuntu validation environments, and production resource limits remain unverified. SQLite remains proposed. Phase 1 is implemented on macOS; cross-platform validation remains open. Public GitHub push approval remains unresolved.
