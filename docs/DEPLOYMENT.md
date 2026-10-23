# Local Builds and Distribution

## Verified development build

On the Apple Silicon development Mac:

```sh
npm ci
npm run desktop:build -- --debug --bundles app
```

The output is `src-tauri/target/debug/bundle/macos/Local Code.app`. Open it directly. The command builds locally and does not publish, upload, install into /Applications, notarize, or deploy a service.

`npm run desktop` runs Tauri development mode; `npm run dev` is only a browser layout preview. The wrapper in `scripts/run-tool.mjs` recognizes the ignored local Rust installation or uses a standard system toolchain. `.cargo/config.toml` limits native build jobs to two for the initial 8 GB machine.

## Intended platform coverage

The Tauri configuration allows native platform bundle targets; actual Windows 11 x86_64 and Ubuntu 24.04 x86_64 builds/installers have not been produced or verified. Follow [platform prerequisites](https://tauri.app/start/prerequisites/) and test in native environments before making support claims. A successful Mac build does not validate those targets.

## Release work pending

No CI/CD, hosted infrastructure, auto-update service, published releases, distribution signing/notarization, or rollback mechanism is configured. Before release, verify native installers, runtime setup, privacy behavior, signing credentials, supported OS versions, and upgrade/recovery procedures. Do not store distribution credentials in tracked files.
