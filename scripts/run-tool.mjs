import { existsSync } from 'node:fs';
import { dirname, join, delimiter } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const env = { ...process.env };
const localCargo = join(root, '.toolchains', 'cargo');
const executable = process.platform === 'win32' ? 'cargo.exe' : 'cargo';
if (existsSync(join(localCargo, 'bin', executable))) {
  env.CARGO_HOME = localCargo;
  env.RUSTUP_HOME = join(root, '.toolchains', 'rustup');
  env.PATH = join(localCargo, 'bin') + delimiter + (env.PATH ?? '');
}
const [tool, ...args] = process.argv.slice(2);
const command = tool === 'tauri' ? process.execPath : tool === 'cargo' ? executable : null;
if (!command) { console.error('Expected tauri or cargo'); process.exit(1); }
const toolArgs = tool === 'tauri' ? [join(root, 'node_modules', '@tauri-apps', 'cli', 'tauri.js'), ...args] : args;
const result = spawnSync(command, toolArgs, { cwd: root, env, stdio: 'inherit' });
if (result.error) { console.error(result.error.message); process.exit(1); }
process.exit(result.status ?? 1);
