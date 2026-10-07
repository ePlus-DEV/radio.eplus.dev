import test from "node:test";
import assert from "node:assert/strict";

import {
  extractStationCandidates,
  mergeStations,
  normalizeStreamIdentity,
  resolveCountryTimezone,
} from "../scripts/sync-instant-audio.mjs";

test("resolveCountryTimezone preserves an existing timezone", () => {
  assert.equal(
    resolveCountryTimezone(
      { timezone: "Europe/Athens" },
      { timezone: "UTC" },
    ),
    "Europe/Athens",
  );
});

test("resolveCountryTimezone uses metadata for a new country", () => {
  assert.equal(
    resolveCountryTimezone({}, { timezone: "Europe/Zagreb" }),
    "Europe/Zagreb",
  );
});

test("resolveCountryTimezone falls back to UTC only when no timezone exists", () => {
  assert.equal(resolveCountryTimezone({}, {}), "UTC");
});

test("normalizeStreamIdentity removes fragments, trailing slash, and case differences", () => {
  assert.equal(
    normalizeStreamIdentity("HTTPS://EXAMPLE.COM/Live/#player"),
    normalizeStreamIdentity("https://example.com/live"),
  );
});

test("mergeStations skips duplicate stream URLs", () => {
  const existing = {
    alpha: {
      title: "Alpha",
      stream: "https://stream.example/live/",
      favorite: true,
    },
  };

  const discovered = {
    duplicate: {
      title: "Duplicate",
      stream: "HTTPS://STREAM.EXAMPLE/live#player",
      favorite: true,
    },
  };

  const result = mergeStations(existing, discovered);

  assert.equal(result.added, 0);
  assert.deepEqual(result.stations, existing);
});

test("mergeStations does not create a second favorite", () => {
  const existing = {
    alpha: {
      title: "Alpha",
      stream: "https://stream.example/alpha",
      favorite: true,
    },
  };

  const discovered = {
    beta: {
      title: "Beta",
      stream: "https://stream.example/beta",
      favorite: true,
    },
  };

  const result = mergeStations(existing, discovered);

  assert.equal(result.added, 1);
  assert.equal(result.stations.alpha.favorite, true);
  assert.equal("favorite" in result.stations.beta, false);
});

test("mergeStations keeps only the first favorite when importing into an empty country", () => {
  const discovered = {
    alpha: {
      title: "Alpha",
      stream: "https://stream.example/alpha",
      favorite: true,
    },
    beta: {
      title: "Beta",
      stream: "https://stream.example/beta",
      favorite: true,
    },
  };

  const result = mergeStations({}, discovered);

  assert.equal(result.added, 2);
  assert.equal(result.stations.alpha.favorite, true);
  assert.equal("favorite" in result.stations.beta, false);
});

test("extractStationCandidates accepts valid station slugs from the trusted station list", () => {
  const html = `
    <ul id="dynamic-radio-stations">
      <li>
        <a href="/contact/">
          <img src="/img/contact.png">
          Radio Contact
        </a>
      </li>
    </ul>
  `;

  const result = extractStationCandidates(html, "https://example.com");

  assert.equal(result.length, 1);
  assert.equal(result[0].slug, "contact");
  assert.equal(result[0].title, "Radio Contact");
  assert.equal(result[0].imageUrl, "https://example.com/img/contact.png");
});

test("extractStationCandidates excludes reserved navigation pages outside the trusted list", () => {
  const html = `
    <a href="/about/">About</a>
    <a href="/radio-one/">Radio One</a>
    <a href="https://other.example/radio-two/">Radio Two</a>
  `;

  const result = extractStationCandidates(html, "https://example.com");

  assert.deepEqual(
    result.map((station) => station.slug),
    ["radio-one"],
  );
});
