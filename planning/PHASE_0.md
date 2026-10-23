# Phase 0 — Scope and Feasibility

Date: 2026-10-23. Status: complete for planning and feasibility, with remaining model qualification explicitly deferred by the user. This phase does not authorize deployment or public repository uploads.

## Scope baseline

User direction: local-model coding assistant for macOS, Ubuntu, and Windows; initial hardware is M2 with 8 GB RAM. First complete workflow: choose a project, ask a repository question, request a small change, review a diff, apply approved edits, and approve a verification command. Deliver it incrementally through Phases 1–4.

No cloud fallback, unrestricted shell autonomy, multi-agent execution, embedded inference runtime, or full IDE is included in the initial scope. Models can request tools; the native application owns validation, permission checks, and execution. Treat repository text and model output as untrusted.

## Approved application stack

Tauri, React, TypeScript, Rust, and separately installed Ollama were explicitly approved by the user on 2026-10-23. Tauri 2 is the proposed major version. Add SQLite when persistence is implemented in Phase 5. Pin exact compatible versions during application scaffolding. No dependencies are installed by this phase.

Use a narrow native bridge: the UI cannot execute arbitrary commands or access arbitrary files. The Rust core owns model calls, project boundaries, cancellation, approval records, and tool dispatch. File access must handle canonical paths, symlinks, stale content, and platform differences. Command approval is not an OS sandbox.

## Proposed support matrix

| Platform | Initial target | Validation environment |
| --- | --- | --- |
| macOS | Apple Silicon; develop on observed macOS 27.0.1 | Current M2/8 GB machine |
| Ubuntu | 24.04 LTS, x86_64 initially | Not available in this session |
| Windows | Windows 11, x86_64 initially | Not available in this session |

These are proposed test targets, not verified support claims or promises of minimum compatibility. Mac Intel and Windows/Linux ARM are deferred. Verify installers and the core workflow on each target before release.

## Observed environment

- arm64 macOS 27.0.1; physical RAM 8,589,934,592 bytes.
- Node.js 22.14.0; npm 10.9.2.
- Apple command-line tools selected; clang 21.0.0. No full application build has been attempted.
- Rust/cargo absent from PATH; the standard user cargo directory is absent.
- Ollama client reports 0.40.8. Local service responds when sandbox access is allowed.
- qwen3:4b is already installed; no download needed. Other installed models are not automatically approved as defaults.
- Approximately 167 GiB disk space available at inspection.
- Baseline swap: 8,777.81 MiB used. Existing workload makes clean-machine performance conclusions unreliable; do not close user applications or stop preexisting model workloads without authorization.

## Benchmark protocol and thresholds

Define these gates before inspecting results. They are proposed product targets, not model performance claims.

Initial smoke test uses synthetic prompts only, qwen3:4b, 2,048-token context, 160-token output cap, temperature 0, and thinking disabled. Capture model details, API capabilities, load duration, first visible output, total duration, output tokens, completion reason, and swap before/after. Tool requests are recorded, never executed. A socket timeout is 60 seconds; an elapsed budget is checked between streamed chunks, so it is not a guaranteed hard deadline.

Smoke gates:

1. Explain: correctly identify empty-array NaN and reference src/math.ts.
2. Edit: return a valid mean function, return 0 for empty input, and use no dependencies. Manual review only until an executable check is run.
3. Tool: emit read_file with path src/math.ts rather than invent file contents.
4. Warm interactive target: first visible output within 5 seconds and each short response within 30 seconds. Record cold load separately.
5. Never promote a truncated response to a quality pass.

One run per prompt is only a feasibility smoke test. Full agent qualification requires at least 20 independently specified cases, 90% correct task outcomes, valid tool schemas in every attempted call, and application-enforced permission checks passing regardless of model behavior. Include refusal to invent unseen file contents, multi-step tool-result handling, prompt injection, malformed arguments, and edit conflicts.

Remaining measurements: three warm repetitions per task; 4,096-token context trial if memory permits; a 15-minute interaction soak; responsive UI; generation cancellation and engine release behavior; sampled model/process memory and OS pressure over time. Proposed memory gate: no sustained critical pressure or observable system stalls, and no greater than 512 MiB additional swap during the controlled soak. Existing swap is not itself an inference failure. API generation timings do not measure desktop UI responsiveness.

## Completion gate

Phase 0 remains open until stack/scope approval, model suitability evidence, remaining resource/cancellation checks, and OS validation arrangements are recorded. If native tool calling is unreliable, keep Phase 1 read-only chat and evaluate alternatives before agent edits or commands.

## References

- [Roadmap](../docs/ROADMAP.md)
- [Tauri prerequisites](https://tauri.app/start/prerequisites/)
- [Ollama chat API](https://docs.ollama.com/api/chat)
- [qwen3:4b catalog entry](https://ollama.com/library/qwen3:4b)

## Initial smoke results — not a qualification pass

Raw evidence: [benchmark JSON](benchmarks/phase0-m2-8gb.json). Synthetic prompt source is included in the [benchmark runner](benchmarks/run_smoke.py). Run the script from the repository root using Python 3 only when local inference is authorized. It loads an already-installed model; it never downloads one or executes model-requested tools. The runner now requires `--output` and refuses existing output paths to preserve evidence. Example: `python3 planning/benchmarks/run_smoke.py --model qwen3.5:0.8b --output planning/benchmarks/new-run.json`.

| Task | First output | Total | Outcome |
| --- | --- | --- | --- |
| Explain empty-array behavior (cold load) | 11.06 s | 17.03 s | Fail: incorrect TypeError claim; truncated at output limit |
| Generate mean function (warm) | 0.29 s | 5.97 s | Fail strict output contract: function looks correct on manual review, but response includes prose and a closing thinking tag |
| Request read_file (warm) | 0.66 s | 6.06 s | Single-case tool schema/path pass; no tool execution or follow-up tested |

Generation throughput was approximately 26–28 tokens/second for these short samples; cold model load was 10.31 seconds. First output includes unwanted prose and is not equivalent to time to a correct answer. Reasoning-like prose appeared in content despite requesting think=false; cause is unverified and requires template/runtime investigation rather than UI string stripping assumptions.

Ollama reports Q4_K_M, 4.0B parameters, and a 2,048-token context. Reported loaded model allocation was 2,876,160,081 bytes (about 2.68 GiB), not total application/system memory.

Swap increased from 8,657.81 MiB to 11,184.75 MiB (2,526.94 MiB). This concurrent-workload observation cannot establish model-only causality or the controlled-soak gate, but it prevents claiming an 8 GB memory pass. No soak, cancellation, context-scaling, repeated trials, automated code compilation, or Windows/Ubuntu validation was performed.

Conclusion: local inference and a basic structured tool request work, but this configuration is not qualified as the default coding agent. Recommended scope adjustment is read-only chat first, followed by evaluating an already-installed smaller tool-capable model and investigating output formatting. Defer larger models and additional downloads until memory headroom and model quality are understood.

## Smaller-model follow-up and stack approval

User approved Tauri + React/TypeScript + Rust + Ollama. See [ADR-001](../docs/DECISIONS.md). SQLite and exact dependency versions remain undecided. Approval of the stack is not approval for public uploads or deployment.

Evidence: [smaller-model results](benchmarks/phase0-qwen35-08b.json) and [interruption results](benchmarks/phase0-cancellation.json).

The already-installed qwen3.5:0.8b reports 852.88M parameters, MXFP8, and an MLX runner through Ollama. It is not a 4-bit model. Its loaded allocation was 1,394,798,928 bytes (about 1.30 GiB).

| Task | First output | Total | Outcome |
| --- | --- | --- | --- |
| Explain (cold) | 6.10 s | 6.56 s | Fail: incorrectly says reduce returns undefined and describes a division-by-zero error |
| Generate mean (warm) | 0.23 s | 1.25 s | Function passed five executed cases after removing the Markdown fence; strict raw-code output contract failed due to the fence |
| Request read_file (warm) | 0.76 s | 0.76 s | Single-case valid tool name and path; no autonomous execution performed |

The generated mean function passed empty, singleton, positive, mixed-sign, and fractional cases using Node 22.14.0 experimental TypeScript stripping. A separate reference expression confirmed NaN for empty-array mean. These checks do not establish general coding reliability or full TypeScript type-checking.

Swap grew from 7,335.50 to 8,923.44 MiB (1,587.94 MiB) during the smaller-model smoke run. Different baselines and concurrent system activity prevent a controlled relative memory comparison. Do not claim a memory gate pass.

A separate long-generation probe closed the HTTP response after eight content chunks, before done. Client close took approximately 0.11 milliseconds; a subsequent request returned OK in 0.53 seconds. This verifies transport closure and service recovery only. Engine computation cancellation, UI cancellation, process termination, and memory release were not instrumented.

Next: keep initial scope at read-only chat with selectable installed models, no claimed qualified default. Resolve runtime build prerequisites during Phase 1 preparation. Repeat model evaluations under a lighter controlled workload before enabling automated editing; retain all permission gates regardless of model quality. Phase 0 remains open for full qualification and platform validation arrangements.

## Phase 0 closure — user-directed benchmark deferral

On 2026-10-23, the user stated that 3B and 4B models work well in their own testing and instructed us to skip further model testing. Accept that instruction as the basis for proceeding. It is user-reported experience, not independently reproduced performance or a general model qualification claim. Exact user-tested model tags and settings were not supplied.

This direction supersedes earlier sections that keep Phase 0 open pending further benchmarks. No additional model benchmarks are required before Phase 1. Keep existing results as historical evidence; do not present their failures as blockers to building the requested chat client.

### Additional tests completed before the deferral

- [0.8B results](benchmarks/phase0-quality-20.json): 11/20 exact-output cases, all nine repeats passed.
- [1.5B results](benchmarks/phase0-quality-qwen25-15b.json): 18/20 exact-output cases, all nine repeats passed. The two failures returned incorrect JavaScript nullish/OR results.
- These are narrow synthetic tests, not a representative coding-agent benchmark. No model-requested tool was executed. A failed exact output is not automatically a security failure: the 0.8B injection case resisted the injected instruction but did not return the required literal SAFE.
- Both runs started with no loaded models and verified the test model was absent from /api/ps after an explicit unload. This confirms model unload reporting, not general generation-cancellation telemetry or immediate recovery of system swap.

### Decisions carried into Phase 1

- Use approved Tauri + React/TypeScript + Rust + separately installed Ollama.
- Let the user choose an already-installed model, including their preferred 3B/4B option. Do not hard-code the benchmark's smaller models as the default.
- Initial release scope is local chat: model selection, streaming, stop, and helpful runtime errors. Repository access, edits, and command execution remain in later phases.
- Keep one inference request active at a time; start with bounded context and output settings, then make limits clear and configurable as appropriate.
- Proposed validation targets remain current Apple Silicon macOS, Ubuntu 24.04 x86_64, and Windows 11 x86_64. Exact minimum versions and actual Windows/Ubuntu builds remain unverified; they are implementation/release gates, not completed support claims.
- Rust installation and a native build check belong to Phase 1 setup. No application dependencies or model downloads have been installed during Phase 0.

### Deferred checks

The remaining controlled memory soak, context scaling, further model accuracy cases, and engine cancellation instrumentation are deferred by user direction. Actual application streaming, cancellation, permission behavior, and cross-platform builds must still be verified when implemented; skipping model benchmarks does not waive functional application tests.

Outcome: proceed to Phase 1 using [PHASE_1_HANDOFF.md](PHASE_1_HANDOFF.md). Phase 1 has not started; no desktop application is implemented.
