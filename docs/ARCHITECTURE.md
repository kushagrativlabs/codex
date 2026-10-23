# Architecture

## Current architecture

The workspace contains Markdown documentation under the root, `docs/`, and `planning/`. There are no application modules, runtime services, or implemented data flows.

## Pending design

Frontend/backend boundaries, module layout, persistence, external integrations, authentication, and hosting are undecided. Do not infer that a separate frontend, backend, or database is required.

Once requirements are approved, document entry points, module responsibilities, trust boundaries, external dependencies, data ownership, and key request/data flows using actual file references. Record significant approved choices in [DECISIONS.md](DECISIONS.md).

## Proposed desktop architecture

UI → native agent coordinator → validated tool dispatcher / model-provider adapter. The provider connects to local Ollama; tools access only approved project resources, with explicit review for edits and commands. SQLite is proposed for local session storage. No component is implemented. See [ROADMAP.md](ROADMAP.md) for staged delivery and execution-boundary requirements.
