import { spawnSync } from 'node:child_process';

// npm supplies the CLI path on every supported platform. Keep its pregenerate
// hooks for search/brand assets, but suppress the separate station image build.
if (!process.env.npm_execpath) throw new Error('Use npm run generate:site');
const result = spawnSync(process.execPath, [process.env.npm_execpath, 'run', 'generate'], {
  env: { ...process.env, ONAIR_SKIP_STATION_OG: 'true' },
  stdio: 'inherit',
});
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
