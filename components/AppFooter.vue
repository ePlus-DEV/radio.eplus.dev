<template>
  <div>
    <button
      @click="scrollToTop"
      id="topButton"
      class="fixed z-10 p-3 hidden bg-gray-100 rounded-full shadow-md bottom-10 right-10 animate-bounce"
    >
      <fa :icon="['fal', 'up']" size="2x" />
    </button>

    <section class="bg-white dark:bg-gray-900 rounded-lg">
      <div
        class="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8"
      >
        <nav class="flex flex-wrap justify-center -mx-5 -my-2">
          <div v-for="link in links" :key="link.id" class="px-5 py-2">
            <NuxtLink
              :to="link.to"
              class="text-base leading-6 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              {{ $t(link.text) }}
            </NuxtLink>
          </div>
        </nav>

        <div class="flex justify-center mt-8 space-x-6">
          <a
            v-for="socialLink in socialLinks"
            :key="socialLink.id"
            target="_blank"
            rel="external nofollow noopener noreferrer"
            :href="socialLink.href"
            class="text-gray-400 hover:text-gray-500"
          >
            <span class="sr-only">{{ socialLink.name }}</span>
            <fa :icon="['fab', socialLink.icon]" class="w-6 h-6" />
          </a>
        </div>

        <div class="flex justify-center">
          <div
            :data-tip="
              $t('text.hosted', { name: 'DigitalOcean', time: lastUpdate })
            "
            class="tooltip"
          >
            <a
              target="_blank"
              rel="external nofollow noopener noreferrer"
              href="https://www.digitalocean.com/?refcode=bfa0034e378d&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge"
            >
              <img
                loading="lazy"
                :src="`https://img.shields.io/badge/${encodeURIComponent(status)}-${encodeURIComponent(color)}.svg?style=for-the-badge&logo=digitalOcean&logoColor=white`"
                alt="DigitalOcean Referral Badge"
              />
            </a>
          </div>
        </div>

        <p class="mt-4 text-center text-gray-400">
          Copyright © {{ new Date().getFullYear() }}
          <a
            class="hover:text-gray-900 dark:hover:text-white cursor-pointer"
            :href="config.public.copyright"
            target="_blank"
            rel="external nofollow noopener noreferrer"
          >
            <img
              src="https://cdn.jsdelivr.net/gh/ePlus-DEV/cdn.eplus.dev/img/brand/logo.svg"
              alt="logo eplus.dev"
              class="w-7 h-7 inline-block cursor-pointer"
            />Plus.DEV
          </a>
        </p>
      </div>
    </section>
  </div>
</template>

<script setup>
const config = useRuntimeConfig();

const status = ref('digitalocean');
const color = ref('#0167ff');
const lastUpdate = ref(new Date().getFullYear());
const links = ref([
  { id: 1, to: '/about', text: 'navmenu.about' },
  { id: 2, to: '/privacy-policy', text: 'navmenu.privacy' },
  { id: 3, to: '/terms-of-use', text: 'navmenu.terms' },
  { id: 4, to: '/statistics', text: 'navmenu.statistics' },
]);
const socialLinks = ref([
  {
    id: 1,
    name: 'Facebook',
    href: config.public.facebook,
    icon: 'facebook-f',
  },
  {
    id: 2,
    name: 'X',
    href: config.public.x,
    icon: 'x-twitter',
  },
  { id: 3, name: 'GitHub', href: config.public.github, icon: 'github' },
]);

/// <summary>
/// Handles the scroll event to toggle the visibility of the "scroll to top" button.
/// </summary>
const handleScroll = () => {
  const topButton = document.getElementById('topButton');
  if (topButton) {
    topButton.classList.toggle('hidden', window.scrollY <= 20);
  }
};

/**
 * Scrolls the window to the top smoothly.
 */
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

/**
 * Fetches the last update information from the DigitalOcean API and updates the status and color accordingly.
 */
const getLastUpdate = async () => {
  const { data, error } = await useFetch(config.public.digitaloceanEndpoint, {
    headers: {
      Authorization: `Bearer ${config.public.digitaloceanApiKey}`,
    },
  });

  if (error.value) {
    console.log(error.value);
    return;
  }

  const responseData = data.value;
  const success_steps = responseData.deployments[0].progress.success_steps;
  const total_steps = responseData.deployments[0].progress.total_steps;
  if (success_steps === total_steps) {
    lastUpdate.value = moment(responseData.deployments[0].phase_last_updated_at).format('LLLL');
    status.value = 'digitalocean';
    color.value = '#0167ff';
  } else {
    status.value = `Deployment_(${success_steps}/${total_steps})`;
    color.value = '#031b4e';
    lastUpdate.value = moment(responseData.deployments[0].created_at).format('LLLL');
  }
  setInterval(getLastUpdate, 900000); // 15 minutes
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  getLastUpdate();
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>