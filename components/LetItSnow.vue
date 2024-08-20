<template>
  <div>
    <let-it-snow v-bind="NoelConf" :show="show_noel"></let-it-snow>
    <let-it-snow v-bind="NewYearConf" :show="show_new_year"></let-it-snow>
  </div>
</template>
<script>
export default {
  name: "app",
  data() {
    return {
      NoelConf: {
        windPower: 1,
        speed: 1,
        count: 12,
        size: 10,
        opacity: 0,

        images: [
          "/img/holiday/snow.png",
          "/img/holiday/sock.png",
          "/img/holiday/tree.png",
        ],
      },
      NewYearConf: {
        windPower: 1,
        speed: 1,
        count: 12,
        size: 10,
        opacity: 1,
        images: [
          "/img/holiday/fireworks.png",
          "/img/holiday/fireworks_2.png",
          "/img/holiday/fireworks_3.png",
          "/img/holiday/hoa-dao.png",
          "/img/holiday/hoa-dao-1.png",
          "/img/holiday/hoa-mai.png",
          "/img/holiday/hoa-mai-1.png",
        ],
      },
      show_noel: false,
      show_new_year: false,
    };
  },
  mounted() {
    const month = this.$moment(new Date()).format("M");
    const day = this.$moment(new Date()).format("D");

    const startOfMonth = this.$moment("12", "MM")
      .startOf("month")
      .format("YYYY-MM-DD");
    const endOfMonth = this.$moment("12", "MM")
      .endOf("month")
      .format("YYYY-MM-DD");

    const today = this.$moment(this.$moment().format("YYYY-MM-DD"));
    const startDate_noel = this.$moment(startOfMonth);
    const endDate_noel = this.$moment(endOfMonth);

    if (today.isBetween(startDate_noel, endDate_noel)) {
      this.show_noel = true;
    } else if (month == 1 && day == 1) {
      this.show_new_year = true;
    }
  },
};
</script>
