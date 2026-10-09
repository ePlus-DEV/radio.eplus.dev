<template>
  <section v-if="available" class="radio-surface rounded-3xl p-5 sm:p-7" :aria-label="$t('cookie_consent.analytics_preferences')">
    <h2 class="text-lg font-semibold text-[var(--radio-text)]">{{ $t('cookie_consent.analytics_preferences') }}</h2>
    <p class="mt-2 text-sm leading-6 text-[var(--radio-text-muted)]">{{ $t('cookie_consent.analytics_body') }}</p>
    <p role="status" aria-live="polite" class="mt-3 text-xs font-semibold text-[var(--radio-text)]">
      {{ $t(consent === 'granted' ? 'cookie_consent.analytics_on' : 'cookie_consent.analytics_off') }}
    </p>
    <div class="mt-4 flex flex-wrap gap-2">
      <UButton class="cursor-pointer rounded-xl" :color="consent === 'granted' ? 'primary' : 'neutral'" :variant="consent === 'granted' ? 'solid' : 'soft'" @click="choose(true)">
        {{ $t('cookie_consent.allow_analytics') }}
      </UButton>
      <UButton class="cursor-pointer rounded-xl" color="neutral" :variant="consent === 'denied' ? 'solid' : 'soft'" @click="choose(false)">
        {{ $t('cookie_consent.essential_only') }}
      </UButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ANALYTICS_CONSENT_EVENT, ANALYTICS_CONSENT_KEY } from '~/utils/ga4-config.mjs';

const config = useRuntimeConfig();
const available = ref(false);
const consent = ref('denied');

const choose = (allow: boolean) => {
  consent.value = allow ? 'granted' : 'denied';
  window.localStorage.setItem('radio:cookie-consent', 'accepted');
  window.localStorage.setItem(ANALYTICS_CONSENT_KEY, consent.value);
  window.dispatchEvent(new Event(ANALYTICS_CONSENT_EVENT));
};

onMounted(() => {
  available.value = Boolean(config.public.ga4Enabled)
    && window.location.hostname === 'radio.eplus.dev';
  consent.value = window.localStorage.getItem(ANALYTICS_CONSENT_KEY) === 'granted' ? 'granted' : 'denied';
});
</script>
