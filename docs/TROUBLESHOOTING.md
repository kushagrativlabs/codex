# Troubleshooting

## Ollama is unavailable

Open Ollama and confirm its local service listens on 127.0.0.1:11434. Click Retry connection or Refresh installed models. The app does not start or reconfigure the service. Errors may also indicate runtime startup delays.

## No models appear

Install a model through Ollama, then refresh. Model download is not implemented in the app. The selector deliberately starts without a default choice.

## Browser preview cannot connect

Expected: `npm run dev` is a layout preview. Use `npm run desktop` for native commands and local inference.

## Rust cannot be found

The wrapper detects `.toolchains/cargo/bin/cargo` if present; otherwise install Rust through the official workflow and ensure cargo is on PATH. A fresh clone does not contain the ignored local toolchain. Platform prerequisites are also required; see README.

## Long or partial output

The initial output cap is 512 tokens and request timeout is 180 seconds, with a 30-second read timeout. A notice reports output truncation. Stop and stream failures preserve partial text; incomplete turns are omitted from future request history. Ask a focused follow-up.

## Backend tests cannot bind sockets

Integration fixtures need temporary loopback sockets. If the execution environment denies them, run with authorized local network access rather than treating permission denial as an application failure.

## Chats disappear after close

Expected for Phase 1: history is session-only. Persistence is planned for a later phase.

## Other operating systems

Windows/Ubuntu runtime and packaging issues are not yet verified. Record platform, exact command, sanitized error, and reproduction steps before documenting a fix.
