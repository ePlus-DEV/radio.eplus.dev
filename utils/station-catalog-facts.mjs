// Supplemental presentation facts from public station catalog entries.
// These are never proof of live availability, a verified station identity,
// or the actual language/genre of a currently playing program.
const MAX_LABEL_LENGTH = 120;

function catalogLabel(value) {
  if (typeof value !== 'string') return '';
  const label = value.trim();
  if (!label || label.length > MAX_LABEL_LENGTH || /[\u0000-\u001f\u007f]/u.test(label)) return '';
  return label;
}

function catalogHomepage(value) {
  if (typeof value !== 'string' || value.length > 2048) return null;
  try {
    const parsed = new URL(value.trim());
    if (!['http:', 'https:'].includes(parsed.protocol) ||
        parsed.username || parsed.password) return null;
    const hostname = parsed.hostname.toLowerCase();
    // Catalog mistakes or injected credentials must not become links to a
    // listener's router, loopback interface or internal network.
    if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') ||
        hostname.endsWith('.local') || hostname.startsWith('[') ||
        /^\d+\.\d+\.\d+\.\d+$/.test(hostname)) return null;
    return { url: parsed.href, host: parsed.host.replace(/^www\./i, '') };
  } catch {
    return null;
  }
}

export function stationCatalogFacts(meta) {
  const category = catalogLabel(meta?.category);
  const language = catalogLabel(meta?.language);
  // `url` in the existing geographic radio catalog is the station homepage;
  // `stream` and `streams` are playback URLs and are never shown here.
  const website = catalogHomepage(meta?.url);
  return {
    category,
    language,
    homepage: website?.url || '',
    homepageHost: website?.host || '',
    hasFacts: Boolean(category || language || website),
  };
}
