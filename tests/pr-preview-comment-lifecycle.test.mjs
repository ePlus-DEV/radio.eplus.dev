import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/pr-preview-pages.yml', import.meta.url), 'utf8');
const status = workflow.split('  comment_status:')[1]?.split('  preview_config:')[0];
const build = workflow.split('  build:')[1]?.split('  publish:')[0];
const publish = workflow.split('  publish:')[1]?.split('  verify_live:')[0];
const verify = workflow.split('  verify_live:')[1]?.split('  finalize_comment:')[0];
const failure = workflow.split('  finalize_comment:')[1]?.split('  cleanup:')[0];

test('every eligible PR event hides previous Preview URL before rebuilding', () => {
  assert.match(workflow, /types: \[opened, reopened, synchronize, closed\]/);
  assert.ok(status, 'trusted status job must exist');
  assert.match(status, /pull-requests: write/);
  assert.match(status, /github\.event\.pull_request\.head\.repo\.full_name == github\.repository/);
  assert.match(status, /name: "Hide Preview URL while building or after PR closure"/);
  assert.match(status, /Building preview/);
  assert.match(status, /Preview expired/);
  assert.match(status, /onair-pr-preview/);
  assert.match(status, /onair-preview-head:/);
  assert.match(status, /onair-preview-run:/);
  assert.doesNotMatch(status, /\[Open preview\]|PREVIEW_SITE_ORIGIN|PAGES_DEPLOY_TOKEN|actions\/checkout/,
    'pending/closed comments cannot disclose an old Preview link or touch secrets/code');
  assert.match(build, /needs: \[preview_config, comment_status\]/);
  assert.match(build, /needs\.comment_status\.result == 'success'/);
});

test('a separate verifier exposes the link only after public SHA and noindex match', () => {
  assert.ok(verify, 'public verification job must exist');
  assert.match(verify, /needs: publish/);
  assert.match(verify, /published_sha.*EXPECTED_HEAD/);
  assert.match(verify, /grep -q 'noindex'/);
  assert.match(verify, /if \[ \"\$live\" != true \]/);
  assert.match(verify, /read -r state base_ref head repo/);
  assert.match(verify, /onair-preview-run:\$GITHUB_RUN_ID/);
  assert.match(verify, /onair-preview-head:\$EXPECTED_HEAD/);
  assert.match(verify, /Preview ready/);
  assert.match(verify, /\[Open preview\]/);
  assert.doesNotMatch(publish, /\[Open preview\]|Try preview \(publishing\)/);
});

test('failure and PR closure leave no Preview hyperlink in the bot comment', () => {
  assert.ok(failure, 'failure finalizer must exist');
  assert.match(failure, /always\(\)/);
  assert.match(failure, /needs\.verify_live\.result == 'failure'/);
  assert.match(failure, /needs\.publish\.result != 'success'/);
  assert.match(failure, /Preview unavailable/);
  assert.match(failure, /onair-preview-run:\$GITHUB_RUN_ID/);
  assert.doesNotMatch(failure, /\[Open preview\]|PREVIEW_SITE_ORIGIN/);
  assert.match(status, /\[ "\$EVENT_ACTION" = closed \]/);
  assert.match(status, /\[ "\$state" != closed \]/);
});

test('status/finalizer jobs never receive PR code or Preview deployment secrets', () => {
  for (const [name, section] of [['comment_status', status], ['verify_live', verify], ['finalize_comment', failure]]) {
    assert.ok(section, name);
    assert.doesNotMatch(section, /actions\/checkout|npm ci|secrets\.PAGES_DEPLOY_TOKEN|environment:\s*\n\s*name:/,
      name + ' must be metadata-only and credential-free');
  }
  assert.match(build, /persist-credentials: false/);
  assert.doesNotMatch(build, /secrets\.PAGES_DEPLOY_TOKEN/);
});

test('public verification waits separately without holding the publisher lock', () => {
  assert.match(publish, /timeout-minutes: 30/);
  assert.doesNotMatch(publish, /for attempt in \$\(seq|sleep 10/);
  assert.match(verify, /for attempt in \$\(seq 1 90\)/);
  assert.match(verify, /sleep 10/);
  assert.doesNotMatch(verify, /onair-pr-preview-publish/);
  assert.match(verify, /onair-pr-preview-verify-/);
});

test('publisher prunes only verified closed PR preview folders before uploading', () => {
  assert.match(publish, /for old_preview in/);
  assert.ok(publish.includes('old_number="${old_label#pr-}"'));
  assert.ok(publish.includes('[[ "$old_number" =~ ^[1-9][0-9]*$ ]]'));
  assert.ok(publish.includes('[ "$old_number" = "$PR_NUMBER" ] && continue'));
  assert.ok(publish.includes('gh api "repos/$GITHUB_REPOSITORY/pulls/$old_number" --jq .state'));
  assert.ok(publish.includes('[ "$old_state" = closed ]'));
  assert.ok(publish.includes('rm -rf -- "$old_preview"'));
  assert.ok(publish.includes('Cannot verify PR #$old_number; retain its Preview'));
  assert.doesNotMatch(publish, /git push --force/);
});


test('publisher overlays hashed Nuxt chunks and verifies every HTML reference before publishing', () => {
  assert.match(publish, /rsync -a --delete --exclude='\/_nuxt\/'/);
  assert.match(publish, /rsync -a "\$RUNNER_TEMP\/pr-output\/_nuxt\/" "\$preview_root\/_nuxt\/"/);
  assert.match(publish, /const assetPattern = \//);
  assert.match(publish, /missing\.push/);
  assert.match(publish, /Preview asset audit passed/);
  assert.match(publish, /if \(htmlCount === 0 \|\| assetCount === 0 \|\| missing\.length\)/);
  assert.match(verify, /entry_js=/);
  assert.match(verify, /entry_css=/);
  assert.match(verify, /"\$base"library\//);
  assert.match(verify, /\$PREVIEW_SITE_ORIGIN\$entry_js/);
  assert.match(verify, /\$PREVIEW_SITE_ORIGIN\$entry_css/);
});
