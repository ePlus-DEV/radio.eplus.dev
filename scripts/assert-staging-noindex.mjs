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

assert.ok(/<meta(?=[^>]*name=["']robots["'])(?=[^>]*content=["'][^"']*noindex)[^>]*>/i.test(home), "staging must render a robots noindex meta");
assert.doesNotMatch(home, /<link[^>]*rel=["']canonical["']/i, "staging must not render production canonical");
assert.doesNotMatch(home, /application\/ld\+json/i, "staging must not embed JSON-LD");
assert.doesNotMatch(home, /<meta[^>]*property=["']og:/i, "staging must omit Open Graph metadata");
assert.match(robots, /^User-agent: \*\s*\nAllow: \/\s*$/i, "staging robots.txt must allow crawlers to read the noindex meta");
assert.doesNotMatch(robots, /^Disallow: \/\s*$/im, "staging robots.txt must not block crawlers from discovering noindex");
assert.doesNotMatch(robots, /Sitemap:/i, "staging robots.txt must not announce a sitemap");
assert.equal(await isFile(`${output}/sitemap.xml`), false, "staging must not generate sitemap.xml");
console.log("PASS: staging HTML has noindex and no SEO metadata; robots allows noindex discovery; sitemap is absent.");
