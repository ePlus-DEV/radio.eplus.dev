import { spawnSync } from 'node:child_process';
import { createPrPreviewEnvironment } from '../utils/pr-preview-config.mjs';

const env = createPrPreviewEnvironment(process.env);
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error('Run via npm run build:pr-preview.');

function run(args) {
  const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status || 1);
}

console.log('Building Cloudflare Pages PR preview: ' + env.NUXT_PUBLIC_SITE_URL);
run([npmCli, 'run', 'generate:site']);
run(['scripts/assert-staging-noindex.mjs']);
run(['scripts/assert-ga4-output.mjs', '.output/public', 'staging']);
run(['scripts/assert-project-pages-output.mjs', '.output/public', 'custom-domain']);
run(['scripts/check-pages-build.mjs', '.output/public', 'staging']);
console.log('Preview build complete: noindex, no production GA4, root-relative assets.');
