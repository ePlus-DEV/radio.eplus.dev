import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Assert actual generated static HTML, not only metadata in Vue sources.
const origin = (process.env.SEO_EXPECTED_SITE_URL || "https://radio.eplus.dev").replace(/\/$/, "");
const output = ".output/public";
async function loadPage(route) {
  const segments = route.split("/").filter(Boolean);
  const candidates = [join(output, ...segments, "index.html"), join(output, ...segments) + ".html"];
  for (const file of candidates) {
    try { return await readFile(file, "utf8"); }
    catch (error) { if (error?.code !== "ENOENT") throw error; }
  }
  throw new Error("Prerendered HTML missing for " + route + ": " + candidates.join(", "));
}
const metaTags = (html) => [...html.matchAll(/<meta\b[^>]*>/gi)].map(m => m[0]);
function attr(tag, name) {
  // Our attribute names are constant: "name", "property", "content".
  const match = tag.match(new RegExp("\\b" + name + "\\s*=\\s*([\"'])(.*?)\\1", "i"));
  return match?.[2] ?? null;
}
function values(html, attribute, key) {
  return metaTags(html).filter(tag => attr(tag, attribute) === key)
    .map(tag => attr(tag, "content")).filter(Boolean);
}
function exactMeta(html, property, expected) {
  const entries = values(html, "property", property);
  if (entries.length !== 1 || entries[0] !== expected) {
    const relevant = metaTags(html).filter(tag =>
      /property=["']og:|name=["'](description|twitter:)/i.test(tag)
    ).slice(0, 24);
    const title = html.match(/<title[^>]*>(.*?)<\\/title>/is)?.[1] || "(missing title)";
    console.error("Prerendered SEO diagnostics:", JSON.stringify({ title, property, expected, entries, relevant }, null, 2));
  }
  assert.deepEqual(entries, [expected], property + " must be unique and match route; got " + JSON.stringify(entries));
}
function specificMeta(html, property, phrase) {
  const entries = values(html, "property", property);
  assert.equal(entries.length, 1, property + " must occur once; got " + JSON.stringify(entries));
  assert.ok(entries[0].includes(phrase), property + " must describe station, got " + entries[0]);
}
async function assertImage(path, magic) {
  const bytes = await readFile(join(output, path.slice(1)));
  assert.ok(bytes.subarray(0, magic.length).equals(Buffer.from(magic)), "Missing/invalid generated image: " + path);
}
const home = await loadPage("/");
const stationRoute = "/asia/viet-nam/vov-gt-hcm";
const station = await loadPage(stationRoute);
const homeImage = "/brand/social-preview.png";
const stationImage = "/og/stations/asia/viet-nam/vov-gt-hcm.jpg";
exactMeta(home, "og:image", origin + homeImage);
exactMeta(home, "og:url", origin + "/");
exactMeta(station, "og:image", origin + stationImage);
exactMeta(station, "og:url", origin + stationRoute);
specificMeta(station, "og:title", "VOV Giao");
specificMeta(station, "og:description", "VOV Giao thông TPHCM ra đời");
assert.deepEqual(values(station, "name", "twitter:image"), [origin + stationImage]);
if (origin === "https://radio.eplus.dev") {
  assert.ok(!values(station, "name", "robots").some(x => x.includes("noindex")), "Production must be indexable");
} else {
  assert.ok(values(station, "name", "robots").some(x => x.includes("noindex")), "Staging must remain noindex");
}
await assertImage(homeImage, [137, 80, 78, 71, 13, 10, 26, 10]);
await assertImage(stationImage, [255, 216, 255]);
console.log("PASS: prerendered homepage and station have unique, route-specific OG images and descriptions.");
