# Current Project Context

Last updated: 2026-10-23.

## Current status

Phase 0 is complete as a planning/feasibility stage, with further model testing explicitly deferred by the user. Phase 1 is ready to start but has not been implemented. The workspace contains documentation, synthetic benchmark scripts, and results; no application code or application dependencies exist.

## User direction

Build a local-model desktop coding assistant for macOS, Ubuntu, and Windows. Initial machine: M2 with 8 GB RAM. The user approved Tauri + React/TypeScript + Rust + Ollama and later stated that their own 3B/4B testing works well, asking to skip further model testing. Do not repeat model benchmarks unless asked or a new functional issue requires investigation. Preserve existing evidence and distinguish user-reported suitability from independently verified qualification.

## Phase 1 starting point

Read [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md). Implement local chat with manual installed-model selection, streaming, stop, and runtime error recovery. Keep repository tools, file edits, and command execution for later phases. No automatic cloud fallback or model download.

Node/npm, Apple command-line tools, and Ollama are available. Rust is missing. Proposed platform test targets are Apple Silicon macOS, Ubuntu 24.04 x86_64, and Windows 11 x86_64; other-platform environments and minimum supported OS versions remain unverified. SQLite is proposed for later persistence.

## Evidence and limitations

[PHASE_0.md](PHASE_0.md) retains smoke results and the final user-directed deferral. Further quality, memory soak, context scaling, and engine cancellation instrumentation are deferred; application functional checks still apply when implemented. No desktop UI or native platform builds have been tested. Documentation links, benchmark syntax, and result files have been validated.

## External state

The public GitHub remote was configured earlier, but pushing documentation was blocked pending explicit public-upload approval. No push was performed by this work.
