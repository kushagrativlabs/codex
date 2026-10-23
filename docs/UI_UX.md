# UI and UX

## Implemented interface

`src/App.tsx` provides a dark desktop shell with session sidebar, New chat, connection status, model selector/refresh, connection details, starter prompts, streamed conversation, and a fixed composer. `src/styles.css` defines muted green accents, system fonts, borders, spacing, responsive widths, and focus-visible states. No external font or UI kit is loaded.

Only installed models appear, and selection is explicit. Starter prompts populate the composer; they do not immediately send. Enter sends, Shift+Enter inserts a newline, and IME composition is respected. Stop replaces Send during generation. Model selection, refresh, and New chat are disabled while a response is active.

## Output and states

Model output is plain text with preserved whitespace and wrapping. Code fences are displayed literally; Markdown formatting and syntax highlighting are not implemented. Optional API reasoning is collapsed separately. Message labels retain the model that generated each answer.

Handle checking connection, unreachable runtime, empty model list, no selected model, generation, stopping, partial/failed responses, output limit, and omitted context. Explain why an action is unavailable or what the user should do next. Chats are explicitly session-only.

## Accessibility and limitations

Controls have labels, keyboard focus indicators, and error/status semantics. Layout adapts to smaller widths; reduced motion preference is respected for auto-scrolling. Full assistive-technology and cross-platform webview reviews remain pending. UI controls do not expose implementation details unless needed for a meaningful choice, such as model selection, runtime status, and resource limits.
