import { useOnlineDurationStore } from '~/stores/onlineDuration';
import { createOnlineDurationTracker, ONLINE_IDLE_MS } from '~/utils/online-duration.mjs';
import {
  ONLINE_PRESENCE_CHECKPOINT_MS,
  onlinePresenceTickInterval,
} from '~/utils/online-presence-timer.mjs';

/**
 * Run once in the global app shell, not on routed pages or in the audio player.
 * A foreground, focused, connected browser tab counts as online even if audio is paused.
 * Hidden tabs must not accumulate online time; background audio is tracked separately.
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
    let lastEngagementAt = performance.now();
    let lastCheckpointAt = lastEngagementAt;
    let timer: number | null = null;
    let tickDelay = 0;

    const eligible = () => online.enabled && navigator.onLine
      && document.visibilityState === 'visible' && document.hasFocus();
    const statsVisible = () => /(?:^|\/)library\/?$/.test(route.path) && route.hash === '#stats';

    const stopTimer = () => {
      if (timer !== null) window.clearInterval(timer);
      timer = null;
      tickDelay = 0;
    };

    // A five-second foreground checkpoint limits write frequency and stays
    // safely below the 15s maximum accounted by the underlying tracker.
    const tick = () => {
      const now = performance.now();
      if (now - lastCheckpointAt >= ONLINE_PRESENCE_CHECKPOINT_MS) {
        tracker.flush();
        lastCheckpointAt = now;
      }
      sync();
    };
    const schedule = () => {
      const delay = onlinePresenceTickInterval({
        eligible: eligible(),
        idle: performance.now() - lastEngagementAt >= ONLINE_IDLE_MS,
        statsVisible: statsVisible(),
      });
      if (delay === tickDelay) return;
      stopTimer();
      if (delay) {
        tickDelay = delay;
        timer = window.setInterval(tick, delay);
      }
    };
    const sync = () => {
      if (!eligible() || performance.now() - lastEngagementAt >= ONLINE_IDLE_MS) {
        if (online.enabled) tracker.stop();
        else tracker.discard();
      } else {
        tracker.start();
      }
      online.setLivePreview(tracker.pendingMs);
      schedule();
    };
    const activity = () => {
      if (!eligible()) return;
      lastEngagementAt = performance.now();
      tracker.activity();
      // An interaction restarts the timer after idleness without polling idle tabs.
      schedule();
    };
    const reset = () => {
      tracker.discard();
      lastCheckpointAt = performance.now();
      online.setLivePreview(0);
      sync();
    };
    const onForeground = () => {
      if (eligible()) activity();
      sync();
    };
    const onPageHide = () => {
      tracker.stop();
      online.setLivePreview(0);
      stopTimer();
    };

    document.addEventListener('visibilitychange', onForeground);
    window.addEventListener('focus', onForeground);
    window.addEventListener('pageshow', onForeground);
    for (const name of ['blur', 'online', 'offline']) window.addEventListener(name, sync);
    for (const name of ['pointerdown', 'keydown', 'touchstart', 'scroll']) {
      window.addEventListener(name, activity, { passive: true });
    }
    window.addEventListener('radio:online-duration-reset', reset);
    window.addEventListener('pagehide', onPageHide);

    // Route/hash changes can open the stats panel without remounting the shell.
    const stopRouteWatch = watch(() => [route.path, route.hash], sync, { flush: 'post' });
    sync();
    cleanup = () => {
      stopTimer();
      tracker.stop();
      online.setLivePreview(0);
      stopRouteWatch();
      document.removeEventListener('visibilitychange', onForeground);
      window.removeEventListener('focus', onForeground);
      window.removeEventListener('pageshow', onForeground);
      for (const name of ['blur', 'online', 'offline']) window.removeEventListener(name, sync);
      for (const name of ['pointerdown', 'keydown', 'touchstart', 'scroll']) {
        window.removeEventListener(name, activity);
      }
      window.removeEventListener('radio:online-duration-reset', reset);
      window.removeEventListener('pagehide', onPageHide);
    };
  });
  onBeforeUnmount(() => cleanup?.());
}
