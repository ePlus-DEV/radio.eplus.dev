<template>
  <div>
    <player />
    {{ $dayjs('2023-01-01').fromNow() }} - {{ $dayjs().locale() }} - {{ $dayjs('2023-01-01').locale('ja').fromNow() }}
  </div>
</template>

<script>
export default {
  name: "index",
 
};
</script>