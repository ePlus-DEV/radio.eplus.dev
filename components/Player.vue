<template>
  <div>

    <el-card class="box-card" style="margin: 15px 0 15px 0">

      <div slot="header" class="clearfix">
        <el-badge value="Live" class="item">
          <el-button size="small" id="radio-name">Radio.ePlus.DEV</el-button>
        </el-badge>
      </div>

      <audio id='my-player' class='video-js' style="margin-top: 25px;" controls preload='auto' width="500" height="250" >

        <p class='vjs-no-js'>
          To view this video please enable JavaScript, and consider upgrading to a web browser that
          <a href='https://videojs.com/html5-video-support/' target='_blank'>supports HTML5 video</a>
        </p>
      </audio>

    </el-card>

  </div>
</template>
