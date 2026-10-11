import { readdir, readFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

// Crawlers generally require a static image. Generate station-specific 1200x630
// JPEGs from our local catalog and logos before Nuxt builds/prerenders.
const WIDTH = 1200;
const HEIGHT = 630;
const VERSION = 1;
const LIMIT = 4;

export const stationOgPath = (area, country, station) => {
  const valid = (s) => typeof s === "string" && /^[a-z0-9][a-z0-9_.-]*$/i.test(s) && s !== "..";
  if (![area, country, station].every(valid)) throw new Error("Invalid station OG path");
  return "/og/stations/" + area + "/" + country + "/" + station + ".jpg";
};

const escapeXml = (value) =>
  String(value || "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
  })[ch]);

const safeText = (value) =>
  String(value || "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();

function shortLines(value, maxChars = 27) {
  const words = [...safeText(value).split(/\s+/)];
  const lines = [""];
  for (const word of words) {
    const index = lines.length - 1;
    const candidate = lines[index] ? lines[index] + " " + word : word;
    if ([...candidate].length <= maxChars || !lines[index]) {
      lines[index] = candidate;
    } else if (lines.length === 1) {
      lines.push(word);
    } else {
      lines[1] += " " + word;
    }
  }
  return lines.slice(0, 2).map((line) => {
    const glyphs = [...line];
    return glyphs.length > maxChars ? glyphs.slice(0, maxChars - 1).join("").trimEnd() + "…" : line;
  });
}

function readableAccent(rgb) {
  const r = Math.max(98, Math.min(255, Number(rgb?.r) || 236));
  const g = Math.max(72, Math.min(225, Number(rgb?.g) || 77));
  const b = Math.max(99, Math.min(255, Number(rgb?.b) || 119));
  return "rgb(" + Math.round(r) + "," + Math.round(g) + "," + Math.round(b) + ")";
}

async function stationLogo(root, features) {
  if (typeof features !== "string" || !features.startsWith("/img/") || features.includes("?")) return null;
  const publicRoot = resolve(root, "public");
  const path = resolve(publicRoot, features.slice(1));
  if (!path.startsWith(publicRoot + sep)) return null;
  try {
    const bytes = await sharp(path, { limitInputPixels: 12000000 })
      .rotate().resize(224, 224, { fit: "contain", background: "#ffffff00" })
      .png().toBuffer();
    const dominant = (await sharp(bytes).stats()).dominant;
    return { data: bytes.toString("base64"), accent: readableAccent(dominant) };
  } catch {
    // A missing/corrupt or remote logo must not break OG image generation.
    return null;
  }
}

function stationSvg({ title, country, logo }) {
  const accent = logo?.accent || "#fd667f";
  const lines = shortLines(title);
  const titleSize = lines.some((line) => [...line].length > 22) ? 41 : 49;
  const textNodes = lines.map((line, index) =>
    '<text x="446" y="' + (315 + index * 59) + '" font-size="' + titleSize +
    '" font-weight="800" fill="#ffffff">' + escapeXml(line) + '</text>'
  ).join("");
  const logoNode = logo
    ? '<image x="123" y="240" width="204" height="204" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,' + logo.data + '"/>'
    : '<text x="224" y="365" text-anchor="middle" font-size="96" font-weight="800" fill="#e83d67">♫</text>';
  const countryLabel = [...safeText(country).replaceAll("-", " ")].slice(0, 44).join("");
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">',
    '<defs>',
    '<linearGradient id="bg" x2="1" y2="1"><stop stop-color="#080e2d"/><stop offset=".63" stop-color="#25143e"/><stop offset="1" stop-color="#5d274e"/></linearGradient>',
    '<linearGradient id="wave"><stop stop-color="#8549e8"/><stop offset=".47" stop-color="#f24d89"/><stop offset="1" stop-color="#ffb678"/></linearGradient>',
    '<radialGradient id="a"><stop stop-color="' + accent + '" stop-opacity=".66"/><stop offset="1" stop-color="' + accent + '" stop-opacity="0"/></radialGradient>',
    '<filter id="blur"><feGaussianBlur stdDeviation="27"/></filter>',
    '</defs>',
    '<rect width="1200" height="630" fill="url(#bg)"/>',
    '<circle cx="1001" cy="150" r="300" fill="url(#a)" opacity=".58"/>',
    '<circle cx="200" cy="565" r="185" fill="#844bd6" opacity=".17" filter="url(#blur)"/>',
    '<g font-family="DejaVu Sans, Arial, sans-serif">',
    '<text x="75" y="110" font-weight="800" font-size="57" fill="#ffffff">ePlus <tspan fill="#ff647f">OnAir</tspan></text>',
    '<text x="77" y="148" font-size="21" letter-spacing="3" fill="#e1cbe4">LISTEN BEYOND BORDERS</text>',
    '<rect x="103" y="211" width="244" height="264" rx="30" fill="#fff" stroke="' + accent + '" stroke-width="7"/>',
    logoNode,
    '<rect x="435" y="213" width="110" height="41" rx="20" fill="#e72852"/>',
    '<circle cx="458" cy="234" r="6" fill="#ffffff"/>',
    '<text x="478" y="241" font-size="19" font-weight="800" fill="#ffffff">LIVE</text>',
    textNodes,
    '<text x="446" y="461" font-size="25" fill="#dfcfe8">' + escapeXml(countryLabel) + '</text>',
    '<text x="80" y="575" font-size="23" font-weight="600" fill="#f4dbe8">Live radio from around the world</text>',
    '<rect x="967" y="63" width="162" height="77" rx="18" fill="#b61f46" stroke="#ffa8b5" stroke-width="4"/>',
    '<text x="1048" y="112" font-size="29" font-weight="800" text-anchor="middle" fill="#ffffff">ON AIR</text>',
    '</g>',
    '<g fill="none" stroke="url(#wave)" opacity=".6">',
    '<path d="M-20 497C120 457 276 618 450 546S725 469 884 539 1071 477 1220 505" stroke-width="4"/>',
    '<path d="M-20 517C120 477 276 638 450 566S725 489 884 559 1071 497 1220 525" stroke-width="3"/>',
    '<path d="M-20 537C120 497 276 658 450 586S725 509 884 579 1071 517 1220 545" stroke-width="3"/>',
    '</g>',
    '</svg>',
  ].join("");
}

export async function renderStationOg({ root = process.cwd(), area, country, stationId, meta, outputPath }) {
  const relativePath = stationOgPath(area, country, stationId);
  const target = outputPath || join(root, "public", relativePath.slice(1));
  const logo = await stationLogo(root, meta?.features);
  const svg = stationSvg({
    title: meta?.title || stationId,
    country: country === "viet-nam" ? "Việt Nam" : country,
    logo,
  });
  await mkdir(dirname(target), { recursive: true });
  const result = await sharp(Buffer.from(svg)).resize(WIDTH, HEIGHT)
    .jpeg({ quality: 82, mozjpeg: true }).toFile(target);
  if (result.width !== WIDTH || result.height !== HEIGHT || result.format !== "jpeg") {
    throw new Error("Invalid station social thumbnail: " + relativePath);
  }
  return { path: relativePath, output: target, bytes: result.size, logoFound: Boolean(logo) };
}

export async function generateStationOgImages({ root = process.cwd(), limit = LIMIT } = {}) {
  const catalogRoot = join(root, "public", "radio");
  const queue = [];
  const areas = await readdir(catalogRoot, { withFileTypes: true });
  for (const area of areas.filter((entry) => entry.isDirectory())) {
    const directory = join(catalogRoot, area.name);
    for (const file of (await readdir(directory, { withFileTypes: true })).filter(
      (entry) => entry.isFile() && entry.name.endsWith(".json")
    )) {
      const country = file.name.slice(0, -5);
      const catalog = JSON.parse(await readFile(join(directory, file.name), "utf8"));
      for (const [stationId, meta] of Object.entries(catalog)) {
        queue.push({ area: area.name, country, stationId, meta });
      }
    }
  }
  let count = 0, fallback = 0, bytes = 0;
  let next = 0;
  async function worker() {
    while (next < queue.length) {
      const item = queue[next++];
      const rendered = await renderStationOg({ root, ...item });
      count++;
      fallback += Number(!rendered.logoFound);
      bytes += rendered.bytes;
    }
  }
  await Promise.all(Array.from({ length: Math.min(Math.max(1, limit), queue.length) }, worker));
  return { count, fallback, bytes, version: VERSION };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const summary = await generateStationOgImages();
  console.log("Station OG images generated:", summary);
}
