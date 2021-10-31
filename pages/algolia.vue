<template></template>
<script>
import algoliasearch from "algoliasearch";

// Asia
import vietnam from "@/static/assets/radio/asia/viet-nam.json";
import korea from "@/static/assets/radio/asia/korea.json";
import china from "@/static/assets/radio/asia/china.json";
import singapore from "@/static/assets/radio/asia/singapore.json";
// Europe
import uk from "@/static/assets/radio/europe/united-kingdom.json";
// North America
import cuba from "@/static/assets/radio/north-america/cuba.json";
// Oceania
import australia from "@/static/assets/radio/oceania/australia.json";

const client = algoliasearch("N87NFQVY0Z", "73e93ee2ef3aa6919b7c6495767c7f9d");
const index = client.initIndex("radio.eplus.dev");
const routesToGenerate = [];

// BEGIN - Asia
for (const [key, value] of Object.entries(vietnam)) {
  routesToGenerate.push({
    station_name: value.title,
    station_image: process.env.BASE_URL + value.features,
    station_country: "world.asia.vietnam",
    url: "/viet-nam/" + key,
    objectID: "viet-nam-" + key,
  });
}

for (const [key, value] of Object.entries(korea)) {
  routesToGenerate.push({
    station_name: value.title,
    station_image: process.env.BASE_URL + value.features,
    station_country: "world.asia.korea",
    url: "/korea/" + key,
    objectID: "korea-" + key,
  });
}

for (const [key, value] of Object.entries(china)) {
  routesToGenerate.push({
    station_name: value.title,
    station_image: process.env.BASE_URL + value.features,
    station_country: "world.asia.china",
    url: "/china/" + key,
    objectID: "china-" + key,
  });
}

for (const [key, value] of Object.entries(singapore)) {
  routesToGenerate.push({
    station_name: value.title,
    station_image: process.env.BASE_URL + value.features,
    station_country: "world.asia.singapore",
    url: "/singapore/" + key,
    objectID: "singapore-" + key,
  });
}

// Europe
for (const [key, value] of Object.entries(uk)) {
  routesToGenerate.push({
    station_name: value.title,
    station_image: process.env.BASE_URL + value.features,
    station_country: "world.europe.united_kingdom",
    url: "/united-kingdom/" + key,
    objectID: "united-kingdom-" + key,
  });
}

// North America
for (const [key, value] of Object.entries(cuba)) {
  routesToGenerate.push({
    station_name: value.title,
    station_image: process.env.BASE_URL + value.features,
    station_country: "world.north_america.cuba",
    url: "/cuba/" + key,
    objectID: "cuba-" + key,
  });
}

// Oceania
for (const [key, value] of Object.entries(australia)) {
  routesToGenerate.push({
    station_name: value.title,
    station_image: process.env.BASE_URL + value.features,
    station_country: "world.oceania.australia",
    url: "/australia/" + key,
    objectID: "australia-" + key,
  });
}

index.saveObjects(routesToGenerate).then(({ objectIDs }) => {
  console.log(routesToGenerate);
});

export default {
  data() {
    return {};
  },
};
</script>
