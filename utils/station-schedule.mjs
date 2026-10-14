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


// A reference guide contains actual time windows, while legacy provider EPG
// reports the currently playing item first. When there is a gap, scroll to
// the next listed programme (or the last if today's listings have ended).
// Never *highlight* a nearest entry as live unless its interval contains now.
export const schedulePosition = (programs, nowSeconds, isReference = false) => {
  if (!Array.isArray(programs) || programs.length === 0) {
    return { currentIndex: -1, scrollIndex: -1 };
  }
  if (!isReference) return { currentIndex: 0, scrollIndex: 0 };

  const currentIndex = programs.findIndex(item =>
    Number.isFinite(item?.startTime) && Number.isFinite(item?.endTime)
    && item.startTime <= nowSeconds && nowSeconds < item.endTime
  );
  if (currentIndex !== -1) return { currentIndex, scrollIndex: currentIndex };

  const upcomingIndex = programs.findIndex(item =>
    Number.isFinite(item?.startTime) && item.startTime > nowSeconds
  );
  return {
    currentIndex: -1,
    scrollIndex: upcomingIndex !== -1 ? upcomingIndex : programs.length - 1,
  };
};
