<template>
  <div>
    <!---->
    <!--<video ref="videoPlayer" id="my-player" class="video-js" controls preload='auto' width='640' height='264'
           poster='https://static-media.streema.com/media/cache/14/fb/14fbff199f3648d21289af5e36eb9ef5.jpg' data-setup='{}'></video>-->

    <el-card class="box-card" style="margin: 15px 0 15px 0">

      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small" id="radio-name">Radio.ePlus.DEV</el-button>
        </el-badge>
      </div>

      <div id="radio-player"></div>

      <!--<audio id='my-player' class='video-js' style="margin-top: 25px" autoplay controls preload='auto' width="500" height="250" data-setup='{
            "inactivityTimeout": 0,
            "aspectRatio": "1:0",
            "fluid": true,
            "controlBar": {"fullscreenToggle": false},
            "language":"vi"
           }'>
        <source src='http://media-ice.musicradio.com:80/HeartLondon' type='audio/mpeg' />

        <p class='vjs-no-js'>
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>
        </p>
      </audio>-->

    </el-card>

  </div>
</template>
