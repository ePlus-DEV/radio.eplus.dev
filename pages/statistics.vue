<template>
  <!-- BEGIN - Statistics -->
  <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
    <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
      <h2 class="text-2xl dark:text-white">{{ $t("navmenu.statistics") }}</h2>
    </div>
    <div>
      <!-- Chart -->
      <apexchart
        ref="chart"
        type="area"
        height="350"
        :options="chart.chartOptions"
        :series="chart.series"
      ></apexchart>
      <!-- Chart -->

      <!-- BEGIN - Calendar -->

      <div
        class="flex bg-white shadow-md justify-start md:justify-center rounded-lg mx-auto py-4 px-2 md:mx-12 overflow-x-auto"
      >
        <template v-for="(item, index) in last7days">
          <div
            class="flex group bg-green-600 shadow-lg dark-shadow rounded-lg mx-1 cursor-pointer justify-center relative w-16"
            :key="index"
          >
            <span class="flex h-3 w-3 absolute -top-1 -right-1">
              <span
                class="animate-ping absolute group-hover:opacity-75 opacity-0 inline-flex h-full w-full rounded-full bg-green-400"
              ></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-100"></span>
            </span>
            <div class="flex items-center px-4 py-4">
              <div class="text-center">
                <p class="text-gray-100 text-sm">
                  {{ $moment(item).format("ddd") }}
                </p>
                <p class="text-gray-100 mt-3 font-bold">
                  {{ $moment(item).format("DD/MM") }}
                </p>
              </div>
            </div>
          </div>
        </template>
      </div>
      <!-- END - Calendar -->
    </div>
  </div>
  <!-- END - Statistics -->
</template>

<script>
import VueApexCharts from "vue-apexcharts";

export default {
  head() {
    return {
      title: this.$t("navmenu.statistics"),
      meta: [
        // hid is used as unique identifier. Do not use `vmid` for it as it will not work
        {
          hid: "description",
          name: "description",
          content:
            "Radio Online Việt Nam, Singapore, Indonesia, Malaysia, Philippines, Pakistan, Hong Kong, ประเทศไทย, 中国, 台灣, Australia, New Zealand, Sri Lankā, Nepāla, United Kingdom, .v.v",
        },
      ],
    };
  },
  data() {
    return {
      chart: {
        series: [
          {
            name: null,
            data: [0, 0, 0, 0, 0, 0, 0],
          },
        ],
        chartOptions: {
          chart: {
            height: 350,
            type: "area",
            zoom: {
              enabled: false,
            },
          },
          dataLabels: {
            enabled: true,
          },
          stroke: {
            width: [5, 7, 5],
            curve: "straight",
            dashArray: [0, 8, 5],
          },
          title: {
            text: "Performance metrics - Radio.ePlus.DEV",
            align: "center",
            style: {
              fontSize: "14px",
              fontWeight: "bold",
              fontFamily: undefined,
              color: "#ed8322",
            },
          },
          fill: {
            type: "gradient",
            gradient: {
              opacityFrom: 0.6,
              opacityTo: 0.8,
            },
          },
          legend: {
            tooltipHoverFormatter: function (val, opts) {
              return (
                val + " - " + opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex]
              );
            },
          },
          markers: {
            size: 0,
            hover: {
              sizeOffset: 6,
            },
          },
          xaxis: {
            type: "datetime",
            rotate: -45,
            labels: {
              datetimeUTC: false,
              datetimeFormatter: {
                year: "yyyy",
                month: "MM-dd",
                day: "dd-MM",
                hour: "HH:mm",
              },
            },
          },
          tooltip: {
            x: {
              format: "dd/MM/yy HH:mm",
            },
          },
          grid: {
            borderColor: "#f1f1f1",
          },
        },
      },
      last7days: [],
    };
  },
  components: {
    apexchart: VueApexCharts,
  },
  methods: {
    async fetchResponseTimesReports() {
      this.$axios
        .get(
          process.env.API_FRESHPING +
            "public-check-response-times-reports/690040/?for_hours=48&aggregate_by=hours"
        )
        .then((res) => {
          const data = res.data.response_times;

          const response_time = Object.keys(data).map(
            (k) => data[k].average_response_time_milliseconds_available
          );
          // updateSeries chart
          this.$refs.chart.updateSeries(
            [
              {
                name: "response time",
                data: response_time,
              },
            ],
            false,
            true
          );

          const date = Object.keys(data).map((k) => data[k].start);

          // updateOptions chart
          this.$refs.chart.updateOptions({
            labels: date,
          });
        });
    },
    async fetchStatsReports() {
      this.$axios
        .get(
          process.env.API_FRESHPING + "public-check-stats-reports/690005/?for_hours=48"
        )
        .then((res) => {
          const data = res.data;
        });
    },
    async fetchLast7days() {
      var self = this;
      var enumerateDaysBetweenDates = function (startDate, endDate) {
        var now = startDate,
          dates = [];

        while (now.isSameOrBefore(endDate)) {
          dates.push(now.format("YYYY-MM-DD"));
          now.add(1, "days");
          self.$axios
            .get(
              process.env.API_FRESHPING +
                "public-check-stats-reports/690040/?start_time=" +
                now.format("YYYY-MM-DD") +
                "T00:00:00.000Z&end_time=" +
                now.format("YYYY-MM-DD") +
                "T23:59:59.999Z"
            )
            .then((res) => {
              const data = res.data;
            });
        }
        return dates;
      };

      var fromDate = this.$moment().subtract(14, "days");
      var toDate = this.$moment();
      this.last7days = enumerateDaysBetweenDates(fromDate, toDate);
    },
  },
  created() {
    Promise.all([this.fetchResponseTimesReports(), this.fetchLast7days()]).then(() => {});
  },
};
</script>
