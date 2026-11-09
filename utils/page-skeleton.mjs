// One responsive skeleton per actual Nuxt route family. This is intentionally
// display-only: no catalog request, player state or search/SEO side effects.
export function pageSkeletonKind(path = "/") {
  const value = String(path || "/").split(/[?#]/, 1)[0].replace(/\/+$/, "") || "/";
  if (value === "/") return "home";
  const parts = value.split("/").filter(Boolean);

  // Reserved Nuxt pages must be matched before the generic [area]/[country]
  // routes. Otherwise /settings looks like a continent and Apple Radio looks
  // like an ordinary country/station page.
  if (value === "/settings") return "settings";
  if (value === "/global-radio") return "global-radio";
  if (value === "/global-radio/apple-music") return "global-radio-provider";
  if (parts.length === 4 && parts[0] === "global-radio" && parts[1] === "apple-music") {
    return "global-radio-station";
  }
  if (parts[0] === "global-radio") return "info";

  if (parts.length === 1) {
    if (parts[0] === "library") return "library";
    if (parts[0] === "statistics") return "statistics";
    if (["about", "contact", "privacy-policy", "terms-of-use", "cookie-policy"].includes(parts[0])) return "info";
    return "area";
  }
  if (parts.length === 2) return "country";
  if (parts.length === 3) return "station";
  return "info";
}
