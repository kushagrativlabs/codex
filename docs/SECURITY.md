# Security

## Implemented boundaries

- Native HTTP requests use only `127.0.0.1:11434`; no arbitrary endpoint input or cloud fallback.
- Requests bypass environment proxies and do not follow redirects.
- Only model listing, chat, and request cancellation are registered as application commands.
- No shell, filesystem, opener, or model-management plugin is exposed.
- Model text is rendered through React as plain text; no raw HTML or executable Markdown links.
- Tauri CSP restricts content to app assets and IPC. No remote fonts or images are loaded by the authored interface.
- Native code independently validates roles, message sizes, and request fields; HTTP and stream parsing are bounded.
- One generation is active at a time. Stop targets a request ID; window destruction cancels the active request.
- Conversations remain in memory and are not written to an app database or application log.

## Limits

Ollama is a separately managed local service. The app does not configure its network binding or authentication, enforce its cloud policy, or audit the selected model. The app's request is local; users must select a genuinely local model/runtime configuration if fully offline operation is required. Credentials and secrets should not be pasted into chat.

Dropping the HTTP request does not certify immediate GPU/engine cancellation or memory release. Requested context limits may differ by backend. No current boundaries should be interpreted as an OS sandbox for future tool execution. Model compliance is never sufficient authorization for future file changes or commands.

## Future requirements

Project file access, patch approval, command isolation, persistence privacy, threat modeling, incident ownership, and distribution signing require design and verification when introduced. No external security audit has been performed.
