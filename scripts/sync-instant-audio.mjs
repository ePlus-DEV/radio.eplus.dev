#!/usr/bin/env node

import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const INSTANT_HOME = "https://instant.audio/";
const API_BASE = "https://api.instant.audio/data/streams";
const USER_AGENT =
  "Radio-ePlus-Data-Sync/1.0 (+https://github.com/ePlus-DEV/radio.eplus.dev)";

const args = new Map(
  process.argv.slice(2).map((arg) => {
    const [key, ...value] = arg.replace(/^--/, "").split("=");
    return [key, value.length ? value.join("=") : "true"];
  }),
);

const dryRun = args.get("dry-run") === "true";
const refreshExisting = args.get("refresh-existing") === "true";
const requestedCountry = args.get("country") || "";
const maxCountries = Math.max(1, Number(args.get("max-countries") || 3));
const maxStations = Math.max(0, Number(args.get("max-stations") || 0));

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const COUNTRY_ALIASES = {
  "haïti": "haiti",
  "méxico": "mexico",
  "república dominicana": "dominican-republic",
  "panamá": "panama",
  "perú": "peru",
  "brasil": "brazil",
  "belgië": "belgium",
  "česká republika": "czechia",
  "deutschland": "germany",
  "eesti": "estonia",
  "españa": "spain",
  "hellas": "greece",
  "hrvatska": "croatia",
  "italia": "italy",
  "latvija": "latvia",
  "lëtzebuerg": "luxembourg",
  "lietuva": "lithuania",
  "magyarország": "hungary",
  "nederland": "netherlands",
  "norge": "norway",
  "österreich": "austria",
  "polska": "poland",
  "românia": "romania",
  "schweiz": "switzerland",
  "slovenija": "slovenia",
  "srbija": "serbia",
  "suomi": "finland",
  "sverige": "sweden",
  "българия": "bulgaria",
  "україна": "ukraine",
  "algérie": "algeria",
  "côte d'ivoire": "cote-d-ivoire",
  "madagasikara": "madagascar",
  "maroc": "morocco",
  "misr": "egypt",
  "sénégal": "senegal",
  "tunisie": "tunisia",
  "hanguk": "korea",
  "nepāla": "nepal",
  "nihon": "japan",
  "sri lankā": "sri-lanka",
  "việt nam": "viet-nam",
  "יִשְׂרָאֵל‎": "israel",
  "ประเทศไทย": "thailand",
  "中国": "china",
  "台灣": "taiwan"
};

const AREA_ALIASES = {
  "north america": "north-america",
  "central america": "central-america",
  "south america": "south-america",
  europe: "europe",
  africa: "africa",
  asia: "asia",
  oceania: "oceania"
};

const RESERVED_PATHS = new Set([
  "about",
  "apps",
  "contact",
  "dmca",
  "favorites",
  "favourites",
  "help",
  "include-your-radio",
  "privacy-policy",
  "recently-played",
  "search"
]);

const LOCALES = {
  "en-US.json": "en",
  "vi-VN.json": "vi",
  "ja-JP.json": "ja",
  "zh-CN.json": "zh-CN",
  "zh-TW.json": "zh-TW",
  "fr-FR.json": "fr",
  "ru-RU.json": "ru"
};

function stripTags(value = "") {
  return value
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countrySlug(label) {
  const key = label.trim().toLowerCase();
  return COUNTRY_ALIASES[key] || slugify(label);
}

async function exists(file) {
  try {
    await access(file, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function fetchWithRetry(url, options = {}, attempts = 3) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: "follow",
        headers: {
          "user-agent": USER_AGENT,
          accept: "*/*",
          ...(options.headers || {})
        },
        ...options
      });

      if (response.ok) return response;
      lastError = new Error(`${response.status} ${response.statusText} for ${url}`);

      if (![429, 500, 502, 503, 504].includes(response.status)) {
        throw lastError;
      }
    } catch (error) {
      lastError = error;
    }

    if (attempt < attempts) {
      await sleep(500 * attempt);
    }
  }

  throw lastError;
}

async function fetchTextSource(url) {
  try {
    const response = await fetchWithRetry(url, {
      headers: { accept: "text/html,application/xhtml+xml" }
    });

    return {
      text: await response.text(),
      response,
      via: "direct"
    };
  } catch (directError) {
    const readerUrl = `https://r.jina.ai/${url}`;
    const response = await fetchWithRetry(readerUrl, {
      headers: { accept: "text/plain,text/markdown" }
    });

    return {
      text: await response.text(),
      response: null,
      via: "reader",
      directError
    };
  }
}

function discoverCountries(source) {
  const countries = [];
  let area = "";

  for (const line of source.split(/\r?\n/)) {
    const headingMatch = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (headingMatch) {
      const heading = stripTags(headingMatch[1]).toLowerCase();
      if (AREA_ALIASES[heading]) area = AREA_ALIASES[heading];
      continue;
    }

    if (!area) continue;

    const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
    let linkMatch;

    while ((linkMatch = linkRegex.exec(line))) {
      const label = stripTags(linkMatch[1]);
      if (!label) continue;

      let url;
      try {
        url = new URL(linkMatch[2]);
      } catch {
        continue;
      }

      if (
        url.hostname === "instant.audio" ||
        url.hostname.endsWith(".instant.audio")
      ) {
        continue;
      }

      countries.push({
        area,
        label,
        slug: countrySlug(label),
        domain: url.origin
      });
    }
  }

  return [
    ...new Map(
      countries.map((item) => [`${item.area}/${item.slug}`, item]),
    ).values(),
  ];
}

function extractCountryId(response, html) {
  const linkHeader = response?.headers?.get("link") || "";
  const combined = `${linkHeader}\n${html}`;
  const match = combined.match(
    /https:\/\/api\.instant\.audio\/data\/streams\/(\d+)\/[a-z0-9-]+/i,
  );
  return match?.[1] || "";
}

function extractStationCandidates(source, origin) {
  const candidates = new Map();
  const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  let match;

  while ((match = linkRegex.exec(source))) {
    let url;
    try {
      url = new URL(match[2]);
    } catch {
      continue;
    }

    if (url.origin !== origin) continue;

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length !== 1) continue;

    const slug = segments[0].toLowerCase();
    if (!slug || RESERVED_PATHS.has(slug) || !/^[a-z0-9-]+$/.test(slug)) {
      continue;
    }

    candidates.set(slug, {
      slug,
      title: stripTags(match[1]) || slug.replace(/-/g, " "),
      pageUrl: `${origin}/${slug}/`
    });
  }

  return [...candidates.values()];
}

function collectStringCandidates(value, keyPath = [], output = []) {
  if (typeof value === "string") {
    if (/^https?:\/\//i.test(value)) {
      output.push({ url: value, keyPath: keyPath.join(".").toLowerCase() });
    }
    return output;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectStringCandidates(item, [...keyPath, String(index)], output),
    );
    return output;
  }

  if (value && typeof value === "object") {
    for (const [key, nested] of Object.entries(value)) {
      collectStringCandidates(nested, [...keyPath, key], output);
    }
  }

  return output;
}

function streamScore(candidate) {
  const { url, keyPath } = candidate;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return -999;
  }

  if (
    /(?:cdn|coverart)\.instant\.audio$/i.test(parsed.hostname) ||
    /^api\.instant\.audio$/i.test(parsed.hostname)
  ) {
    return -999;
  }

  if (/\.(?:png|jpe?g|gif|svg|webp|ico)(?:$|\?)/i.test(parsed.pathname)) {
    return -999;
  }

  let score = 0;
  if (/stream|source|audio|listen|playback/.test(keyPath)) score += 8;
  if (/(?:^|\.)url$|src|file/.test(keyPath)) score += 3;
  if (/image|logo|art|website|facebook|twitter|instagram/.test(keyPath)) score -= 12;
  if (/\.(?:m3u8|mp3|aac|ogg|opus|m3u|pls)(?:$|\?)/i.test(url)) score += 10;
  if (/stream|listen|live|radio|icecast|shoutcast/i.test(url)) score += 4;
  if (/\.html?(?:$|\?)/i.test(url)) score -= 10;

  return score;
}

function findStreamUrl(payload) {
  const candidates = collectStringCandidates(payload)
    .map((candidate) => ({ ...candidate, score: streamScore(candidate) }))
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score);

  return candidates[0]?.url || "";
}

function findTextField(payload, fieldNames) {
  const wanted = new Set(fieldNames.map((field) => field.toLowerCase()));
  const queue = [payload];

  while (queue.length) {
    const value = queue.shift();
    if (!value || typeof value !== "object") continue;

    for (const [key, nested] of Object.entries(value)) {
      if (
        wanted.has(key.toLowerCase()) &&
        typeof nested === "string" &&
        nested.trim()
      ) {
        return nested.trim();
      }

      if (nested && typeof nested === "object") queue.push(nested);
    }
  }

  return "";
}

function detectMime(streamUrl) {
  const value = streamUrl.toLowerCase();
  if (value.includes(".m3u8")) return "application/x-mpegURL";
  if (value.includes(".aac")) return "audio/aac";
  if (value.includes(".ogg")) return "audio/ogg";
  if (value.includes(".opus")) return "audio/opus";
  return "audio/mpeg";
}

async function getCountryMetadata(country) {
  const query = country.slug.replace(/-/g, " ");
  try {
    const response = await fetchWithRetry(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=true&fields=cca2,flags,timezones,name`,
      { headers: { accept: "application/json" } },
    );
    const payload = await response.json();
    const item = Array.isArray(payload) ? payload[0] : payload;

    return {
      cca2: item?.cca2 || "",
      timezone: item?.timezones?.[0] || "UTC",
      flagPng: item?.flags?.png || "",
      commonName: item?.name?.common || country.label
    };
  } catch (error) {
    console.warn(`REST Countries lookup failed for ${country.slug}: ${error.message}`);
    return {
      cca2: "",
      timezone: "UTC",
      flagPng: "",
      commonName: country.label
    };
  }
}

async function downloadFlag(country, flagUrl) {
  if (!flagUrl) return "";

  const relative = `/img/${country.area}/flags/${country.slug}.png`;
  const destination = path.join(ROOT, "public", relative);

  if (await exists(destination)) return relative;
  if (dryRun) return relative;

  await mkdir(path.dirname(destination), { recursive: true });
  const response = await fetchWithRetry(flagUrl);
  const bytes = Buffer.from(await response.arrayBuffer());
  await writeFile(destination, bytes);

  return relative;
}

async function syncStation(country, countryId, candidate) {
  const apiUrl = `${API_BASE}/${countryId}/${candidate.slug}`;

  try {
    const response = await fetchWithRetry(apiUrl, {
      headers: { accept: "application/json" }
    });
    const payload = await response.json();
    const stream = findStreamUrl(payload);

    if (!stream) return null;

    const title =
      findTextField(payload, ["station_name", "station", "title", "name"]) ||
      candidate.title
        .replace(/\s+/g, " ")
        .trim()
        .replace(/^./, (char) => char.toUpperCase());

    const description = findTextField(payload, [
      "description",
      "summary",
      "profile"
    ]);
    const image = findTextField(payload, [
      "logo",
      "image",
      "image_url",
      "station_image",
      "artwork"
    ]);

    return {
      title,
      ...(description ? { description } : {}),
      type: detectMime(stream),
      url: candidate.pageUrl,
      cros: false,
      stream,
      features:
        image && /^https?:\/\//i.test(image)
          ? image
          : "https://s3.eplus.dev/i/station-on-air.png",
      source: apiUrl
    };
  } catch (error) {
    if (!String(error.message).includes("404")) {
      console.warn(`Skip ${country.slug}/${candidate.slug}: ${error.message}`);
    }
    return null;
  }
}

async function probeCountryId(candidate) {
  const MAX_ID = 180;
  const BATCH_SIZE = 8;

  console.warn(
    `[instant.audio] Country preload ID unavailable; probing API IDs for ${candidate.slug}`,
  );

  for (let start = 1; start <= MAX_ID; start += BATCH_SIZE) {
    const ids = Array.from(
      { length: Math.min(BATCH_SIZE, MAX_ID - start + 1) },
      (_, index) => start + index,
    );

    const results = await Promise.all(
      ids.map(async (id) => {
        const url = `${API_BASE}/${id}/${candidate.slug}`;
        try {
          const response = await fetch(url, {
            redirect: "follow",
            headers: {
              "user-agent": USER_AGENT,
              accept: "application/json"
            }
          });
          if (!response.ok) return null;

          const payload = await response.json();
          return findStreamUrl(payload) ? String(id) : null;
        } catch {
          return null;
        }
      }),
    );

    const found = results.find(Boolean);
    if (found) return found;

    await sleep(150);
  }

  return "";
}

async function syncCountry(country) {
  console.log(`\n[instant.audio] Syncing ${country.area}/${country.slug} from ${country.domain}`);

  const countrySource = await fetchTextSource(`${country.domain}/`);
  const html = countrySource.text;

  let candidates = extractStationCandidates(html, country.domain);
  let countryId = extractCountryId(countrySource.response, html);

  if (!candidates.length) {
    throw new Error(`Unable to discover station slugs for ${country.domain}`);
  }

  if (!countryId) {
    countryId = await probeCountryId(candidates[0]);
  }

  if (!countryId) {
    throw new Error(`Unable to discover InstantAudio country ID for ${country.domain}`);
  }
  if (maxStations > 0) candidates = candidates.slice(0, maxStations);

  console.log(
    `[instant.audio] Country ID ${countryId}; validating ${candidates.length} candidate station(s)`,
  );

  const stations = {};
  for (const candidate of candidates) {
    const station = await syncStation(country, countryId, candidate);
    if (station) {
      stations[candidate.slug] = station;
      console.log(`  + ${candidate.slug}`);
    }
    await sleep(120);
  }

  const keys = Object.keys(stations);
  if (!keys.length) {
    throw new Error(`No playable stations discovered for ${country.slug}`);
  }

  stations[keys[0]].favorite = true;

  return { stations, countryId };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function writeJson(file, data) {
  if (dryRun) return;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

async function updateWorld(country, metadata, stationCount, flagPath) {
  const file = path.join(ROOT, "public", "radio", "world.json");
  const world = await readJson(file);
  world[country.area] ||= {};
  world[country.area][country.slug] = {
    name: `world.${country.area.replace(/-/g, "_")}.${country.slug.replace(/-/g, "_")}`,
    flag:
      flagPath ||
      `/img/${country.area}/flags/${country.slug}.png`,
    data: `/radio/${country.area}/${country.slug}.json`,
    timezone: metadata.timezone || "UTC",
    station: stationCount
  };

  await writeJson(file, world);

  if (!dryRun) {
    const tsFile = path.join(ROOT, "data", "world.ts");
    const ts = `// Auto-generated from public/radio/world.json to avoid Vite JSON transform issues in CI\nconst world = ${JSON.stringify(world, null, 2)} as const;\n\nexport default world;\n`;
    await writeFile(tsFile, ts);
  }
}

async function updateLocales(country, metadata) {
  if (!metadata.cca2) return;
  const areaKey = country.area.replace(/-/g, "_");
  const countryKey = country.slug.replace(/-/g, "_");

  for (const [fileName, locale] of Object.entries(LOCALES)) {
    const file = path.join(ROOT, "lang", fileName);
    const data = await readJson(file);
    data.world ||= {};
    data.world[areaKey] ||= {};

    let localizedName = metadata.commonName || country.label;
    try {
      localizedName =
        new Intl.DisplayNames([locale], { type: "region" }).of(metadata.cca2) ||
        localizedName;
    } catch {
      // Use the canonical country name as a safe fallback.
    }

    data.world[areaKey][countryKey] = localizedName;
    await writeJson(file, data);
  }
}

async function loadCountryDirectory() {
  try {
    const source = await fetchTextSource(INSTANT_HOME);
    const discovered = discoverCountries(source.text);

    if (discovered.length) {
      console.log(
        `[instant.audio] Discovered ${discovered.length} countries from instant.audio`,
      );
      return discovered;
    }

    console.warn(
      "[instant.audio] instant.audio directory is blocked or unreadable; using repository snapshot",
    );
  } catch (error) {
    console.warn(
      `[instant.audio] Unable to refresh instant.audio directory; using repository snapshot: ${error.message}`,
    );
  }

  const registryFile = path.join(ROOT, "data", "instant-audio-countries.json");
  const registry = await readJson(registryFile);

  if (!Array.isArray(registry) || !registry.length) {
    throw new Error("InstantAudio country registry is empty");
  }

  console.log(
    `[instant.audio] Loaded ${registry.length} countries from repository snapshot`,
  );
  return registry;
}

async function main() {
  const discovered = await loadCountryDirectory();

  const selected = [];
  for (const country of discovered) {
    if (requestedCountry && country.slug !== requestedCountry) continue;

    const destination = path.join(
      ROOT,
      "public",
      "radio",
      country.area,
      `${country.slug}.json`,
    );
    const isMissing = !(await exists(destination));

    if (requestedCountry || isMissing || refreshExisting) {
      selected.push({ ...country, destination, isMissing });
    }
  }

  if (!selected.length) {
    console.log("[instant.audio] No missing countries found.");
    return;
  }

  const targets = selected.slice(0, requestedCountry ? 1 : maxCountries);
  console.log(
    `[instant.audio] Target(s): ${targets
      .map((item) => `${item.area}/${item.slug}${item.isMissing ? " (missing)" : ""}`)
      .join(", ")}`,
  );

  for (const country of targets) {
    const { stations, countryId } = await syncCountry(country);
    const metadata = await getCountryMetadata(country);
    const flagPath = await downloadFlag(country, metadata.flagPng);

    console.log(
      `[instant.audio] ${country.slug}: ${Object.keys(stations).length} station(s), API country ID ${countryId}`,
    );

    if (!dryRun) {
      await writeJson(country.destination, stations);
      await updateWorld(
        country,
        metadata,
        Object.keys(stations).length,
        flagPath,
      );
      await updateLocales(country, metadata);
    }
  }

  if (dryRun) {
    console.log("[instant.audio] Dry run complete; repository files were not changed.");
  }
}

main().catch((error) => {
  console.error("[instant.audio] Sync failed:", error);
  process.exitCode = 1;
});
