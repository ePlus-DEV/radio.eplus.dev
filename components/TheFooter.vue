<template>
  <div>
    <button @click="scrollToTop" id="topButton" class="fixed z-10 p-3 hidden bg-gray-100 rounded-full shadow-md bottom-10 right-10 animate-bounce">
      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
      </svg>
    </button>

    <section class="bg-white dark:bg-gray-900 rounded-lg">
      <div class="max-w-screen-xl px-4 py-12 mx-auto space-y-8 overflow-hidden sm:px-6 lg:px-8">
        <nav class="flex flex-wrap justify-center -mx-5 -my-2">
          <div v-for="link in links" :key="link.id" class="px-5 py-2">
            <nuxt-link :to="link.to"
              class="text-base leading-6 text-gray-500 hover:text-gray-900 dark:hover:text-white">
              {{ link.text }}
            </nuxt-link>
          </div>
        </nav>

        <div class="flex justify-center mt-8 space-x-6">
          <a v-for="socialLink in socialLinks" :key="socialLink.id" target="_blank" :href="socialLink.href"
            class="text-gray-400 hover:text-gray-500">
            <span class="sr-only">{{ socialLink.name }}</span>
            <svg class="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path fill-rule="evenodd" :d="socialLink.icon"></path>
            </svg>
          </a>
        </div>

        <div class="flex justify-center">
          <div :data-tip="$t('text.hosted', { name: 'DigitalOcean', time: lastUpdate })" class="tooltip">
            <a target="_blank"
              href="https://www.digitalocean.com/?refcode=bfa0034e378d&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge">
              <img
                src="https://img.shields.io/badge/DigitalOcean-%230167ff.svg?style=for-the-badge&logo=digitalOcean&logoColor=white"
                alt="DigitalOcean Referral Badge" />
            </a>
          </div>
        </div>

        <p class="mt-4 text-center text-gray-400">
          Copyright © {{ new Date().getFullYear() }}
          <a class="hover:text-gray-900 dark:hover:text-white cursor-pointer" :href="$config.Copyright" target="_blank">
            <img src="https://cdn.jsdelivr.net/gh/ePlus-DEV/cdn.eplus.dev/img/brand/logo.svg" alt="logo eplus.dev"
              class="w-7 h-7 inline-block cursor-pointer" />Plus.DEV
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
        { id: 1, name: "Facebook", href: this.$config.Facebook, icon: "M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" },
        { id: 2, name: "Instagram", href: this.$config.Instagram, icon: "M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" },
        { id: 3, name: "GitHub", href: this.$config.Github, icon: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" },
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
          this.lastUpdate = this.$moment(data.deployments[0].phase_last_updated_at).format('LLLL');
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
