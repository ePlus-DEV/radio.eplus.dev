<template>
  <div>
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <span>Installation</span>
      </div>
      <p>
        First of all make sure you have installed
        <el-link type="danger" href="https://nodejs.org/en/" target="_blank"
          >Node</el-link
        >
        and
        <el-link type="danger" href="https://www.npmjs.com/" target="_blank">NPM</el-link
        >/<el-link type="danger" href="https://yarnpkg.com/" target="_blank">YARN</el-link
        >.
      </p>
      <pre><code class="language-bash">npm install</code></pre>
      <p>Now to run development server, run below command:</p>
      <pre><code class="language-bash">npm run dev</code></pre>
      <p>
        Now you will find some output after running above command in console as below:
      </p>
      <el-image src="https://i.imgur.com/GhOC4Xz.png"></el-image>
      <p>
        Visit
        <el-link type="danger" href="http://localhost:3030/" target="_blank"
          >http://localhost:3030/</el-link
        >
        to check frontend.
      </p>
    </el-card>
  </div>
</template>
<script>
export default {
  head() {
    return {
      title: "Documentation -  Radio " + this.title_slug + " - ",
      meta: [
        {
          hid: "description",
          name: "description",
          content: "Documentation",
        },
      ],
      link: [
        {
          rel: "stylesheet",
          href:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/themes/prism.min.css",
        },
        {
          rel: "stylesheet",
          href:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/toolbar/prism-toolbar.min.css",
        },
      ],
      script: [
        {
          type: "text/javascript",
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/clipboard.js/2.0.8/clipboard.min.js",
          // async: true,
          body: true,
        },
        {
          type: "text/javascript",
          src: "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/prism.min.js",
          // async: true,
          body: true,
        },
        {
          type: "text/javascript",
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/autolinker/prism-autolinker.min.js",
          // async: true,
          body: true,
        },
        {
          type: "text/javascript",
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/line-numbers/prism-line-numbers.min.js",
          // async: true,
          body: true,
        },
        {
          type: "text/javascript",
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/components/prism-diff.min.js",
          // async: true,
          body: true,
        },
        {
          type: "text/javascript",
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/diff-highlight/prism-diff-highlight.min.js",
          // async: true,
          body: true,
        },
        {
          type: "text/javascript",
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/toolbar/prism-toolbar.min.js",
          // async: true,
          body: true,
        },
        {
          type: "text/javascript",
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/command-line/prism-command-line.min.js",
          // async: true,
          body: true,
        },
        {
          type: "text/javascript",
          src:
            "https://cdnjs.cloudflare.com/ajax/libs/prism/1.24.1/plugins/copy-to-clipboard/prism-copy-to-clipboard.min.js",
          // async: true,
          body: true,
        },
      ],
    };
  },
};
</script>
<style lang="css">
.text-fc {
  color: #f3981d;
}

.text-product {
  color: #009688;
}

pre[class*="language-"] {
  position: relative;
  overflow: visible;
  border-radius: 5px;
}

pre[class*="language-"] .copy {
  content: "copy";
  padding: 2px 10px 0;
  position: absolute;
  top: 0;
  right: 0;
  transform: translate(-10px, -90%);
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
  color: white;
  background: #272822;
  cursor: pointer;
  transition: all 200ms ease;
}

pre[class*="language-"]:hover .copy {
  transform: translate(-10px, -100%);
}

pre[class*="language-"]:hover .copy:hover {
  color: gray;
}

code {
  overflow: scroll;
}

pre.diff-highlight > code .token.deleted:not(.prefix),
pre > code.diff-highlight .token.deleted:not(.prefix) {
  background-color: rgba(255, 0, 0, 0.1);
  color: inherit;
  display: block;
}

pre.diff-highlight > code .token.inserted:not(.prefix),
pre > code.diff-highlight .token.inserted:not(.prefix) {
  background-color: rgba(0, 255, 128, 0.1);
  color: inherit;
  display: block;
}

pre > code.highlight {
  outline: 3px solid red;
  outline-offset: 2px;
}
</style>
