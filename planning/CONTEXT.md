# Current Project Context

Last updated: 2026-10-23.

## Current status

Phase 0 planning/feasibility closed with further model tests deferred by user request. Phase 1 local chat is implemented and validated on macOS. Windows/Ubuntu native builds and runtime checks remain open, so the complete cross-platform Phase 1 gate is not yet passed. See [PHASE_1_VERIFICATION.md](PHASE_1_VERIFICATION.md).

## Implementation

`src/` contains React/TypeScript chat and context helpers. `src-tauri/src/` contains native command state and the local Ollama adapter. `scripts/run-tool.mjs` supports project-local or system Rust. Use `npm run desktop` to develop or the built `src-tauri/target/debug/bundle/macos/Local Code.app` locally.

Models are manually selected from installed Ollama models. One response runs at a time. Stream parsing, errors, cancellation, payload bounds, and plain-text output are tested. Stop cancels HTTP; exact engine cancellation timing remains unverified. History is memory-only. There are no project tools, filesystem or command bridges, database, automatic model downloads, or cloud fallback.

## Tools and verification

Node 22.14.0/npm 10.9.2; project-local Rust 1.99.1; Ollama 0.40.8. `.toolchains/` is ignored; shell profiles were not changed. Eight frontend tests, twelve Rust tests, frontend build, Rust lint, local macOS bundle, and live chat/Stop checks passed. See README for commands. Model benchmarking must stay deferred unless requested or needed for a new functional issue.

## Next work

Validate Windows/Ubuntu builds and runtime behavior in suitable native environments. Then continue Phase 2 read-only project awareness within a separately scoped request. SQLite remains proposed for Phase 5. No release signing, deployment, or public upload has been performed.

## Git state

Earlier documentation changes were already staged by external activity; this work does not reset or overwrite that staging. No commits or pushes were made during Phase 1. Public GitHub push approval remains unresolved.
