jwplayer.key = "YgtWotBOi+JsQi+stgRlQ3SK21W2vbKi/K2V86kVbwU=";
jwplayer("radio-player").setup({
  width: "100%",
  height: "40",
  "playlist": [
    {
      "sources": [
        {
          "default": false,
          // "file": "https://5a6872aace0ce.streamlock.net/nghevov1/vov1.stream_aac/playlist.m3u8",
          "file": "https://5a6872aace0ce.streamlock.net/nghevovgthn/vovgthn.stream_aac/playlist.m3u8",
          "title": "Sintel Trailer",
          "type": "hls",
          "label": "0"
        }
      ]
    }
  ],
  "primary": "html5",
  "hlshtml": true,
  "autostart": true,
  "androidhls": true
});
