# Phased Development Plan

Status: Phase 0 planning/feasibility complete with further model testing deferred at user request. Phase 1 is next; no application phase is implemented. See [evidence and closure](../planning/PHASE_0.md). No deadlines are committed.

## Confirmed direction

Build a desktop coding assistant that uses local models. Target macOS, Ubuntu, and Windows. Initial development hardware is an Apple M2 Mac with 8 GB unified memory. Exact supported OS versions and other hardware targets remain to be defined.

## Phase 0 — Scope and technical feasibility

- Define the first workflow, supported OS versions, permission behavior, and model evaluation tasks.
- Evaluate proposed stack: Tauri, React, TypeScript, Rust, Ollama, and SQLite.
- Benchmark a small quantized coding model on the M2/8 GB machine with representative repository tasks.
- Measure response latency, total memory pressure, context limits, cancellation, and tool-call correctness. Define acceptable thresholds before evaluating results.
- Use a separate Ollama installation initially; model choice and distribution remain pending approval.

Exit: approved stack, initial local-chat scope, recorded evidence, and documented deferral. Closed on 2026-10-23 after the user reported 3B/4B models work well and asked to skip further testing. Use manual model selection in Phase 1. This does not establish reliable autonomous tool use.

## Phase 1 — Desktop shell and local chat

- Create the app shell, settings, runtime health check, and installed-model selector.
- Add streaming conversation, cancellation, and clear missing-runtime/model errors.
- Keep a replaceable model-provider interface.
- Verify a basic build and chat connection on all three target operating systems early.

Exit: user can launch the app, connect to local Ollama, select an installed model, chat, and stop generation. No cloud inference fallback.

## Phase 2 — Project awareness, read-only

- Add explicit folder selection, file browsing, file reading, and repository search.
- Respect ignored paths, exclude secrets and large/binary files by default, and enforce project boundaries including symlinks.
- Select relevant snippets within a context budget; show included files to the user.

Exit: answer repository questions with accurate file references without modifying files; test path traversal, cancellation, and context limits.

## Phase 3 — Reviewable file changes

- Introduce a bounded agent loop with validated tool arguments and iteration limits.
- Generate proposed patches and display diffs before applying user-approved changes.
- Detect stale file content and provide safe recovery for app-applied edits without overwriting unrelated work.

Exit: complete a small requested edit with explicit review; rejected patches do not alter files; out-of-project writes are blocked.

## Phase 4 — Commands and verification

- Add command approval, working-directory controls, output limits, timeouts, and process cancellation.
- Handle shell/process differences across operating systems.
- Let the agent run approved checks and report actual results. Workspace scoping alone is not an operating-system sandbox; define and test the execution boundary before enabling commands.

Exit: an edit can be checked with an approved command; rejection prevents execution; cancellation terminates the owned process tree; failures are reported accurately.

## Phase 5 — Persistence and usability

- Store projects and chat history locally, with delete/export controls.
- Improve keyboard navigation, accessibility, error recovery, and onboarding.
- Profile app overhead alongside model memory use on the M2/8 GB system.

Exit: sessions survive restart; deletion works; the core workflow remains usable within measured resource limits.

## Phase 6 — Cross-platform beta and packaging

- Build and test separate macOS, Ubuntu, and Windows packages in suitable environments.
- Validate file permissions, paths, line endings, shell behavior, webview differences, and runtime setup per platform.
- Define supported versions and hardware, signing/distribution requirements, release checks, and rollback guidance.

Exit: the same core workflow passes on all three platforms; installation instructions and known limitations are verified. Do not claim a platform is supported solely because the framework supports it.

## Later proposals

Additional inference providers, embedded model delivery, richer indexing, Git workflows, and advanced automation may be considered after the core workflow is reliable. Multi-agent execution and unrestricted autonomous commands are outside the proposed MVP.

## Sources for feasibility

- [Tauri prerequisites](https://tauri.app/start/prerequisites/)
- [Tauri platform architecture](https://tauri.app/concept/architecture/)
- [Ollama downloads](https://ollama.com/download)

Track progress in [../planning/TASKS.md](../planning/TASKS.md).
