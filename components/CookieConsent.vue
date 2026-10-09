<template>
  <div
    v-if="visible"
    class="fixed left-3 right-3 z-[80] rounded-2xl border border-[var(--radio-border)] bg-[var(--radio-surface-elevated)] p-4 shadow-2xl shadow-black/30 sm:left-auto sm:right-5 sm:w-[22rem]"
    :style="{ bottom: 'calc(var(--radio-player-height) + var(--radio-mobile-nav-height) + env(safe-area-inset-bottom) + 1rem)' }"
    role="dialog"
    aria-live="polite"
    :aria-label="$t('cookie_consent.title')"
  >
    <div class="flex items-start gap-3">
      <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400">
        <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" aria-hidden="true">
          <path d="M20 12.2A8 8 0 1 1 11.8 4a2.9 2.9 0 0 0 3.1 3.1A2.9 2.9 0 0 0 18 10.2a2.9 2.9 0 0 0 2 .8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M8.2 10.4h.01M11 15.5h.01M14.5 12.8h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" />
        </svg>
      </div>
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-[var(--radio-text)]">
          {{ $t("cookie_consent.title") }}
        </p>
        <p class="mt-1 text-xs leading-5 text-[var(--radio-text-muted)]">
          {{ $t(analyticsAvailable ? "cookie_consent.analytics_body" : "cookie_consent.body") }}
        </p>
      </div>
    </div>

    <div class="mt-4 flex flex-wrap items-center gap-2">
      <UButton
        size="sm"
        class="cursor-pointer rounded-xl bg-rose-500 text-white hover:bg-rose-400"
        @click="accept"
      >
        {{ $t(analyticsAvailable ? "cookie_consent.allow_analytics" : "cookie_consent.accept") }}
      </UButton>
      <UButton
        v-if="analyticsAvailable"
        size="sm"
        color="neutral"
        variant="soft"
        class="cursor-pointer rounded-xl"
        @click="denyAnalytics"
      >
        {{ $t("cookie_consent.essential_only") }}
      </UButton>
      <UButton
        to="/cookie-policy"
        color="neutral"
        variant="ghost"
        size="sm"
        class="cursor-pointer rounded-xl"
      >
        {{ $t("cookie_consent.learn_more") }}
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ANALYTICS_CONSENT_EVENT, ANALYTICS_CONSENT_KEY, isAnalyticsDecision } from '~/utils/ga4-config.mjs';

const STORAGE_KEY = 'radio:cookie-consent';
const config = useRuntimeConfig();
const visible = ref(false);
const analyticsAvailable = ref(false);

const choose = (allowAnalytics: boolean): void => {
  window.localStorage.setItem(STORAGE_KEY, 'accepted');
  if (analyticsAvailable.value) {
    window.localStorage.setItem(ANALYTICS_CONSENT_KEY, allowAnalytics ? 'granted' : 'denied');
    window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
  }
  visible.value = false;
};

const accept = (): void => choose(true);
const denyAnalytics = (): void => choose(false);

const onPreferenceChanged = () => { visible.value = false; };

onMounted(() => {
  analyticsAvailable.value = Boolean(config.public.ga4Enabled)
    && window.location.hostname === 'radio.eplus.dev';
  visible.value = analyticsAvailable.value
    ? !isAnalyticsDecision(window.localStorage.getItem(ANALYTICS_CONSENT_KEY))
    : window.localStorage.getItem(STORAGE_KEY) !== 'accepted';
  window.addEventListener(ANALYTICS_CONSENT_EVENT, onPreferenceChanged);
});
onBeforeUnmount(() => {
  window.removeEventListener(ANALYTICS_CONSENT_EVENT, onPreferenceChanged);
});
</script>
