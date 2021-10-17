<template>
  <div>
    <!-- START HEADER -->
    <Header />
    <!-- END HEADER -->

    <div class="container mx-auto px-4" scroll-container>
      <!-- START BREADCRUMBS -->
      <Breadcrumbs />
      <!-- END BREADCRUMBS -->

      <!-- START CONTENT -->
      <nuxt />
      <!-- End CONTENT -->
      <!-- START FOOTER -->
      <Footer />
      <!-- END FOOTER -->
    </div>
  </div>
</template>

<script>
import Header from "~/components/Header.vue";
import Breadcrumbs from "~/components/Breadcrumbs.vue";
import Footer from "~/components/Footer.vue";
// import NavBar from "~/components/NavBar.vue";
// import Player from '~/components/Player.vue'
// import PanelRadio from '~/components/PanelRadio.vue'

export default {
  head() {
    return {
      script: [
        // {src: '//code.jquery.com/jquery-1.11.0.min.js', body: false, ssr: true},
        // {src: 'http://jwpsrv.com/library/4+R8PsscEeO69iIACooLPQ.js', body: false, ssr: true},
        // {src: '/custom/js/player.js', body: false, ssr: false},
      ],
    };
  },
  components: {
    Header,
    Breadcrumbs,
    Footer,
    // NavBar,
    // Player,
    // PanelRadio
  },
};
</script>
