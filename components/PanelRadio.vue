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
                  src="/img/flags/asia/viet-nam.png"
                  lazy
                />
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
                  src="/img/flags/asia/singapore.png"
                  lazy
                />
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
                src="/img/flags/europe/united-kingdom.png"
                lazy
              />
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
                src="/img/flags/oceania/australia.png"
                lazy
              />
            </nuxt-link>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>
