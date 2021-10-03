<template>
  <div>
    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">
        <span>{{ $t("world.asia.name") }}</span>
      </div>

      <el-row>
        <el-row :gutter="12">
          <el-col :xs="6" :sm="4" :md="4" :lg="3" :xl="3" class="pad-box-chanel">
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('world.asia.vietnam')"
              placement="top"
            >
              <nuxt-link to="/viet-nam" class="mx-auto border-img">
                <el-image
                  class="align-middle img-center"
                  shape="square"
                  width="100"
                  fit="scale-down"
                  src="/img/asia/flags/viet-nam.png"
                  lazy
                />
                <div class="notify-badge">{{ vietnam }}</div>
              </nuxt-link>
            </el-tooltip>
          </el-col>

          <el-col :xs="6" :sm="4" :md="4" :lg="3" :xl="3" class="pad-box-chanel">
            <el-tooltip
              class="item"
              effect="dark"
              :content="$t('world.asia.singapore')"
              placement="top"
            >
              <nuxt-link to="/singapore" class="mx-auto border-img">
                <el-image
                  class="align-middle img-center"
                  shape="square"
                  width="100"
                  fit="scale-down"
                  src="/img/asia/flags/singapore.png"
                  lazy
                />
                <div class="notify-badge">{{ singapore }}</div>
              </nuxt-link>
            </el-tooltip>
          </el-col>
        </el-row>
      </el-row>
    </el-card>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">{{ $t("world.europe.name") }}</div>

      <el-row :gutter="12">
        <el-col :xs="6" :sm="4" :md="4" :lg="3" :xl="3" class="pad-box-chanel">
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('world.europe.united_kingdom')"
            placement="top"
          >
            <nuxt-link to="/united-kingdom" class="mx-auto border-img">
              <el-image
                class="align-middle img-center"
                shape="square"
                width="100"
                fit="scale-down"
                src="/img/europe/flags/united-kingdom.png"
                lazy
              />
              <div class="notify-badge">{{ united_kingdom }}</div>
            </nuxt-link>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-card>

    <el-card class="box-card mar-card">
      <div slot="header" class="clearfix">{{ $t("world.oceania.name") }}</div>

      <el-row :gutter="12">
        <el-col :xs="6" :sm="4" :md="4" :lg="3" :xl="3" class="pad-box-chanel">
          <el-tooltip
            class="item"
            effect="dark"
            :content="$t('world.oceania.australia')"
            placement="top"
          >
            <nuxt-link to="/australia" class="mx-auto border-img">
              <el-image
                class="align-middle img-center"
                shape="square"
                width="100"
                fit="scale-down"
                src="/img/oceania/flags/australia.png"
                lazy
              />
              <div class="notify-badge">{{ australia }}</div>
            </nuxt-link>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // Asia
      vietnam: 0,
      singapore: 0,
      // Europe
      united_kingdom: 0,
      // Oceania
      australia: 0,
    };
  },
  methods: {
    async fetchData() {
      // BEGIN - Asia
      this.$axios.get("/assets/radio/asia/viet-nam.json").then((res) => {
        this.vietnam = Object.keys(res.data).length;
      });

      this.$axios.get("/assets/radio/asia/singapore.json").then((res) => {
        this.singapore = Object.keys(res.data).length;
      });
      // END - Asia

      // BEGIN - Europe
      this.$axios.get("/assets/radio/europe/united-kingdom.json").then((res) => {
        this.united_kingdom = Object.keys(res.data).length;
      });
      // END - Europe

      // BEGIN - Oceania
      this.$axios.get("/assets/radio/oceania/australia.json").then((res) => {
        this.australia = Object.keys(res.data).length;
      });
      // END - Oceania
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
