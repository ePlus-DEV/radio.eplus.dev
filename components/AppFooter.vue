<template>
  <footer class="border-t border-slate-200/80 bg-white/70 dark:border-white/10 dark:bg-slate-950">
    <div class="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div class="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-end">
        <div>
          <NuxtLink to="/" class="inline-flex items-center gap-3">
            <span
              class="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 dark:bg-white"
            >
              <img
                src="/brand/logo-white.svg"
                width="28"
                height="28"
                alt="Radio ePlus"
                class="h-7 w-7 object-contain dark:brightness-0"
              />
            </span>
            <span>
              <span class="block text-sm font-bold text-slate-950 dark:text-white">
                Radio ePlus
              </span>
              <span class="block text-xs text-slate-400">
                Live radio from around the world
              </span>
            </span>
          </NuxtLink>

          <p class="mt-4 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
            Browse stations by region and country, then listen instantly from any device.
          </p>

          <div class="mt-5 flex items-center gap-2">
            <a
              v-for="socialLink in socialLinks"
              :key="socialLink.id"
              :href="socialLink.href"
              target="_blank"
              rel="external nofollow noopener noreferrer"
              class="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-slate-300 hover:bg-slate-100 hover:text-slate-700 dark:border-white/10 dark:hover:bg-white/5 dark:hover:text-white"
            >
              <span class="sr-only">{{ socialLink.name }}</span>
              <fa :icon="['fab', socialLink.icon]" class="h-4 w-4" />
            </a>
          </div>
        </div>

        <div class="lg:text-right">
          <nav class="flex flex-wrap gap-x-5 gap-y-3 lg:justify-end">
            <NuxtLink
              v-for="link in links"
              :key="link.id"
              :to="link.to"
              class="text-sm font-medium text-slate-500 transition hover:text-slate-950 dark:text-slate-400 dark:hover:text-white"
            >
              {{ $t(link.text) }}
            </NuxtLink>
            <a
              href="https://old-radio.eplus.dev"
              target="_blank"
              rel="noopener noreferrer"
              class="text-sm font-medium text-slate-400 transition hover:text-slate-950 dark:hover:text-white"
            >
              {{ $t("navmenu.old_version") }}
            </a>
          </nav>

          <p class="mt-5 text-xs leading-5 text-slate-400">
            © {{ new Date().getFullYear() }}
            <a
              :href="config.public.copyright"
              target="_blank"
              rel="external nofollow noopener noreferrer"
              class="font-medium text-slate-500 hover:text-slate-950 dark:hover:text-white"
            >
              ePlus.DEV
            </a>
          </p>
        </div>
      </div>
    </div>

    <button
      v-show="showTop"
      type="button"
      class="fixed bottom-5 right-5 z-30 hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/90 text-slate-600 shadow-lg shadow-slate-900/10 backdrop-blur transition hover:-translate-y-0.5 hover:text-slate-950 dark:border-white/10 dark:bg-slate-900/90 dark:text-slate-300 dark:hover:text-white sm:flex"
      :aria-label="$t('button.back')"
      @click="scrollToTop"
    >
      <fa :icon="['fas', 'arrow-up']" />
    </button>
  </footer>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const showTop = ref(false);

const links = [
  { id: 1, to: "/about", text: "navmenu.about" },
  { id: 2, to: "/privacy-policy", text: "navmenu.privacy" },
  { id: 3, to: "/terms-of-use", text: "navmenu.terms" },
  { id: 4, to: "/statistics", text: "navmenu.statistics" },
];

const socialLinks = computed(() => [
  {
    id: 1,
    name: "Facebook",
    href: config.public.facebook,
    icon: "facebook-f",
  },
  {
    id: 2,
    name: "X",
    href: config.public.x,
    icon: "x-twitter",
  },
  {
    id: 3,
    name: "GitHub",
    href: config.public.github,
    icon: "github",
  },
]);

const handleScroll = (): void => {
  showTop.value = window.scrollY > 500;
};

const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>
