<template>
  <div class="space-y-6">
    <SitePageHero
      :eyebrow="t('site_pages.contact.eyebrow')"
      :title="title"
      :description="description"
    />

    <section class="grid gap-4 md:grid-cols-3">
      <article
        v-for="section in sections"
        :key="section"
        class="radio-surface rounded-3xl p-5 sm:p-6"
      >
        <h2 class="text-lg font-semibold text-[var(--radio-text)]">
          {{ t("site_pages.contact.sections." + section + ".title") }}
        </h2>
        <p class="mt-3 text-sm leading-7 text-[var(--radio-text-muted)]">
          {{ t("site_pages.contact.sections." + section + ".body") }}
        </p>
        <a
          v-if="section === 'bug' || section === 'station'"
          :href="issueLinks[section]"
          target="_blank"
          rel="noopener noreferrer"
          class="radio-interactive mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--radio-border)] px-4 text-sm font-semibold text-rose-700 transition-colors hover:bg-[var(--radio-hover)] dark:text-rose-300"
        >
          {{ t("site_pages.contact.sections." + section + ".action") }}
          <UIcon name="i-lucide-external-link" class="h-4 w-4" aria-hidden="true" />
        </a>
      </article>
    </section>

    <section class="radio-surface rounded-3xl p-5 sm:p-6">
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-[var(--radio-text)]">
            {{ t("site_pages.contact.support.title") }}
          </h2>
          <p class="mt-2 max-w-2xl text-sm leading-6 text-[var(--radio-text-muted)]">
            {{ t("site_pages.contact.support.body") }}
          </p>
        </div>
        <a
          href="mailto:support@eplus.dev?subject=ePlus%20OnAir%20support"
          class="radio-interactive inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 px-4 text-sm font-semibold text-white hover:bg-rose-600"
        >
          {{ t("site_pages.contact.support.action") }}
        </a>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();
const title = computed(() => t("site_pages.contact.title"));
const description = computed(() => t("site_pages.contact.description"));
const sections = ["bug", "station", "copyright"] as const;
// Link to the correct public issue form. No visitor data is sent on click;
// GitHub only receives information the reporter enters and submits manually.
const issueLinks = {
  bug: "https://github.com/ePlus-DEV/radio.eplus.dev/issues/new?template=02-website-bug.yml",
  station: "https://github.com/ePlus-DEV/radio.eplus.dev/issues/new?template=03-station-update.yml",
} as const;

useStaticPageSeo({
  title,
  description,
  type: "ContactPage",
});
</script>
