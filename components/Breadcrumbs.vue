<template>
  <div class="text-sm breadcrumbs dark:text-white">
    <ul>
      <li class="font-medium">
        <nuxt-link provider="static" to="/" class="hover:no-underline">
          <svg
            class="w-5 h-5 mr-2.5"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"
            ></path>
          </svg>
          {{ $t("navmenu.homepage") }}
        </nuxt-link>
      </li>

      <template v-if="level_1 !== undefined && level_1_slug !== undefined">
        <template v-if="level_2 !== undefined">
          <li class="font-medium">
            <nuxt-link :to="'/' + level_1_slug" class="hover:no-underline">{{
              $t(level_1)
            }}</nuxt-link>
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
  props: ["level_1", "level_1_slug", "level_2"],
};
</script>
