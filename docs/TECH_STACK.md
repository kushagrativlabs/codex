# Technology Stack

No application dependencies are installed and no versions are pinned. Existing host tools and model smoke results are recorded in [Phase 0](../planning/PHASE_0.md). Tauri + React/TypeScript + Rust + Ollama was approved on 2026-10-23; it is not yet implemented. SQLite remains proposed.

| Layer | Selection | Purpose |
| --- | --- | --- |
| Desktop shell | Tauri | Shared macOS, Ubuntu, and Windows app |
| Interface | React and TypeScript | Chat, project navigation, and diff review |
| Native application core | Rust | File access, process control, and agent coordination |
| Model runtime | Ollama, separately installed | Local inference through a replaceable provider adapter |
| Local persistence | SQLite (proposed) | Projects and conversation history |
| Model | Undecided | Benchmark a small quantized coding model on M2/8 GB |

SwiftUI was an earlier recommendation for a macOS-only app. The shared desktop proposal reflects the expanded platform target; no source migration is needed because no application exists.

Select supported versions, build tools, and testing dependencies during Phase 0. Do not infer equivalent model performance across different hardware.

References: [Tauri](https://tauri.app/concept/architecture/), [Ollama](https://ollama.com/download).
