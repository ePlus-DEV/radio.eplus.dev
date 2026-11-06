import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/pr-preview-pages.yml', import.meta.url), 'utf8');
const status = workflow.split('  comment_status:')[1]?.split('  preview_config:')[0];
const build = workflow.split('  build:')[1]?.split('  publish:')[0];
const publish = workflow.split('  publish:')[1]?.split('  finalize_comment:')[0];
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

test('publisher advertises ready only after SHA and noindex; otherwise publishing', () => {
  assert.ok(publish, 'publish job must exist');
  const check = publish.indexOf('Check public Preview once without waiting for Pages');
  const comment = publish.indexOf('Report verified or publishing Preview for current PR/run');
  assert.ok(check >= 0 && comment > check);
  assert.match(publish, /published_sha.*EXPECTED_HEAD/);
  assert.match(publish, /grep -q 'noindex'/);
  assert.match(publish, /echo "live=true"/);
  assert.match(publish, /echo "live=false"/);
  assert.match(publish, /LIVE_VERIFIED:.*steps\.live_check\.outputs\.live/);
  assert.match(publish, /\$LIVE_VERIFIED/);
  assert.match(publish, /Preview ready/);
  assert.match(publish, /Preview publishing/);
  assert.match(publish, /older build or 404/);
  assert.match(publish, /read -r state base head repo/);
  assert.match(publish, /onair-preview-run:\$GITHUB_RUN_ID/);
  assert.match(publish, /gh api -X PATCH/);
  assert.doesNotMatch(publish, /gh api -X POST "repos\/\$GITHUB_REPOSITORY\/issues\/\$PR_NUMBER\/comments"/);
});

test('failure and PR closure leave no Preview hyperlink in the bot comment', () => {
  assert.ok(failure, 'failure finalizer must exist');
  assert.match(failure, /always\(\)/);
  assert.match(failure, /needs\.publish\.result != 'success'/);
  assert.match(failure, /Preview unavailable/);
  assert.match(failure, /onair-preview-run:\$GITHUB_RUN_ID/);
  assert.doesNotMatch(failure, /\[Open preview\]|PREVIEW_SITE_ORIGIN/);
  assert.match(status, /\[ "\$EVENT_ACTION" = closed \]/);
  assert.match(status, /\[ "\$state" != closed \]/);
});

test('status/finalizer jobs never receive PR code or Preview deployment secrets', () => {
  for (const [name, section] of [['comment_status', status], ['finalize_comment', failure]]) {
    assert.ok(section, name);
    assert.doesNotMatch(section, /actions\/checkout|npm ci|secrets\.PAGES_DEPLOY_TOKEN|environment:\s*\n\s*name:/,
      name + ' must be metadata-only and credential-free');
  }
  assert.match(build, /persist-credentials: false/);
  assert.doesNotMatch(build, /secrets\.PAGES_DEPLOY_TOKEN/);
});

test('a slow GitHub Pages/CDN deployment never holds the publisher open', () => {
  assert.match(publish, /timeout-minutes: 30/);
  assert.doesNotMatch(publish, /for attempt in \$\(seq|sleep 10|sleep 8/);
  assert.match(publish, /--max-time 4/);
  assert.match(publish, /--max-time 6/);
  assert.match(publish, /Preview publishing/);
  assert.match(publish, /Public Preview serves the expected SHA and noindex/);
  assert.ok(!status.includes('[Open preview]'), 'do not expose old links before build');
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
