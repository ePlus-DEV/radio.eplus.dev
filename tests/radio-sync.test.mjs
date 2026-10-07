import test from "node:test";
import assert from "node:assert/strict";

import {
  extractStationCandidates,
  extractStationImageCandidates,
  imageExtension,
  getMwynikiCountryPage,
  extractMwynikiFlagUrl,
  polishSlug,
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


test("imageExtension supports common favicon formats", () => {
  assert.equal(imageExtension("image/x-icon", "https://example.com/favicon.ico"), "ico");
  assert.equal(imageExtension("image/vnd.microsoft.icon", "https://example.com/favicon"), "ico");
  assert.equal(imageExtension("image/avif", "https://example.com/logo"), "avif");
});

test("extractStationImageCandidates prioritizes page metadata and icons", () => {
  const html = `
    <meta property="og:image" content="/assets/logo.png">
    <meta name="twitter:image" content="https://cdn.example.com/radio.webp">
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="icon" href="/favicon.ico">
  `;

  assert.deepEqual(
    extractStationImageCandidates(html, "https://radio.example/live"),
    [
      "https://radio.example/assets/logo.png",
      "https://cdn.example.com/radio.webp",
      "https://radio.example/apple-touch-icon.png",
      "https://radio.example/favicon.ico",
    ],
  );
});

test("extractStationImageCandidates handles href-before-rel link markup", () => {
  const html = '<link href="/station-icon.png" sizes="192x192" rel="icon">';
  assert.deepEqual(
    extractStationImageCandidates(html, "https://radio.example/"),
    ["https://radio.example/station-icon.png"],
  );
});


test("polishSlug handles Polish country names used by mWyniki", () => {
  assert.equal(polishSlug("Łotwa"), "lotwa");
  assert.equal(polishSlug("Wietnam"), "wietnam");
  assert.equal(polishSlug("Wybrzeże Kości Słoniowej"), "wybrzeze-kosci-sloniowej");
});

test("getMwynikiCountryPage builds the national-team page from country code", () => {
  assert.equal(
    getMwynikiCountryPage({ slug: "lithuania" }, { cca2: "LT" }),
    "https://www.mwyniki.pl/litwa/",
  );
  assert.equal(
    getMwynikiCountryPage({ slug: "latvia" }, { cca2: "LV" }),
    "https://www.mwyniki.pl/lotwa/",
  );
});

test("extractMwynikiFlagUrl finds the country logo image", () => {
  const html = '<img class="team-logo" alt="Logo Litwa" src="/images/responsive/flags/118.png">';
  assert.equal(
    extractMwynikiFlagUrl(html, "https://www.mwyniki.pl/litwa//druzyny/litwa_1/"),
    "https://www.mwyniki.pl/images/responsive/flags/118.png",
  );
});


test("extractStationImageCandidates ignores favicon links and ICO files", () => {
  const html = [
    '<meta property="og:image" content="/logo.png">',
    '<link rel="icon" href="/favicon.ico">',
    '<link rel="apple-touch-icon" href="/touch.png">',
  ].join("");
  assert.deepEqual(
    extractStationImageCandidates(html, "https://example.com/"),
    ["https://example.com/logo.png"],
  );
});

test("imageExtension rejects ICO artwork", () => {
  assert.equal(imageExtension("image/x-icon", "https://example.com/favicon.ico"), "");
  assert.equal(imageExtension("image/vnd.microsoft.icon", "https://example.com/favicon.ico"), "");
});
