export const barChartOptions = ({
  categories = [],
  horizontal = false,
  axisFormatter = (value) => value,
  tooltipFormatter = (value) => value,
  columnWidth,
} = {}) => ({
  xaxis: {
    categories,
    labels: { formatter: horizontal ? tooltipFormatter : undefined },
  },
  yaxis: {
    labels: { formatter: horizontal ? undefined : axisFormatter },
  },
  plotOptions: {
    bar: {
      horizontal,
      borderRadius: 6,
      columnWidth: columnWidth || (horizontal ? '46%' : '52%'),
    },
  },
  tooltip: { y: { formatter: tooltipFormatter } },
})

export const donutChartOptions = ({
  labels = [],
  tooltipFormatter = (value) => value,
  totalLabel = 'ລວມ',
  totalFormatter = () => '',
} = {}) => ({
  labels,
  legend: { position: 'bottom' },
  tooltip: { y: { formatter: tooltipFormatter } },
  plotOptions: {
    pie: {
      donut: {
        size: '68%',
        labels: {
          show: true,
          total: { show: true, label: totalLabel, formatter: totalFormatter },
        },
      },
    },
  },
})
