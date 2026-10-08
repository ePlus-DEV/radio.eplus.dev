export const normalizeScheduleUrl = (value) => {
  if (typeof value !== "string") return "";

  const url = value.trim();
  if (!/^https?:\/\//i.test(url)) return "";

  return url;
};

export const isZingScheduleUrl = (value) => {
  const url = normalizeScheduleUrl(value);
  if (!url) return false;

  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === "zing.eplus.dev" &&
      parsed.pathname.startsWith("/api/live-stream-program-list")
    );
  } catch {
    return false;
  }
};
