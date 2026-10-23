# Current Project Context

Last updated: 2026-10-23.

## Verified state

The workspace contains documentation only. No application code, dependencies, test tooling, model installation, or benchmarks have been added.

## User direction

Build a local-model desktop coding assistant. Target macOS, Ubuntu, and Windows. Initial development hardware: Apple M2 with 8 GB RAM. The user requested phases before implementation.

## Proposed approach

Tauri + React/TypeScript interface, Rust core, separately installed Ollama, and SQLite. This proposal replaces the earlier macOS-only SwiftUI recommendation; no stack has yet been approved or installed. Model selection depends on measured memory use and coding/tool-call reliability.

Read [../docs/ROADMAP.md](../docs/ROADMAP.md) for phase scope and exit criteria. Next work is Phase 0: confirm scope/stack and evaluate feasibility. No app phase is complete.

## Validation

Local Markdown links and documentation file presence are checked. No application or cross-platform behavior has been tested.
