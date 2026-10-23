# Phase 1 Verification

Date: 2026-10-23. Status: implemented; macOS validation complete for the checks below, cross-platform acceptance still open.

## Delivered

Tauri + React/TypeScript desktop app; Rust Ollama provider; explicit installed-model selection; streamed conversation; Stop and late-event suppression; single active request; context/payload limits; connection errors and retry; New chat; memory-only history; safe plain-text output. No repository tools or command executor.

## Validation evidence

- `npm test`: 8 frontend unit/interaction tests passed.
- `npm run build`: TypeScript check and frontend production build passed.
- `npm run test:rust`: 12 backend tests passed, including temporary HTTP fixtures.
- `npm run lint:rust`: passed with warnings treated as errors.
- `npm run desktop:build -- --debug --bundles app`: local macOS bundle built.
- Native app opened and listed existing Ollama models.
- qwen2.5:3b greeting returned through the native app.
- Stop during a longer live response kept partial text and re-enabled controls.
- Package installation audit reported zero npm vulnerabilities at installation time; this is not a full security audit or Rust dependency audit.

The live functional checks exercise the app's integration; they do not resume deferred model benchmarks.

## Acceptance status

| Criteria | Status |
| --- | --- |
| P1-01 desktop window and controls | Verified on macOS; full keyboard/accessibility review pending |
| P1-02 model listing and runtime errors | Native success; missing/empty/malformed/error states covered by automated fixtures |
| P1-03 streaming and roles | Implemented; parser and UI tests pass |
| P1-04 Stop and stale output | Live UI and automated checks pass; exact inference-engine shutdown timing unverified |
| P1-05 single generation | Frontend guard and backend registry covered by tests |
| P1-06 local endpoint / no automatic fallback | Fixed native loopback endpoint; no remote-provider adapter implemented |
| P1-07 untrusted output | Plain text rendering; interaction test confirms HTML stays text |
| P1-08 bounded context/output | Byte budgets and requested engine limits implemented; effective backend token usage not independently measured |
| P1-09 preserve runtime state | No app service-stop/model-delete/unload operations |
| P1-10 all target platforms build | macOS passed; Windows/Ubuntu unverified |

## Remaining work

Run native builds and launch/chat/stop checks on Windows and Ubuntu before marking the entire cross-platform Phase 1 acceptance gate complete. No suitable other-OS runner was available in this session. Full accessibility review, release signing, and production distribution remain later work. All synthetic model benchmark deferrals remain in effect.
