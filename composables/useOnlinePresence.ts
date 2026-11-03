import { useOnlineDurationStore } from '~/stores/onlineDuration';
import { createOnlineDurationTracker, ONLINE_IDLE_MS } from '~/utils/online-duration.mjs';

/**
 * Global page presence is independent of audio playback: hidden/background
 * radio can continue listening, but never accrues foreground online time.
 * Avoid one-second timers across the entire site when stats are not visible.
 */
export function useOnlinePresence() {
  const online = useOnlineDurationStore();
  const route = useRoute();
  let cleanup: (() => void) | null = null;

  onMounted(() => {
    online.hydrate();
    const tracker = createOnlineDurationTracker({
      onDuration: (ms: number, endDate: Date) => online.record(ms, endDate),
    });

    let timer: ReturnType<typeof setTimeout> | null = null;
    let ticks = 0;
    let lastEngagementAt = performance.now();
    const statsVisible = () => route.path === '/library' && route.hash === '#stats';
    const eligible = () => online.enabled && navigator.onLine
      && document.visibilityState === 'visible' && document.hasFocus();
    const engaged = () => eligible() && performance.now() - lastEngagementAt < ONLINE_IDLE_MS;

    const stopTimer = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
    };
    const showPreview = () => {
      // The stats UI needs a 1s preview; all other routes only persist every 5s.
      online.setLivePreview(statsVisible() ? tracker.pendingMs : 0);
    };
    const schedule = () => {
      if (timer !== null || !engaged()) return;
      timer = window.setTimeout(tick, statsVisible() ? 1_000 : 5_000);
    };
    const tick = () => {
      timer = null;
      if (!engaged()) {
        if (online.enabled) tracker.stop();
        else tracker.discard();
        online.setLivePreview(0);
        return;
      }
      tracker.start();
      ticks += 1;
      if (!statsVisible() || ticks % 5 === 0) tracker.flush();
      showPreview();
      schedule();
    };
    const sync = () => {
      stopTimer();
      if (engaged()) {
        tracker.start();
        showPreview();
        schedule();
      } else {
        if (online.enabled) tracker.stop();
        else tracker.discard();
        online.setLivePreview(0);
      }
    };
    const activity = () => {
      if (!eligible()) return;
      const current = performance.now();
      // A new click after a long idle cannot claim the preceding idle gap.
      if (current - lastEngagementAt >= ONLINE_IDLE_MS) tracker.discard();
      lastEngagementAt = current;
      tracker.activity();
      if (timer === null) sync();
    };
    const reset = () => {
      tracker.discard();
      online.setLivePreview(0);
      sync();
    };
    const onForeground = () => {
      if (eligible()) activity();
      sync();
    };
    const onPageHide = () => {
      stopTimer();
      tracker.stop();
      online.setLivePreview(0);
    };

    document.addEventListener('visibilitychange', onForeground);
    window.addEventListener('focus', onForeground);
    window.addEventListener('pageshow', onForeground);
    for (const name of ['blur', 'online', 'offline']) window.addEventListener(name, sync);
    for (const name of ['pointerdown', 'keydown', 'touchstart', 'scroll'])
      window.addEventListener(name, activity, { passive: true });
    window.addEventListener('radio:online-duration-reset', reset);
    window.addEventListener('pagehide', onPageHide);
    const stopRouteWatcher = watch(() => [route.path, route.hash], sync);
    sync();

    cleanup = () => {
      stopTimer();
      tracker.stop();
      online.setLivePreview(0);
      stopRouteWatcher();
      document.removeEventListener('visibilitychange', onForeground);
      window.removeEventListener('focus', onForeground);
      window.removeEventListener('pageshow', onForeground);
      for (const name of ['blur', 'online', 'offline']) window.removeEventListener(name, sync);
      for (const name of ['pointerdown', 'keydown', 'touchstart', 'scroll'])
        window.removeEventListener(name, activity);
      window.removeEventListener('radio:online-duration-reset', reset);
      window.removeEventListener('pagehide', onPageHide);
    };
  });
  onBeforeUnmount(() => cleanup?.());
}
