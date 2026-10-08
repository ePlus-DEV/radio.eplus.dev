// Generated per deployment instead of committed as a static public asset,
// so staging robots.txt cannot accidentally overwrite production during release.
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event);
  setHeader(event, "Content-Type", "text/plain; charset=utf-8");
  if (config.public.noIndex) {
    return "User-agent: *\nDisallow: /\n";
  }
  const origin = String(config.public.siteUrl || "https://radio.eplus.dev").replace(/\/$/, "");
  return `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${origin}/sitemap.xml\n`;
});
