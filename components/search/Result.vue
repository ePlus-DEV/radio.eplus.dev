<template>
  <div>
    <pre class="text-white">{{ result }}</pre>
    <div class="block">
      <nuxt-link
        to="/asia"
        class="py-2 px-2.5 flex items-center gap-x-3 hover:bg-gray-100 rounded-lg focus:outline-none focus:bg-gray-100 dark:hover:bg-neutral-700 dark:focus:bg-neutral-700"
        @click="close"
      >
        <img
          class="shrink-0 size-5 rounded-full"
          src="https://images.unsplash.com/photo-1610186593977-82a3e3696e7f?ixlib=rb-4.0.3&amp;ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=320&amp;h=320&amp;q=80"
          alt="Avatar"
        />
        <span
          class="text-sm text-gray-800 dark:text-neutral-200"
          data-hs-combo-box-search-text="Chris Peti"
          data-hs-combo-box-value=""
          >Chris Peti</span
        >
        <span
          class="ms-auto text-xs text-gray-400 dark:text-neutral-500"
          data-hs-combo-box-search-text="Offline"
          data-hs-combo-box-value=""
          >Offline</span
        >
      </nuxt-link>
    </div>
  </div>
</template>

<script setup>
defineProps({
  result: {
    type: Array,
    default: () => [],
  },
});

/**
 * close search modal.
 */
const close = () => {
  const modalButton = document.querySelector(".modal-button");
  if (modalButton) {
    modalButton.click();
  }
};
</script>
