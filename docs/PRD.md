# Product Requirements

## Confirmed user direction

A desktop coding assistant using local models, targeting macOS, Ubuntu, and Windows. Initial development machine: Apple M2 with 8 GB RAM. Product name and minimum OS versions remain unknown.

## Verified implementation

Documentation only. Phase 1 local chat is implemented with model selection, streaming, stop, connection recovery, and session-only history. macOS functional checks and automated tests pass; Windows/Ubuntu are unverified. See [Phase 1 verification](../planning/PHASE_1_VERIFICATION.md). Further model benchmarking remains deferred at user request.

## Proposed MVP

Open a project, ask questions about its files, request a small code change, review and apply a patch, and approve a verification command. Use local inference with no automatic cloud fallback. The user retains control over file changes and command execution.

Detailed scope and acceptance gates are proposed in [ROADMAP.md](ROADMAP.md); they are not completed features. Performance thresholds, supported model, data-retention preferences, and distribution method require confirmation or measurement.

## Requirements tracking

When implementation is approved, assign requirement IDs and link acceptance criteria to implementation and test evidence. Keep proposals separate from verified capabilities.
