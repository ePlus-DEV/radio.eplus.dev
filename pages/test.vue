<template>
  <div>
    <!--  <pre> {{ countries }} </pre> -->

    <!-- <pre>
    <template v-for="(item, key) in countries">
      <div :key="key">
        <template v-for="(station, i) in item">
          <div :key="i">
            {{ station.name }}
          </div>
        </template>
      </div>
    </template>
     </pre> -->
  </div>
</template>

<script>
// import countries from "@/static/assets/radio/countries.json";
/*

for (const [key, value] of Object.entries(countries)) {
  for (const [index, item] of Object.entries(value)) {
    // import test from "@/static/"+item.data;
    const test = require("static/" + item.data);
    console.log(test);
  }
}
 */

// var fs = require("fs");
/* const fs = require("fs").promises;

var files = fs.readdir("./static/assets/radio");

console.log(files); */

var cache = {};
const images = require.context("../static/assets/radio/asia/", false, /\.json$/);
var imagesArray = Array.from(images.keys());
var constructed = [];
function constructItems(fileNames, constructed) {
  fileNames.forEach((fileName) => {
    constructed.push({
      src: fileName.substr(1),
    });
  });
  return constructed;
}
var res = constructItems(imagesArray, constructed);
console.log(res);

export default {
  data() {
    return {
      // countries: countries,
    };
  },
};
</script>
