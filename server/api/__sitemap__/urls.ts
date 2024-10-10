import { defineSitemapEventHandler } from "#imports";
import world from "public/radio/world.json";

export default defineSitemapEventHandler(() => {
  const routesToGenerate = [];

  for (const [continentKey, continent] of Object.entries(world)) {
    const region = continentKey.replace(/_/g, "-");
    routesToGenerate.push({
      loc: `/${region}`,
      _sitemap: "pages",
    });

    for (const countryKey of Object.keys(
      continent as Record<string, unknown>,
    )) {
      routesToGenerate.push({
        loc: `/${region}/${countryKey}`,
        _sitemap: "pages",
      });

      for (const key of Object.keys(
        (continent as Record<string, Record<string, unknown>>)[countryKey],
      )) {
        routesToGenerate.push({
          loc: `/${region}/${countryKey}/${key}`,
          _sitemap: "pages",
        });
      }
    }
  }

  return routesToGenerate;
});
