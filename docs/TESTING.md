# Testing and Verification

## Commands

```sh
npm test
npm run build
npm run test:rust
npm run lint:rust
```

Backend integration tests bind temporary loopback ports; an environment restricting local sockets must grant access before those tests can run. They use synthetic HTTP fixtures, not real model inference. The desktop launcher wrapper uses project-local Rust if available, otherwise system Rust.

## Coverage

Frontend: complete-turn context budgeting, UTF-8 limits, omitted partial answers, late chunks, model selection, streaming display, single-send behavior, Stop, stream failure recovery, missing runtime retry, empty model list, and untrusted output rendered as text.

Backend: split UTF-8/NDJSON records, malformed/oversized records, final records without newlines, explicit error records, unexpected tool calls, role/payload checks, valid/empty/invalid/error model lists, unreachable service, incomplete streams, cancellation before connection, connection closure while waiting for response headers, streaming interruption, single-flight state, and Stop-before-start ordering.

## Manual macOS checks

A debug macOS app bundle opened successfully, connected to existing Ollama, listed installed models, sent a greeting using qwen2.5:3b, and displayed its response. A longer live response was stopped; partial text remained and controls recovered. This is functional app verification, not a model-quality benchmark.

Exact final check results and limits are in [Phase 1 verification](../planning/PHASE_1_VERIFICATION.md). Windows/Ubuntu builds, long-duration resource behavior, complete accessibility review, production signing, and exact inference-engine cancellation timing remain unverified. Further synthetic model qualification is deferred at user request.
