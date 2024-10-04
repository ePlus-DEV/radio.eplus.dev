<template>
  <!-- BEGIN - Program -->
  <div class="h-full flex flex-col" v-if="program && program.length > 0">
    <div
      class="bg-white dark:bg-gray-800 text-sm text-gray-500 dark:text-white font-bold px-5 py-2 shadow border-b border-gray-300"
    >
      {{ $t("panel.schedule") }}
    </div>

    <div
      class="w-full h-full overflow-auto shadow bg-white dark:bg-gray-800"
      id="journal-scroll"
    >
      <table class="w-full">
        <tbody>
          <tr
            class="relative transform scale-100 text-xs py-1 border-b-2 border-blue-100 cursor-default"
            :class="index === 0 ? 'bg-blue-500 bg-opacity-25' : ''"
            v-for="(item, index) in program"
            :key="index"
          >
            <td class="pl-5 pr-3 whitespace-no-wrap">
              <div class="text-gray-400 uppercase">
                {{ $dayjs.unix(item.startTime).format("dddd - DD/MM//YYYY") }}
              </div>
              <div class="dark:text-white">
                {{ $dayjs.unix(item.startTime).format("HH:mm") }} - {{ $dayjs.unix(item.endTime).format("HH:mm") }}
              </div>
            </td>

            <td class="px-2 py-2 whitespace-no-wrap">
              <div class="leading-5 text-gray-500 font-medium">
                {{ item.title }}
              </div>
              <div class="leading-5 text-gray-900 dark:text-gray-200">
                {{ item.description }}
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  program: {
    type: Array,
    default: () => [],
  },
});
</script>
