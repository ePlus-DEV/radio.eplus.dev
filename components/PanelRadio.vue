<template>
  <div>
    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <span>{{ $t("world.asia.name") }}</span>
      </div>

      <el-row>
        <el-row :gutter="12">
          <!-- BEGIN - Country -->
          <template v-for="(country, index) in world.asia">
            <el-col
              :xs="6"
              :sm="4"
              :md="4"
              :lg="3"
              :xl="3"
              class="pad-box-chanel"
              v-bind:key="index"
            >
              <el-tooltip
                class="item"
                effect="dark"
                :content="$t(country.name)"
                placement="top"
              >
                <nuxt-link :to="index" class="mx-auto border-img">
                  <el-image
                    class="align-middle img-center"
                    shape="square"
                    width="100"
                    fit="scale-down"
                    :src="country.flag"
                    lazy
                  />
                  <div class="notify-badge">{{ country.station }}</div>
                </nuxt-link>
              </el-tooltip>
            </el-col>
          </template>
          <!-- END - Country -->
        </el-row>
      </el-row>
    </el-card>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">{{ $t("world.europe.name") }}</div>

      <el-row :gutter="12">
        <!-- BEGIN - Country -->
        <template v-for="(country, index) in world.europe">
          <el-col
            :xs="6"
            :sm="4"
            :md="4"
            :lg="3"
            :xl="3"
            class="pad-box-chanel"
            v-bind:key="index"
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t(country.name)"
              placement="top"
            >
              <nuxt-link :to="index" class="mx-auto border-img">
                <el-image
                  class="align-middle img-center"
                  shape="square"
                  width="100"
                  fit="scale-down"
                  :src="country.flag"
                  lazy
                />
                <div class="notify-badge">{{ country.station }}</div>
              </nuxt-link>
            </el-tooltip>
          </el-col>
        </template>
        <!-- END - Country -->
      </el-row>
    </el-card>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        {{ $t("world.north_america.name") }}
      </div>

      <el-row :gutter="12">
        <!-- BEGIN - Country -->
        <template v-for="(country, index) in world.north_america">
          <el-col
            :xs="6"
            :sm="4"
            :md="4"
            :lg="3"
            :xl="3"
            class="pad-box-chanel"
            v-bind:key="index"
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t(country.name)"
              placement="top"
            >
              <nuxt-link :to="index" class="mx-auto border-img">
                <el-image
                  class="align-middle img-center"
                  shape="square"
                  width="100"
                  fit="scale-down"
                  :src="country.flag"
                  lazy
                />
                <div class="notify-badge">{{ country.station }}</div>
              </nuxt-link>
            </el-tooltip>
          </el-col>
        </template>
        <!-- END - Country -->
      </el-row>
    </el-card>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">{{ $t("world.oceania.name") }}</div>

      <el-row :gutter="12">
        <!-- BEGIN - Country -->
        <template v-for="(country, index) in world.oceania">
          <el-col
            :xs="6"
            :sm="4"
            :md="4"
            :lg="3"
            :xl="3"
            class="pad-box-chanel"
            v-bind:key="index"
          >
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t(country.name)"
              placement="top"
            >
              <nuxt-link :to="index" class="mx-auto border-img">
                <el-image
                  class="align-middle img-center"
                  shape="square"
                  width="100"
                  fit="scale-down"
                  :src="country.flag"
                  lazy
                />
                <div class="notify-badge">{{ country.station }}</div>
              </nuxt-link>
            </el-tooltip>
          </el-col>
        </template>
        <!-- END - Country -->
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      world: {
        asia: {},
        europe: {},
        north_america: {},
        oceania: {},
      },
    };
  },
  methods: {
    async fetchData() {
      // Countries
      this.$axios.get("/assets/radio/countries.json").then((res) => {
        this.world = res.data;
        var self = this;
        // BEGIN - Asia
        $.each(res.data.asia, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.asia[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Asia

        // BEGIN - Europe
        $.each(res.data.europe, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.europe[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Europe

        // BEGIN - North America
        $.each(res.data.north_america, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.north_america[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - North America

        // BEGIN - Oceania
        $.each(res.data.oceania, function (key, country) {
          self.$axios.get(country.data).then((res) => {
            self.world.oceania[key]["station"] = Object.keys(res.data).length;
          });
        });
        // END - Oceania
      });
    },
  },
  created() {
    this.loading = true;
    Promise.all([this.fetchData()]).then(() => {
      const loading = this.$loading({
        lock: true,
        text: "Loading",
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      loading.close();
    });
  },
};
</script>
