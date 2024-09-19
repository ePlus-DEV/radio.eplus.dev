<template>
  <div class="text-sm breadcrumbs dark:text-white">
    <ul>
      <li class="font-medium">
        <nuxt-link to="/" class="hover:no-underline">
          <fa :icon="['far', 'house']" class="w-5 h-5 mr-2.5" />
          {{ $t("navmenu.homepage") }}
        </nuxt-link>
      </li>

      <template v-if="level_1 !== undefined && level_1_slug !== undefined">
        <li class="font-medium">
          <nuxt-link :to="`/${area}`" class="hover:no-underline">
            {{ $t(`world.${area.replace(/-/g, '_')}.name`) }}
          </nuxt-link>
        </li>
        <template v-if="level_2 !== undefined">
          <li class="font-medium">
            <nuxt-link
              :to="`/${area}/${level_1_slug}`"
              class="hover:no-underline"
            >
              {{ $t(level_1) }}
            </nuxt-link>
          </li>
        </template>
        <template v-else>
          <li>{{ $t(level_1) }}</li>
        </template>
      </template>

      <template v-if="level_2 !== undefined">
        <li>{{ level_2 }}</li>
      </template>
    </ul>
  </div>
</template>
<script>
export default {
  name: "Breadcrumbs",
  props: {
    area: {
      type: String,
      default: undefined,
    },
    level_1: {
      type: String,
      default: undefined,
    },
    level_1_slug: {
      type: String,
      default: undefined,
    },
    level_2: {
      type: String,
      default: undefined,
    },
  },
};
</script>
