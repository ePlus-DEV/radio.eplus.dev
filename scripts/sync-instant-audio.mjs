#!/usr/bin/env node

import { appendFile, mkdir, readFile, writeFile, access } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const ROOT = process.cwd();
const INSTANT_HOME = "https://instant.audio/";
const API_BASE = "https://api.instant.audio/data/streams";
const RADIO_BROWSER_BASE =
  "https://de1.api.radio-browser.info/json/stations/bycountrycodeexact";
const USER_AGENT =
  "Radio-ePlus-Data-Sync/2.0 (+https://github.com/ePlus-DEV/radio.eplus.dev)";
const DEFAULT_STATION_IMAGE = "https://s3.eplus.dev/i/station-on-air.png";
const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
const IMAGE_EXTENSIONS = new Map([
  ["image/png", "png"],
  ["image/jpeg", "jpg"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
  ["image/x-icon", "ico"],
  ["image/vnd.microsoft.icon", "ico"],
  ["image/avif", "avif"]
]);

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

let directApiBlockedForRun = false;

const runStats = {
  countriesSucceeded: 0,
  countriesFailed: 0,
  stationsDiscovered: 0,
  stationsAdded: 0,
  imagesDownloaded: 0,
  imagesExisting: 0,
  imagesFallback: 0,
  imageCandidateFailures: 0,
  homepageArtworkFailures: 0,
};

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
  "acerca",
  "apps",
  "buscar",
  "contacto",
  "dmca",
  "favorites",
  "favoritos",
  "favourites",
  "generos",
  "genres",
  "help",
  "include-your-radio",
  "incluir-tu-radio",
  "menu",
  "privacy-policy",
  "recently-played",
  "escuchado-recientemente",
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
      lastError.status = response.status;

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

function extractWebradioConfig(source = "") {
  const countryCode =
    source.match(/countryCode\s*:\s*["']([A-Z]{2})["']/)?.[1] || "";
  const domainID =
    source.match(/domainID\s*:\s*(\d+)/)?.[1] || "";
  const languageCode =
    source.match(/languageCode\s*:\s*["']([^"']+)["']/)?.[1] || "";

  return { countryCode, domainID, languageCode };
}

export function extractStationCandidates(source, origin) {
  const candidates = new Map();

  const addCandidate = (href, label, { trustedStationList = false } = {}) => {
    let url;
    try {
      url = new URL(href, origin);
    } catch {
      return;
    }

    if (url.origin !== origin) return;

    const segments = url.pathname.split("/").filter(Boolean);
    if (segments.length !== 1) return;

    const slug = segments[0].toLowerCase();
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) return;
    if (!trustedStationList && RESERVED_PATHS.has(slug)) return;

    const imageMatch = String(label || "").match(
      /<img\b[^>]*src=["']([^"']+)["'][^>]*>/i,
    );
    let imageUrl = "";
    if (imageMatch?.[1]) {
      try {
        imageUrl = new URL(imageMatch[1], origin).toString();
      } catch {
        imageUrl = "";
      }
    }

    candidates.set(slug, {
      slug,
      title: stripTags(label || "") || slug.replace(/-/g, " "),
      pageUrl: `${origin}/${slug}/`,
      ...(imageUrl ? { imageUrl } : {})
    });
  };

  // Preferred source: the actual station navigation list rendered by InstantAudio sites.
  // This avoids false positives such as privacy/help pages and preserves valid station
  // slugs such as /contact/ (Radio Contact).
  const stationListMatch = source.match(
    /<ul\b[^>]*id=["']dynamic-radio-stations["'][^>]*>([\s\S]*?)<\/ul>/i,
  );

  if (stationListMatch) {
    const anchorRegex = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
    let match;
    while ((match = anchorRegex.exec(stationListMatch[1]))) {
      addCandidate(match[1], match[2], { trustedStationList: true });
    }

    if (candidates.size) return [...candidates.values()];
  }

  // Fallback for other country-site templates and Jina markdown snapshots.
  const anchorRegex = new RegExp(
    `<a\\b[^>]*href=["']([^"'#]+)["'][^>]*>([\\s\\S]*?)</a>`,
    "gi",
  );
  let match;

  while ((match = anchorRegex.exec(source))) {
    addCandidate(match[1], match[2]);
  }

  const markdownLinkRegex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  while ((match = markdownLinkRegex.exec(source))) {
    addCandidate(match[2], match[1]);
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

function findInstantAudioStream(payload) {
  const result = payload?.result || payload || {};
  const streams = Array.isArray(result.streams) ? result.streams : [];

  const playable = streams
    .filter((item) => {
      if (!item || item.isContainer === true || !/^https?:\/\//i.test(item.url || "")) {
        return false;
      }

      const mime = String(item.mime || "").toLowerCase();
      const mediaType = String(item.mediaType || "").toLowerCase();
      return (
        mime.startsWith("audio/") ||
        ["mp3", "aac", "ogg", "opus", "hls"].includes(mediaType)
      );
    })
    .sort((a, b) => {
      const aHttps = String(a.url).startsWith("https://") ? 1 : 0;
      const bHttps = String(b.url).startsWith("https://") ? 1 : 0;
      return bHttps - aHttps;
    });

  if (playable[0]) {
    return {
      url: playable[0].url,
      mime: playable[0].mime || detectMime(playable[0].url)
    };
  }

  const fallback = findStreamUrl(payload);
  return fallback ? { url: fallback, mime: detectMime(fallback) } : null;
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
      cca2: item?.cca2 || country.cca2 || "",
      timezone: item?.timezones?.[0] || "",
      flagPng: item?.flags?.png || "",
      commonName: item?.name?.common || country.label
    };
  } catch (error) {
    console.warn(`REST Countries lookup failed for ${country.slug}: ${error.message}`);
    return {
      cca2: country.cca2 || "",
      timezone: "",
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

async function findExistingStationImage(country, stationSlug) {
  const base = path.join(ROOT, "public", "img", country.area, country.slug);
  for (const extension of ["png", "jpg", "webp", "gif", "svg"]) {
    const destination = path.join(base, `${stationSlug}.${extension}`);
    if (await exists(destination)) {
      return `/img/${country.area}/${country.slug}/${stationSlug}.${extension}`;
    }
  }
  return "";
}

export function imageExtension(contentType, imageUrl) {
  const normalized = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (IMAGE_EXTENSIONS.has(normalized)) return IMAGE_EXTENSIONS.get(normalized);

  try {
    const ext = path.extname(new URL(imageUrl).pathname).slice(1).toLowerCase();
    if (["png", "jpg", "jpeg", "webp", "gif", "svg", "ico", "avif"].includes(ext)) {
      return ext === "jpeg" ? "jpg" : ext;
    }
  } catch {
    // Ignore malformed image URLs.
  }

  return "";
}

export function extractStationImageCandidates(html, pageUrl) {
  const source = String(html || "");
  const candidates = [];

  const add = (value) => {
    const raw = String(value || "").trim();
    if (!raw) return;
    try {
      const absolute = new URL(raw, pageUrl).toString();
      if (!/^https?:\/\//i.test(absolute)) return;
      if (!candidates.includes(absolute)) candidates.push(absolute);
    } catch {
      // Ignore malformed image URLs.
    }
  };

  const metaPatterns = [
    /<meta\b[^>]*(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]*content=["']([^"']+)["'][^>]*>/gi,
    /<meta\b[^>]*content=["']([^"']+)["'][^>]*(?:property|name)=["'](?:og:image|twitter:image|twitter:image:src)["'][^>]*>/gi,
  ];

  for (const pattern of metaPatterns) {
    let match;
    while ((match = pattern.exec(source))) add(match[1]);
  }

  const linkPattern = /<link\b[^>]*rel=["']([^"']+)["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
  let linkMatch;
  while ((linkMatch = linkPattern.exec(source))) {
    if (/\b(?:icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed)\b/i.test(linkMatch[1])) {
      add(linkMatch[2]);
    }
  }

  const reversedLinkPattern = /<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']([^"']+)["'][^>]*>/gi;
  while ((linkMatch = reversedLinkPattern.exec(source))) {
    if (/\b(?:icon|shortcut icon|apple-touch-icon|apple-touch-icon-precomposed)\b/i.test(linkMatch[2])) {
      add(linkMatch[1]);
    }
  }

  return candidates;
}

async function tryDownloadStationImage(country, stationSlug, imageUrl, referer) {
  if (!/^https?:\/\//i.test(String(imageUrl || ""))) return "";

  try {
    const response = await fetchWithRetry(imageUrl, {
      headers: {
        accept: "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        referer: referer || country.domain + "/"
      }
    });

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      throw new Error(`unexpected content-type ${contentType || "unknown"}`);
    }

    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > MAX_IMAGE_BYTES) {
      throw new Error(`image is too large (${declaredLength} bytes)`);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) {
      throw new Error(`invalid image size (${bytes.length} bytes)`);
    }

    const extension = imageExtension(contentType, imageUrl);
    if (!extension) {
      throw new Error(`unsupported image type ${contentType || imageUrl}`);
    }

    const relative = `/img/${country.area}/${country.slug}/${stationSlug}.${extension}`;
    if (dryRun) return relative;

    const destination = path.join(ROOT, "public", relative);
    await mkdir(path.dirname(destination), { recursive: true });
    await writeFile(destination, bytes);
    runStats.imagesDownloaded += 1;
    console.log(
      `[instant.audio] Image saved for ${country.slug}/${stationSlug}: ${relative}`,
    );
    return relative;
  } catch (error) {
    runStats.imageCandidateFailures += 1;
    console.warn(
      `[instant.audio] Image candidate failed for ${country.slug}/${stationSlug}: ${error.message}`,
    );
    return "";
  }
}

async function resolveStationImage(country, stationSlug, preferredImage, homepageUrl) {
  const existing = await findExistingStationImage(country, stationSlug);
  if (existing) {
    runStats.imagesExisting += 1;
    return existing;
  }

  const homepage =
    /^https?:\/\//i.test(String(homepageUrl || ""))
      ? String(homepageUrl)
      : country.domain + "/";

  const preferred = await tryDownloadStationImage(
    country,
    stationSlug,
    preferredImage,
    homepage,
  );
  if (preferred) return preferred;

  const candidates = [];
  try {
    const page = await fetchWithRetry(homepage, {
      headers: {
        accept: "text/html,application/xhtml+xml",
        referer: country.domain + "/"
      }
    });
    const html = await page.text();
    candidates.push(...extractStationImageCandidates(html, homepage));
  } catch (error) {
    runStats.homepageArtworkFailures += 1;
    console.warn(
      `[instant.audio] Unable to inspect homepage artwork for ${country.slug}/${stationSlug}: ${error.message}`,
    );
  }

  try {
    const favicon = new URL("/favicon.ico", homepage).toString();
    if (!candidates.includes(favicon)) candidates.push(favicon);
  } catch {
    // Ignore malformed homepage URL.
  }

  for (const candidate of candidates) {
    const local = await tryDownloadStationImage(
      country,
      stationSlug,
      candidate,
      homepage,
    );
    if (local) return local;
  }

  runStats.imagesFallback += 1;
  console.warn(
    `[instant.audio] Using fallback artwork for ${country.slug}/${stationSlug}`,
  );
  return DEFAULT_STATION_IMAGE;
}

function stationFromInstantPayload(country, candidate, apiUrl, payload) {
  const instantResult = payload?.result || payload || {};
  const stationMetadata = instantResult.station || {};
  const streamInfo = findInstantAudioStream(payload);

  if (!streamInfo) return null;

  const title =
    String(stationMetadata.title || "").trim() ||
    findTextField(payload, ["station_name", "title", "name"]) ||
    candidate.title
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^./, (char) => char.toUpperCase());

  const description = findTextField(payload, [
    "description",
    "summary",
    "profile"
  ]);
  const image =
    findTextField(payload, [
      "logo",
      "image",
      "image_url",
      "station_image",
      "artwork"
    ]) || candidate.imageUrl || "";
  const website =
    typeof stationMetadata.url === "string" &&
    /^https?:\/\//i.test(stationMetadata.url)
      ? stationMetadata.url
      : candidate.pageUrl;

  return {
    title,
    ...(description ? { description } : {}),
    ...(stationMetadata.signal ? { signal: stationMetadata.signal } : {}),
    ...(typeof stationMetadata.acrCloud === "boolean"
      ? { acrCloud: stationMetadata.acrCloud }
      : {}),
    type: streamInfo.mime || detectMime(streamInfo.url),
    url: website,
    cros: streamInfo.url.startsWith("http://"),
    stream: streamInfo.url,
    features:
      image && /^https?:\/\//i.test(image)
        ? image
        : DEFAULT_STATION_IMAGE,
    source: apiUrl
  };
}

async function syncStation(country, countryId, candidate) {
  const apiUrl = API_BASE + "/" + countryId + "/" + candidate.slug;

  try {
    const response = await fetchWithRetry(apiUrl, {
      headers: {
        accept: "application/json, text/plain, */*",
        referer: country.domain + "/"
      }
    });
    const payload = await response.json();
    const station = stationFromInstantPayload(country, candidate, apiUrl, payload);
    if (station) {
      station.features = await resolveStationImage(
        country,
        candidate.slug,
        station.features,
        station.url,
      );
    }
    return {
      station,
      status: response.status,
      via: "direct"
    };
  } catch (error) {
    if (error?.status !== 404) {
      console.warn(
        "Skip " + country.slug + "/" + candidate.slug + ": " + error.message,
      );
    }
    return {
      station: null,
      status: Number(error?.status || 0),
      via: "direct",
      error: String(error?.message || error)
    };
  }
}

async function probeCountryId(country, candidate) {
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
              accept: "application/json, text/plain, */*",
              referer: `${country.domain}/`,
              "user-agent": USER_AGENT
            }
          });
          if (!response.ok) return null;

          const payload = await response.json();
          return findInstantAudioStream(payload) ? String(id) : null;
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

function radioBrowserMime(codec, streamUrl) {
  const value = String(codec || "").toLowerCase();
  if (value.includes("aac")) return "audio/aac";
  if (value.includes("ogg")) return "audio/ogg";
  if (value.includes("opus")) return "audio/opus";
  return detectMime(streamUrl);
}

async function syncFromRadioBrowser(country, metadata) {
  const countryCode = String(metadata.cca2 || country.cca2 || "").trim();
  const countryName = String(metadata.commonName || country.label || country.slug).trim();
  const limit = maxStations > 0 ? maxStations : 100;

  let endpoint;
  if (countryCode) {
    endpoint =
      `${RADIO_BROWSER_BASE}/${encodeURIComponent(countryCode)}` +
      `?hidebroken=true&order=votes&reverse=true&limit=${limit}`;
  } else {
    const base = RADIO_BROWSER_BASE.replace("/bycountrycodeexact", "");
    endpoint =
      `${base}/bycountryexact/${encodeURIComponent(countryName)}` +
      `?hidebroken=true&order=votes&reverse=true&limit=${limit}`;
    console.warn(
      `[instant.audio] Missing country code for ${country.slug}; falling back to Radio Browser country-name lookup (${countryName})`,
    );
  }

  console.warn(
    `[instant.audio] Falling back to Radio Browser for ${country.slug}`,
  );

  const response = await fetchWithRetry(endpoint, {
    headers: {
      accept: "application/json",
      "user-agent": USER_AGENT
    }
  });
  const payload = await response.json();
  const stations = {};

  for (const item of Array.isArray(payload) ? payload : []) {
    const title = String(item.name || "").trim();
    const stream = String(item.url_resolved || item.url || "").trim();

    if (!title || !/^https?:\/\//i.test(stream)) continue;

    let slug = slugify(title);
    if (!slug) continue;

    if (stations[slug]) {
      slug = `${slug}-${String(item.stationuuid || "").slice(0, 8)}`;
    }

    const tags = String(item.tags || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean)
      .slice(0, 5);

    stations[slug] = {
      title,
      ...(tags.length ? { description: tags.join(", ") } : {}),
      type: radioBrowserMime(item.codec, stream),
      url: String(item.homepage || country.domain),
      cros: stream.startsWith("http://"),
      stream,
      features: await resolveStationImage(
        country,
        slug,
        String(item.favicon || ""),
        String(item.homepage || country.domain),
      ),
      source: `radio-browser:${item.stationuuid || slug}`
    };
  }

  const keys = Object.keys(stations);
  if (!keys.length) {
    throw new Error(
      `Radio Browser returned no playable stations for ${country.slug}`,
    );
  }

  stations[keys[0]].favorite = true;
  return stations;
}
async function syncCountry(country, metadata) {
  console.log(
    "\n[instant.audio] Syncing " +
      country.area +
      "/" +
      country.slug +
      " from " +
      country.domain,
  );

  const countrySource = await fetchTextSource(country.domain + "/");
  const html = countrySource.text;
  const pageConfig = extractWebradioConfig(html);

  if (!metadata.cca2 && pageConfig.countryCode) {
    metadata.cca2 = pageConfig.countryCode;
  }

  let candidates = extractStationCandidates(html, country.domain);
  let countryId =
    pageConfig.domainID ||
    extractCountryId(countrySource.response, html);

  if (!candidates.length) {
    throw new Error("Unable to discover station slugs for " + country.domain);
  }

  if (!countryId) {
    countryId = await probeCountryId(country, candidates[0]);
  }

  if (!countryId) {
    throw new Error(
      "Unable to discover InstantAudio country ID for " + country.domain,
    );
  }
  if (maxStations > 0) candidates = candidates.slice(0, maxStations);

  console.log(
    "[instant.audio] Country ID " +
      countryId +
      "; validating " +
      candidates.length +
      " candidate station(s)",
  );

  const stations = {};
  let consecutiveForbidden = 0;

  if (!directApiBlockedForRun) {
    for (const candidate of candidates) {
      const result = await syncStation(country, countryId, candidate);

      if (result.station) {
        stations[candidate.slug] = result.station;
        consecutiveForbidden = 0;
        console.log("  + " + candidate.slug);
      } else if (result.status === 403) {
        consecutiveForbidden += 1;
        if (consecutiveForbidden >= 3) {
          directApiBlockedForRun = true;
          console.warn(
            "[instant.audio] Direct API is blocked on this runner; remaining countries will use Radio Browser directly",
          );
          break;
        }
      } else {
        consecutiveForbidden = 0;
      }

      await sleep(120);
    }
  } else {
    console.log(
      "[instant.audio] Direct API already marked blocked for this run; skipping InstantAudio stream requests",
    );
  }

  const keys = Object.keys(stations);
  if (!keys.length) {
    const fallbackStations = await syncFromRadioBrowser(country, metadata);
    return {
      stations: fallbackStations,
      countryId,
      source: directApiBlockedForRun
        ? "radio-browser-after-api-block"
        : "radio-browser-fallback"
    };
  }

  stations[keys[0]].favorite = true;

  return {
    stations,
    countryId,
    source: "instant-audio"
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

async function writeJson(file, data) {
  if (dryRun) return;
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`);
}

export function normalizeStreamIdentity(value = "") {
  try {
    const url = new URL(value);
    url.hash = "";
    return url.toString().replace(/\/$/, "").toLowerCase();
  } catch {
    return String(value).trim().replace(/\/$/, "").toLowerCase();
  }
}

export function mergeStations(existing, discovered) {
  const merged = { ...existing };
  const knownStreams = new Set(
    Object.values(existing)
      .map((station) => normalizeStreamIdentity(station?.stream))
      .filter(Boolean),
  );
  const existingHasFavorite = Object.values(existing).some(
    (station) => station?.favorite === true,
  );

  let added = 0;
  for (const [baseSlug, stationValue] of Object.entries(discovered)) {
    const streamKey = normalizeStreamIdentity(stationValue?.stream);
    if (!streamKey || knownStreams.has(streamKey)) continue;

    let slug = baseSlug;
    let suffix = 2;
    while (merged[slug]) {
      slug = `${baseSlug}-instant-audio${suffix === 2 ? "" : `-${suffix}`}`;
      suffix += 1;
    }

    const station = { ...stationValue };
    if (existingHasFavorite || added > 0) delete station.favorite;

    merged[slug] = station;
    knownStreams.add(streamKey);
    added += 1;
  }

  return { stations: merged, added };
}

export function resolveCountryTimezone(existing = {}, metadata = {}) {
  return existing.timezone || metadata.timezone || "UTC";
}

async function updateWorld(country, metadata, stationCount, flagPath) {
  const file = path.join(ROOT, "public", "radio", "world.json");
  const world = await readJson(file);
  const areaKey = country.area.replace(/-/g, "_");
  world[areaKey] ||= {};
  const existing = world[areaKey][country.slug] || {};
  world[areaKey][country.slug] = {
    ...existing,
    name: `world.${areaKey}.${country.slug.replace(/-/g, "_")}`,
    flag:
      flagPath ||
      existing.flag ||
      `/img/${country.area}/flags/${country.slug}.png`,
    data: `/assets/radio/${country.area}/${country.slug}.json`,
    timezone: resolveCountryTimezone(existing, metadata),
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

async function persistCountryRegistry(discovered) {
  if (dryRun || !discovered.length) return;
  const registryFile = path.join(ROOT, "data", "instant-audio-countries.json");
  let existing = [];
  try {
    existing = await readJson(registryFile);
  } catch {
    // Allow the registry to be recreated from live discovery.
  }
  const existingByKey = new Map(
    (Array.isArray(existing) ? existing : []).map((item) => [item.area + "/" + item.slug, item]),
  );
  const merged = discovered.map((item) => ({
    ...(existingByKey.get(item.area + "/" + item.slug) || {}),
    ...item,
  }));
  await writeJson(registryFile, merged);
}

function rotateExistingCountries(countries, count) {
  if (!countries.length) return [];
  const runNumber = Number(process.env.GITHUB_RUN_NUMBER || 0);
  const offset = runNumber > 0 ? runNumber % countries.length : 0;
  const rotated = [...countries.slice(offset), ...countries.slice(0, offset)];
  return rotated.slice(0, count);
}
async function loadCountryDirectory() {
  try {
    const source = await fetchTextSource(INSTANT_HOME);
    const discovered = discoverCountries(source.text);

    if (discovered.length) {
      console.log("[instant.audio] Discovered " + discovered.length + " countries from instant.audio");
      await persistCountryRegistry(discovered);
      return discovered;
    }

    console.warn("[instant.audio] instant.audio directory is blocked or unreadable; using repository snapshot");
  } catch (error) {
    console.warn("[instant.audio] Unable to refresh instant.audio directory directly; using repository snapshot: " + error.message);
  }

  console.warn("[instant.audio] Using repository country snapshot");
  const registryFile = path.join(ROOT, "data", "instant-audio-countries.json");
  const registry = await readJson(registryFile);

  if (!Array.isArray(registry) || !registry.length) {
    throw new Error("InstantAudio country registry is empty");
  }

  console.log("[instant.audio] Loaded " + registry.length + " countries from repository snapshot");
  return registry;
}
function imageStatsSnapshot() {
  return {
    downloaded: runStats.imagesDownloaded,
    existing: runStats.imagesExisting,
    fallback: runStats.imagesFallback,
    candidateFailures: runStats.imageCandidateFailures,
    homepageFailures: runStats.homepageArtworkFailures,
  };
}

function imageStatsDelta(before) {
  return {
    downloaded: runStats.imagesDownloaded - before.downloaded,
    existing: runStats.imagesExisting - before.existing,
    fallback: runStats.imagesFallback - before.fallback,
    candidateFailures: runStats.imageCandidateFailures - before.candidateFailures,
    homepageFailures: runStats.homepageArtworkFailures - before.homepageFailures,
  };
}

async function writeRunSummary() {
  const lines = [
    "",
    "========== RADIO SYNC SUMMARY ==========",
    `Countries: success ${runStats.countriesSucceeded}, failed ${runStats.countriesFailed}`,
    `Stations: discovered ${runStats.stationsDiscovered}, added ${runStats.stationsAdded}`,
    `Artwork: downloaded ${runStats.imagesDownloaded}, reused local ${runStats.imagesExisting}, fallback ${runStats.imagesFallback}`,
    `Artwork attempts: candidate failures ${runStats.imageCandidateFailures}, homepage inspect failures ${runStats.homepageArtworkFailures}`,
    `InstantAudio direct API blocked: ${directApiBlockedForRun ? "yes" : "no"}`,
    "========================================",
  ];

  console.log(lines.join("\n"));

  if (process.env.GITHUB_STEP_SUMMARY) {
    const markdown = [
      "## Radio sync result",
      "",
      `- Countries: **${runStats.countriesSucceeded} succeeded**, **${runStats.countriesFailed} failed**`,
      `- Stations: **${runStats.stationsDiscovered} discovered**, **${runStats.stationsAdded} added**`,
      `- Artwork: **${runStats.imagesDownloaded} downloaded**, **${runStats.imagesExisting} reused**, **${runStats.imagesFallback} fallback**`,
      `- Failed image candidates: **${runStats.imageCandidateFailures}**`,
      `- Homepage artwork inspection failures: **${runStats.homepageArtworkFailures}**`,
      `- InstantAudio direct API blocked: **${directApiBlockedForRun ? "Yes" : "No"}**`,
      "",
    ].join("\n");

    await appendFile(process.env.GITHUB_STEP_SUMMARY, markdown);
  }
}

async function main() {
  const discovered = await loadCountryDirectory();
  const missing = [];
  const existing = [];

  for (const country of discovered) {
    if (requestedCountry && country.slug !== requestedCountry) continue;

    const destination = path.join(ROOT, "public", "radio", country.area, country.slug + ".json");
    const isMissing = !(await exists(destination));
    const item = { ...country, destination, isMissing };

    if (requestedCountry) {
      missing.push(item);
      continue;
    }

    if (isMissing) missing.push(item);
    else existing.push(item);
  }

  let targets;
  if (requestedCountry) {
    targets = missing.slice(0, 1);
  } else if (refreshExisting) {
    targets = rotateExistingCountries(existing, maxCountries);
    console.log("[instant.audio] Existing-country refresh requested; selected " + targets.length + " rotating target(s)");
  } else if (missing.length) {
    targets = missing.slice(0, maxCountries);
  } else {
    targets = rotateExistingCountries(existing, maxCountries);
    console.log("[instant.audio] No missing countries found; rotating through " + targets.length + " existing country/countries for station augmentation");
  }

  if (!targets.length) {
    console.log("[instant.audio] No eligible countries found for this run.");
    return;
  }

  console.log(
    "[instant.audio] Target(s): " + targets.map((item) =>
      item.area + "/" + item.slug + (item.isMissing ? " (missing)" : " (augment)")
    ).join(", "),
  );

  let failedCountries = 0;
  for (const country of targets) {
    const imageBefore = imageStatsSnapshot();
    try {
        const metadata = await getCountryMetadata(country);
        const { stations: discoveredStations, countryId, source } = await syncCountry(country, metadata);
        const flagPath = await downloadFlag(country, metadata.flagPng);
    
        let stations = discoveredStations;
        let added = Object.keys(discoveredStations).length;
    
        if (!country.isMissing) {
          const existingStations = await readJson(country.destination);
          const merged = mergeStations(existingStations, discoveredStations);
          stations = merged.stations;
          added = merged.added;
        }
    
        const discoveredCount = Object.keys(discoveredStations).length;
        runStats.countriesSucceeded += 1;
        runStats.stationsDiscovered += discoveredCount;
        runStats.stationsAdded += added;

        const imageDelta = imageStatsDelta(imageBefore);

        console.log(
          "[instant.audio] " + country.slug + ": discovered " + discoveredCount +
          ", added " + added + ", total " + Object.keys(stations).length +
          "; API country ID " + countryId + ", source " + source,
        );
        console.log(
          "[instant.audio] " + country.slug + " artwork: downloaded " + imageDelta.downloaded +
          ", reused " + imageDelta.existing +
          ", fallback " + imageDelta.fallback +
          ", failed candidates " + imageDelta.candidateFailures +
          ", homepage failures " + imageDelta.homepageFailures,
        );
    
        if (!dryRun) {
          if (country.isMissing || added > 0) {
            await writeJson(country.destination, stations);
          }
          await updateWorld(country, metadata, Object.keys(stations).length, flagPath);
          await updateLocales(country, metadata);
        }
      } catch (error) {
      failedCountries += 1;
      runStats.countriesFailed += 1;
      console.error(
        `[instant.audio] ${country.slug}: sync failed, skipping country: ${error.message}`,
      );
    }
  }

  if (failedCountries === targets.length) {
    console.warn(
      "[instant.audio] All selected countries failed; run completed without data changes.",
    );
  }
  if (dryRun) {
    console.log("[instant.audio] Dry run complete; repository files were not changed.");
  }

  await writeRunSummary();
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error("[instant.audio] Sync failed:", error);
    process.exitCode = 1;
  });
}
