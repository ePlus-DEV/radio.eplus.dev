<template>
  <div>
    <!-- START HEADER -->
    <!--<el-header>-->
      <Header></Header>
    <!--</el-header>-->
    <!-- END HEADER -->
    <!-- START CONTENT -->
    <el-main>
<!--      <Player></Player>-->
      <nuxt />
<!--      <PanelRadio></PanelRadio>-->
    </el-main>
    <!-- End CONTENT -->
    <!-- START FOOTER -->
    <Footer></Footer>
    <!-- END FOOTER -->
  </div>
</template>

<script>
  import Header from '~/components/Header.vue'
  import Footer from '~/components/Footer.vue'
  import NavBar from '~/components/NavBar.vue'
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
          }
      },
      components: {
          Header,
          Footer,
          NavBar,
          // Player,
          // PanelRadio
      }
  }
</script>

<style>
html {
  font-family: 'Source Sans Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI',
    Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: 16px;
  word-spacing: 1px;
  -ms-text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
  -moz-osx-font-smoothing: grayscale;
  -webkit-font-smoothing: antialiased;
  box-sizing: border-box;
}

*,
*:before,
*:after {
  box-sizing: border-box;
  margin: 0;
}
</style>
