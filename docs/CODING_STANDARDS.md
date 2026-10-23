# Coding Standards

## Existing conventions

Phase 1 uses React function components, strict TypeScript, CSS classes, and Rust modules with serde types. Keep UI state in the frontend and network validation/cancellation in the native core.

## Baseline practices

- Use clear names and small, cohesive modules with explicit responsibilities.
- Reuse existing behavior before adding abstractions or dependencies.
- Keep changes focused on the requested task.
- Validate external input and handle errors deliberately.
- Keep secrets outside tracked files; avoid logging sensitive data.
- Add relevant behavioral tests when functionality changes.
- Adopt language-specific formatting and linting after stack approval; record actual commands here.

## Documentation conventions

Use descriptive Markdown headings and relative links within repository documents. Separate verified facts, proposals, and unknowns. Reference real paths and avoid duplicating detailed explanations across files.

Frontend code is under `src/`; native code under `src-tauri/src/`. Use `npm run format:rust` and `npm run lint:rust`. TypeScript is checked by `npm run build`; no frontend formatter/linter is configured. Add meaningful regression checks for changed behavior.
