jwplayer.key="YgtWotBOi+JsQi+stgRlQ3SK21W2vbKi/K2V86kVbwU=";
jwplayer("radio-player").setup({
  width: "530",
  height: "40",
  "playlist": [
    {
      "sources": [
        {
          "default": false,
          "file": "https://a.files.bbci.co.uk/media/live/manifesto/audio/simulcast/hls/nonuk/low/ak/bbc_radio_three.m3u8",
          "title": "Sintel Trailer",
          "type": "hls",
          "label": "0"
        }
      ]
    }
  ],
  'flashplayer': '/jwplayer/player.swf',
  "primary": "html5",
  "hlshtml": true,
  "autostart": true,
  "androidhls": true
});
