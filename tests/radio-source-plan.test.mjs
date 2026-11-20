import test from "node:test";
import assert from "node:assert/strict";

import {
  MAX_STREAM_ATTEMPTS,
  buildPlaybackSources,
  nextPlaybackIndex,
} from "../utils/radio-source-plan.mjs";

test("does not auto-proxy HLS manifests but keeps proxy fallback for plain streams", () => {
  const result = buildPlaybackSources(
    [
      {
        src: "https://radio.example/live.m3u8",
        type: "application/x-mpegURL",
        source: "primary",
      },
      { src: "https://backup.example/live.mp3", source: "alternative" },
    ],
    "https://cors.example/",
  );

  assert.deepEqual(
    result.map((item) => [item.src, Boolean(item.proxied)]),
    [
      ["https://radio.example/live.m3u8", false],
      ["https://backup.example/live.mp3", false],
      ["https://cors.example/https://backup.example/live.mp3", true],
    ],
  );
});

test("does not mistake backup HLS URL mentions for an HLS stream", () => {
  const result = buildPlaybackSources(
    [
      { src: "https://radio.example/live.mp3?backup=alternate.m3u8" },
      { src: "https://radio.example/live.mp3#fallback.m3u8" },
      { src: "https://radio.example/live.m3u8?token=abc" },
      { src: "https://radio.example/live?backup=alternate.m3u8", type: "application/x-mpegURL" },
    ],
    "https://cors.example/",
  );

  assert.deepEqual(result.map(item => [item.src, Boolean(item.proxied)]), [
    ["https://radio.example/live.mp3?backup=alternate.m3u8", false],
    ["https://cors.example/https://radio.example/live.mp3?backup=alternate.m3u8", true],
    ["https://radio.example/live.mp3#fallback.m3u8", false],
    ["https://cors.example/https://radio.example/live.mp3#fallback.m3u8", true],
    ["https://radio.example/live.m3u8?token=abc", false],
    ["https://radio.example/live?backup=alternate.m3u8", false],
  ]);
});

test("does not proxy a source that is already proxied", () => {
  const result = buildPlaybackSources(
    [
      {
        src: "https://cors.example/https://radio.example/live.mp3",
        proxied: true,
      },
    ],
    "https://cors.example/",
  );

  assert.equal(result.length, 1);
});

test("deduplicates sources and proxy variants", () => {
  const result = buildPlaybackSources(
    [
      { src: "https://radio.example/live.mp3" },
      { src: "https://radio.example/live.mp3" },
    ],
    "https://cors.example/",
  );

  assert.equal(result.length, 2);
});

test("keeps a single direct HLS candidate when the catalog marks it direct", () => {
  const result = buildPlaybackSources(
    [
      {
        src: "https://multi-playlist.example/live/index.m3u8",
        type: "application/x-mpegURL",
        proxied: false,
      },
    ],
    "https://cors.example/",
  );

  assert.deepEqual(result, [
    {
      src: "https://multi-playlist.example/live/index.m3u8",
      type: "application/x-mpegURL",
      proxied: false,
    },
  ]);
});

test("cycles playback candidates while the global retry budget remains", () => {
  assert.equal(nextPlaybackIndex(0, 4), 1);
  assert.equal(nextPlaybackIndex(3, 4), 0);
  assert.equal(nextPlaybackIndex(0, 0), -1);
  assert.equal(nextPlaybackIndex(undefined, 3), 0);
  assert.equal(nextPlaybackIndex(NaN, 3), 0);
  assert.equal(nextPlaybackIndex(-1, 3), 0);
  assert.equal(nextPlaybackIndex(99, 3), 0);
  assert.equal(nextPlaybackIndex(1, 3), 2);
  assert.equal(MAX_STREAM_ATTEMPTS, 6);
});

test("ignores invalid, unsafe or credential-bearing proxy configuration", () => {
  const source = [{ src: "https://radio.example/live.mp3" }];
  for (const proxy of [
    "not-a-url",
    "ftp://proxy.example",
    "https://user:secret@proxy.example/",
    "https://proxy.example/?key=secret",
    "https://proxy.example/#fragment",
  ]) {
    assert.deepEqual(buildPlaybackSources(source, proxy).map(item => item.src),
      ["https://radio.example/live.mp3"], proxy);
  }
});

test("preserves valid HTTP(S) proxy fallback without a trailing slash", () => {
  assert.deepEqual(
    buildPlaybackSources([{ src: "https://radio.example/live.mp3" }], "https://proxy.example")
      .map(item => item.src),
    ["https://radio.example/live.mp3", "https://proxy.example/https://radio.example/live.mp3"],
  );
});


test("does not disclose embedded stream credentials through a CORS proxy", () => {
  const sources = [
    { src: "https://user:secret@radio.example/live.mp3" },
    { src: "https://user@radio.example/live.aac" },
    { src: "https://radio.example/live.mp3" },
  ];
  const result = buildPlaybackSources(sources, "https://cors.example/");
  assert.deepEqual(result.map(item => item.src), [
    "https://user:secret@radio.example/live.mp3",
    "https://user@radio.example/live.aac",
    "https://radio.example/live.mp3",
    "https://cors.example/https://radio.example/live.mp3",
  ]);
  assert.equal(result.filter(item => item.proxied).length, 1);
});


test("never forwards signed query credentials to a third-party proxy", () => {
  const sources = [
    { src: "https://radio.example/live.mp3?token=private-test-value" },
    { src: "https://radio.example/live.aac?accessKey=private-test-value" },
    { src: "https://radio.example/live.mp3?Signature=private-test-value" },
    { src: "https://radio.example/live.mp3?quality=high" },
  ];
  const result = buildPlaybackSources(sources, "https://cors.example/");
  assert.deepEqual(result.map(item => item.src), [
    ...sources.slice(0, 3).map(item => item.src),
    "https://radio.example/live.mp3?quality=high",
    "https://cors.example/https://radio.example/live.mp3?quality=high",
  ]);
});

test("never forwards cloud-provider signed stream query parameters to a third-party proxy", () => {
  const signed = [
    "https://radio.example/live.mp3?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=test&X-Amz-Signature=test",
    "https://radio.example/live.aac?X-Amz-Security-Token=test",
    "https://radio.example/live.mp3?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Signature=test",
    "https://radio.example/live.mp3?AWSAccessKeyId=test",
    "https://radio.example/live.mp3?GoogleAccessId=test",
  ];
  const ordinary = "https://radio.example/live.mp3?quality=high";
  const result = buildPlaybackSources(
    [...signed, ordinary].map(src => ({ src })),
    "https://cors.example/",
  );
  assert.deepEqual(result.map(item => item.src), [
    ...signed,
    ordinary,
    `https://cors.example/${ordinary}`,
  ]);
  assert.equal(result.filter(item => item.proxied).length, 1);
});
