module.exports = {
  purge: [
    "./components/**/*.{vue,js}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./nuxt.config.{js,ts}",
    './content/**/*.md'
  ],
  darkMode: "class", // or 'media' or 'class'
  theme: {
    darkSelector: ".dark-mode"
  },
  variants: {
    extend: {}
  },
  plugins: [require("daisyui")]
};
