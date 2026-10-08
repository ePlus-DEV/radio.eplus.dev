import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

export type RadioSeoLevel = "home" | "area" | "country" | "station";

export interface RadioSeoRoute {
  loc: string;
  level: RadioSeoLevel;
  title?: string;
  description?: string;
  image?: string;
  lastmod?: string;
}

interface StationRecord {
  title?: string;
  description?: string;
  features?: string;
}

export const getRadioSeoRoutes = (
  rootDir: string = process.cwd(),
): RadioSeoRoute[] => {
  const radioDir = join(rootDir, "public", "radio");
  const homeRoute: RadioSeoRoute = { loc: "/", level: "home" };
  const routes: RadioSeoRoute[] = [homeRoute];
  let latestSiteMtime = 0;

  for (const areaEntry of readdirSync(radioDir, { withFileTypes: true })) {
    if (!areaEntry.isDirectory()) continue;

    const area = areaEntry.name;
    const areaRoute: RadioSeoRoute = { loc: `/${area}`, level: "area" };
    routes.push(areaRoute);

    let latestAreaMtime = 0;
    const areaDir = join(radioDir, area);
    for (const countryFile of readdirSync(areaDir, { withFileTypes: true })) {
      if (!countryFile.isFile() || !countryFile.name.endsWith(".json")) {
        continue;
      }

      const country = countryFile.name.replace(/\.json$/, "");
      const countryPath = join(areaDir, countryFile.name);
      const mtime = statSync(countryPath).mtimeMs;
      const lastmod = new Date(mtime).toISOString();

      latestAreaMtime = Math.max(latestAreaMtime, mtime);
      latestSiteMtime = Math.max(latestSiteMtime, mtime);

      routes.push({
        loc: `/${area}/${country}`,
        level: "country",
        lastmod,
      });

      try {
        const stations = JSON.parse(
          readFileSync(countryPath, "utf8"),
        ) as Record<string, StationRecord>;

        for (const [station, data] of Object.entries(stations)) {
          routes.push({
            loc: `/${area}/${country}/${station}`,
            level: "station",
            title: data.title,
            description: data.description,
            image: data.features,
            lastmod,
          });
        }
      } catch (error) {
        console.warn(
          `Unable to read radio catalog for ${area}/${country}:`,
          error,
        );
      }
    }

    if (latestAreaMtime > 0) {
      areaRoute.lastmod = new Date(latestAreaMtime).toISOString();
    }
  }

  if (latestSiteMtime > 0) {
    homeRoute.lastmod = new Date(latestSiteMtime).toISOString();
  }

  return routes;
};

export const getSitemapEntry = (route: RadioSeoRoute) => {
  const freshness = route.lastmod ? { lastmod: route.lastmod } : {};

  switch (route.level) {
    case "home":
      return { loc: route.loc, priority: 1, changefreq: "daily" as const, ...freshness };
    case "area":
      return { loc: route.loc, priority: 0.8, changefreq: "weekly" as const, ...freshness };
    case "country":
      return { loc: route.loc, priority: 0.9, changefreq: "daily" as const, ...freshness };
    default:
      return { loc: route.loc, priority: 0.8, changefreq: "daily" as const, ...freshness };
  }
};
