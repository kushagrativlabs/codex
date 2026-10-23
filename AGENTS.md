# AI Development Instructions

## Session workflow

1. Read this file, relevant requirements and architecture documents, then `planning/CONTEXT.md` and `planning/TASKS.md`.
2. Inspect existing functionality, dependencies, and affected modules before changing anything.
3. Define the requested scope, acceptance criteria, and potential side effects.
4. Implement the smallest maintainable change; reuse existing functions, services, and components, and avoid duplicate implementations.
5. Run relevant tests and validation. Report failures, skipped checks, and limitations; never claim completion without verification.
6. Synchronize documentation with verified changes. Update `planning/TASKS.md` and `planning/CONTEXT.md` after significant completed work.

## Project rules

- Phase 1 implements Tauri + React/TypeScript + Rust + Ollama local chat. macOS is validated; Windows/Ubuntu remain unverified. See `docs/DECISIONS.md` and `planning/PHASE_1_VERIFICATION.md`.
- Follow the established architecture and conventions once they exist; see `docs/ARCHITECTURE.md` and `docs/CODING_STANDARDS.md`.
- Do not introduce unnecessary dependencies. Obtain approval before selecting or changing the technology stack.
- Assess migration, compatibility, and data impact before modifying database schemas.
- Never expose credentials, tokens, API keys, personal data, or sensitive configuration in code, documentation, logs, or tool output.
- Never run destructive commands without explicit approval.
- Write maintainable, secure, production-quality code; add or update relevant tests when functionality changes.
- Preserve useful existing documentation. Distinguish verified implementation from proposals and mark uncertain claims **Needs Verification**.
- Do not invent requirements, API contracts, completed tasks, release history, or decision rationale.
- Documentation setup does not authorize application implementation, dependency installation, migrations, infrastructure changes, or deployment. Follow the scope of each user request.

## Validation commands

Use `npm test`, `npm run build`, `npm run test:rust`, and `npm run lint:rust` as appropriate. Backend fixture tests need local sockets. Run `npm run desktop` for the app; `npm run dev` is layout preview only. Do not resume model benchmarks unless requested or needed to investigate a new functional issue.

## References

Use `docs/PRD.md` for requirements, `docs/SECURITY.md` for security guidance, `docs/TESTING.md` for validation, and `docs/DECISIONS.md` for approved decisions.
