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

// A missing block of *reference metadata* is not evidence that the radio has
// stopped broadcasting. Show a neutral "programme not listed" time marker,
// rather than attributing the next programme to the current moment.
// Index is where the marker belongs among chronologically ordered programmes.
export const referenceScheduleGap = (programs, nowSeconds) => {
  if (!Array.isArray(programs) || !programs.length || !Number.isFinite(nowSeconds)) return null;
  for (let index = 0; index < programs.length; index++) {
    const next = programs[index];
    if (!Number.isFinite(next?.startTime) || !Number.isFinite(next?.endTime)) return null;
    if (next.startTime <= nowSeconds && nowSeconds < next.endTime) return null;
    if (nowSeconds < next.startTime) {
      const previous = programs[index - 1];
      // Explicit inter-programme gaps and time before the first listed slot.
      if (!previous || (Number.isFinite(previous.endTime) && nowSeconds >= previous.endTime)) {
        return {
          insertIndex: index,
          nextTitle: next.title || '',
          nextStartTime: next.startTime,
        };
      }
      return null;
    }
  }
  // Today's published guide has finished. Don't label this as off-air.
  const last = programs[programs.length - 1];
  return Number.isFinite(last?.endTime) && nowSeconds >= last.endTime
    ? { insertIndex: programs.length, nextTitle: '', nextStartTime: null }
    : null;
};

// Percentage of actual elapsed wall-clock time in a scheduled interval.
// Used only as a reference-guide timeline, not an audio playback progress bar.
// Invalid or unknown bounds intentionally have no calculable position.
export const scheduleTimelineProgress = (startSeconds, endSeconds, nowSeconds) => {
  if (!Number.isFinite(startSeconds) || !Number.isFinite(endSeconds)
      || !Number.isFinite(nowSeconds) || endSeconds <= startSeconds) return null;
  return Math.min(100, Math.max(0, (nowSeconds - startSeconds) * 100 / (endSeconds - startSeconds)));
};
