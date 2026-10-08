import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";

const read = path => readFile(path, "utf8");
const isFile = async path => {
  try { return (await stat(path)).isFile(); } catch { return false; }
};

const output = ".output/public";
const [home, robots] = await Promise.all([
  read(`${output}/index.html`),
  read(`${output}/robots.txt`),
]);

assert.match(home, /<meta(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i, "staging must render a robots noindex meta");
assert.doesNotMatch(home, /<link[^>]*rel=["']canonical["']/i, "staging must not render production canonical");
assert.doesNotMatch(home, /application\/ld\+json/i, "staging must not embed JSON-LD");
assert.doesNotMatch(home, /<meta[^>]*property=["']og:/i, "staging must omit Open Graph metadata");
assert.match(robots, /^User-agent: \*\s*\nDisallow: \/\s*$/i, "staging robots.txt must disallow all crawling");
assert.doesNotMatch(robots, /Sitemap:/i, "staging robots.txt must not announce a sitemap");
assert.equal(await isFile(`${output}/sitemap.xml`), false, "staging must not generate sitemap.xml");
console.log("PASS: staging prerendered HTML has noindex, no canonical/JSON-LD/social SEO; robots blocks crawlers; sitemap is absent.");
