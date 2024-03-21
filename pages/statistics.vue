<template>
  <!-- BEGIN - Statistics -->
  <div class="bg-opacity-95 bg-white dark:bg-gray-700 rounded-lg my-3">
    <div class="p-4 border-b dark:bg-gray-900 dark:border-gray-600 rounded-t-lg">
      <h2 class="text-2xl dark:text-white">{{ $t("navmenu.statistics") }}</h2>
    </div>
    <div class="flex justify-center mt-8 space-x-6">
      <!-- website monitoring -->
      <div class="stats shadow">
        <div class="stat place-items-center">
          <div class="stat-title">UP</div>
          <div class="stat-value">
            {{
              parseFloat(AvailabilitynPerformance.availability_percentage).toFixed(2) +
              "%"
            }}
          </div>
          <div class="stat-desc">{{ $t("text.the_last_90_days") }}</div>
        </div>

        <div class="stat place-items-center">
          <div class="stat-title">DOWNTIME</div>
          <div class="stat-value text-secondary">
            {{
              $moment
                .utc(
                  $moment
                    .duration(
                      AvailabilitynPerformance.average_response_time_milliseconds_reporting_error,
                      "seconds"
                    )
                    .asMilliseconds()
                )
                .format("HH:mm:SS")
            }}
          </div>
          <div class="stat-desc text-secondary">
            ({{
              (
                100 -
                parseFloat(AvailabilitynPerformance.availability_percentage).toFixed(2)
              ).toFixed(2) + "%"
            }})
          </div>
        </div>

        <!-- <div class="stat place-items-center">
          <div class="stat-title">New Registers</div>
          <div class="stat-value">1,200</div>
          <div class="stat-desc">↘︎ 90 (14%)</div>
        </div> -->
      </div>
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
      <vc-calendar
        ref="calendar"
        id="calendar"
        :first-day-of-week="2"
        :attributes="attrs"
        color="red"
        :locale="this.$i18n.locale"
        transition="slide-h"
        is-expanded
        :is-dark="this.$colorMode.value == 'dark' ? true : false"
        :min-date="$moment().subtract(90, 'days').format('YYYY-MM-DD')"
        :max-date="new Date()"
        :columns="$screens({ default: 1, lg: 2 })"
        @transition-start="pageChange()"
      />
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
      attrs: [
        {
          highlight: { color: "orange", fillMode: "outline" },
          dot: {
            style: { "background-color": "indigo" },
          },
          dates: new Date(),
          popover: {
            label: "🎂 ❤❤ 🎂",
          },
          order: 0,
        },
      ],
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
      AvailabilitynPerformance: {
        check_id: 0,
        duration_seconds_available: 0,
        duration_seconds_reporting_error: 0,
        duration_seconds_not_responding: 0,
        outages_count_reporting_error: 0,
        outages_count_not_responding: 0,
        average_response_time_milliseconds_available: 0,
        average_response_time_milliseconds_reporting_error: 0,
        minimum_response_time_milliseconds_available: 0,
        minimum_response_time_milliseconds_reporting_error: 0,
        maximum_response_time_milliseconds_available: 0,
        maximum_response_time_milliseconds_reporting_error: 0,
        duration_seconds_performance_good: 0,
        duration_seconds_performance_degraded: 0,
        count_performance_degradations: 0,
        apdex_results_count_satisfied: 0,
        apdex_results_count_tolerating: 0,
        apdex_results_count_frustrated: 0,
        availability_percentage: "100",
        duration_seconds_total_downtime: 0,
        outages_count_total: 0,
        apdex_score: "0",
      },
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
    pageChange() {
      // Get reference to the calendar component
      const calendar = this.$refs.calendar;
    },
    async fetchLast7days() {
      let startDate = this.$moment().subtract(90, "days");
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

          this.attrs.push({
            highlight: {
              color: data.outages_count_total > 0 ? "red" : "green",
              fillMode: this.$colorMode.value == "dark" ? "light" : "outline",
            },
            dot: {
              style: {
                "background-color": data.outages_count_total > 0 ? "red" : "green",
              },
            },
            dates: date,
            popover: {
              label: this.$t("statistics_tooltip.text", {
                num: data.apdex_results_count_frustrated,
                time: this.$moment
                  .duration(data.duration_seconds_total_downtime, "seconds")
                  .minutes(),
                response: data.average_response_time_milliseconds_available,
              }),
            },
          });

          this.data_list.push(data);
        });
    },
    async fetchAvailabilitynPerformance() {
      this.$axios
        .get(
          process.env.API_FRESHPING +
            "public-check-stats-reports/690040/?for_hours=2160&aggregate_by=days"
        )
        .then((res) => {
          this.AvailabilitynPerformance = res.data;
        });
    },
  },
  created() {
    Promise.all([
      this.fetchResponseTimesReports(),
      this.fetchLast7days(),
      this.fetchAvailabilitynPerformance(),
    ]).then(() => {});
  },
};
</script>
<style lang="css">
.weekday-7.in-month {
  background: rgba(40, 199, 111, 0.3) !important;
  color: white;
}

.weekday-1.in-month {
  background: rgba(234, 84, 85, 0.3) !important;
  color: white;
}

.vc-weeks .vc-weekday {
  color: #ed8322;
}
</style>
