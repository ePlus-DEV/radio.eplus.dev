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
            <nuxt-link
              :to="link.to"
              class="text-base leading-6 text-gray-500 hover:text-gray-900 dark:hover:text-white"
            >
              {{ link.text }}
            </nuxt-link>
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
                src="https://img.shields.io/badge/DigitalOcean-%230167ff.svg?style=for-the-badge&logo=digitalOcean&logoColor=white"
                alt="DigitalOcean Referral Badge"
              />
            </a>
          </div>
        </div>

        <p class="mt-4 text-center text-gray-400">
          Copyright © {{ new Date().getFullYear() }}
          <a
            class="hover:text-gray-900 dark:hover:text-white cursor-pointer"
            :href="$config.Copyright"
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

<script>
export default {
  data() {
    return {
      lastUpdate: "",
      links: [
        { id: 1, to: "/about", text: this.$t("navmenu.about") },
        { id: 2, to: this.$config.Blog, text: this.$t("navmenu.blog") },
        { id: 3, to: "/privacy-policy", text: this.$t("navmenu.privacy") },
        { id: 4, to: "/terms-of-use", text: this.$t("navmenu.terms") },
        { id: 5, to: "/statistics", text: this.$t("navmenu.statistics") },
      ],
      socialLinks: [
        {
          id: 1,
          name: "Facebook",
          href: this.$config.Facebook,
          icon: "facebook-f",
        },
        {
          id: 2,
          name: "Instagram",
          href: this.$config.Instagram,
          icon: "instagram",
        },
        { id: 3, name: "GitHub", href: this.$config.Github, icon: "github" },
      ],
    };
  },
  mounted() {
    window.addEventListener("scroll", this.handleScroll);
  },
  beforeDestroy() {
    window.removeEventListener("scroll", this.handleScroll);
  },
  methods: {
    handleScroll() {
      const topButton = document.getElementById("topButton");
      if (topButton) {
        topButton.classList.toggle("hidden", window.scrollY <= 20);
      }
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    getLastUpdate() {
      let config = {
        method: "get",
        url: this.$config.DIGITALOCEAN_ENDPOINT,
        headers: {
          Authorization: "Bearer " + this.$config.DIGITALOCEAN_API_KEY,
        },
      };

      this.$axios(config)
        .then((response) => {
          var data = response.data;
          this.lastUpdate = this.$moment(
            data.deployments[0].phase_last_updated_at,
          ).format("LLLL");
        })
        .catch((error) => {
          console.log(error);
        });
    },
  },
  created() {
    this.getLastUpdate();
  },
};
</script>
