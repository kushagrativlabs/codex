# Native and Local API

No hosted/public API is implemented. The webview invokes three local Rust commands.

| Command | Frontend arguments | Success value |
| --- | --- | --- |
| `list_models` | None | Array of `{ name: string, size: number }`, sorted/deduplicated |
| `chat` | `requestId`, `model`, `messages: {role,content}[]`, `onEvent: Channel` | Completion reason, such as `stop`, `length`, or `cancelled` |
| `stop_chat` | `requestId` | No payload |

Chat events: `{ type: "delta", content: string, thinking: string }`. Each request owns its channel. Rejections return displayable error strings; internal runtime error bodies are not exposed verbatim.

## Ollama endpoints

- `GET http://127.0.0.1:11434/api/tags`: model list and connection check.
- `POST http://127.0.0.1:11434/api/chat`: streaming NDJSON, `think: false`, requested `num_ctx: 2048`, `num_predict: 512`, and `keep_alive: "1m"`.

No tools are sent to Ollama. Unexpected tool requests fail with an explanation. There are no download, model deletion, service start/stop, or arbitrary-URL commands.

Native validation restricts model name/request ID lengths, alternating roles, final user message, nonempty content, at most 32 messages, and 4,096 content bytes. The frontend uses the stricter 2,048-byte latest-input limit and at most 31 sent messages. Model list responses are capped at 1 MiB; stream records at 64 KiB and total streamed data at 256 KiB. Connection timeout is 5 seconds, read timeout 30 seconds, overall request timeout 180 seconds.

See [Ollama chat documentation](https://docs.ollama.com/api/chat) and implemented handlers in `src-tauri/src/`.
