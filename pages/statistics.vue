<template>
  <!-- BEGIN - Statistics -->
  <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
    <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
      <h2 class="text-2xl dark:text-white">{{ $t("navmenu.statistics") }}</h2>
    </div>
    <div class="flex justify-center mt-8 space-x-6">
      <!-- website monitoring -->
      <img
        src="https://statuspage.freshping.io/badge/31630134-99cc-447d-9789-e89d57071666?0.4862714836619788"
        class="border-dashed border-2 border-indigo-600 dark:border-indigo-300 rounded-full"
        alt="website monitoring pass 100 days"
      />
      <!-- website monitoring -->
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
        class="flex bg-white shadow-md justify-start md:justify-center rounded-lg mx-auto py-10 px-2 md:mx-12 overflow-x-auto"
      >
        <div
          :data-tip="
            $t('statistics_tooltip.text', {
              num: item.apdex_results_count_frustrated,
              time: $moment
                .duration(item.duration_seconds_total_downtime, 'seconds')
                .minutes(),
            })
          "
          class="tooltip"
          :class="item.outages_count_total > 0 ? 'tooltip-error' : 'tooltip-success'"
          v-for="(item, index) in data_list_sort"
          :key="index"
        >
          <div
            class="flex group shadow-lg dark-shadow rounded-lg mx-1 cursor-pointer justify-center relative w-16"
            :class="item.outages_count_total > 0 ? 'bg-red-600' : 'bg-green-600'"
          >
            <span class="flex h-3 w-3 absolute -top-1 -right-1">
              <span
                class="animate-ping absolute group-hover:opacity-75 opacity-0 inline-flex h-full w-full rounded-full"
                :class="item.outages_count_total > 0 ? 'bg-red-400' : 'bg-green-400'"
              ></span>
              <span
                class="relative inline-flex rounded-full h-3 w-3"
                :class="item.outages_count_total > 0 ? 'bg-red-100' : 'bg-green-100'"
              ></span>
            </span>
            <div class="flex items-center px-4 py-4">
              <div class="text-center">
                <p class="text-gray-100 text-sm">
                  {{ $moment(last7days[index]).format("ddd") }}
                </p>
                <p class="text-gray-100 mt-3 font-bold">
                  {{ $moment(last7days[index]).format("DD/MM") }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- END - Calendar -->
    </div>
  </div>
  <!-- END - Statistics -->
</template>

<script>
import VueApexCharts from "vue-apexcharts";
import _, { map } from "underscore";

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
              fontFamily: "Roboto",
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
          yaxis: {
            title: {
              text: "ms",
              style: {
                fontSize: "14px",
                fontWeight: "bold",
                fontFamily: "Roboto",
                color: "#ed8322",
              },
            },
          },
          tooltip: {
            x: {
              format: "dd/MM/yy HH:mm",
            },
            y: {
              formatter: (value) => {
                return value + " ms";
              },
            },
          },
          grid: {
            borderColor: "#f1f1f1",
          },
        },
      },
      last7days: [],
      data_list: [],
    };
  },
  components: {
    apexchart: VueApexCharts,
  },
  computed: {
    data_list_sort() {
      return _.sortBy(this.data_list, "date");
    },
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
                name: "Response Time",
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
    async fetchLast7days() {
      let startDate = this.$moment().subtract(30, "days");
      let endDate = this.$moment();
      let date = [];

      for (var m = this.$moment(startDate); m.isSameOrBefore(endDate); m.add(1, "days")) {
        date.push(m.format("YYYY-MM-DD"));
        this.fetchData(m.format("YYYY-MM-DD"));
      }

      this.last7days = date;
    },
    async fetchData(date) {
      this.$axios
        .get(
          process.env.API_FRESHPING +
            "public-check-stats-reports/690040/?start_time=" +
            date +
            "T00:00:00.000Z&end_time=" +
            date +
            "T23:59:59.999Z"
        )
        .then((res) => {
          const data = res.data;
          data.date = date;

          this.data_list.push(data);
        });
    },
  },
  created() {
    Promise.all([this.fetchResponseTimesReports(), this.fetchLast7days()]).then(() => {});
  },
};
</script>
