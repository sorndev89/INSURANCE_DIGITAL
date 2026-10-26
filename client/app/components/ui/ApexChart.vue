<template>
  <div ref="container" class="w-full" :style="{ minHeight: `${height}px` }" />
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
  type: { type: String, default: 'bar' },
  height: { type: [Number, String], default: 300 },
  series: { type: [Array, Object], default: () => [] },
  options: { type: Object, default: () => ({}) },
})

const container = ref(null)
let chart = null
let observer = null
let ApexCharts = null

const cssValue = (name, fallback) => {
  if (typeof window === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

const isDark = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('dark')

const merge = (base, override) => {
  const result = { ...base }
  Object.entries(override || {}).forEach(([key, value]) => {
    if (
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      base[key] &&
      typeof base[key] === 'object' &&
      !Array.isArray(base[key])
    ) {
      result[key] = merge(base[key], value)
      return
    }
    result[key] = value
  })
  return result
}

const buildOptions = () => {
  const font = cssValue('--sf-font', "'Noto Sans Lao', 'Phetsarath OT', sans-serif")
  const primary = cssValue('--sf-primary', '#047857')
  const danger = cssValue('--sf-danger', '#be123c')
  const warning = cssValue('--sf-warning', '#92400e')
  const info = cssValue('--sf-info', '#0369a1')
  const muted = cssValue('--sf-muted', '#475569')
  const line = cssValue('--sf-line', '#dbe3ec')
  const dark = isDark()

  const base = {
    chart: {
      type: props.type,
      height: props.height,
      fontFamily: font,
      foreColor: muted,
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      animations: { enabled: true, speed: 300 },
    },
    theme: { mode: dark ? 'dark' : 'light' },
    colors: [primary, danger, warning, info, cssValue('--sf-success', '#047857')],
    dataLabels: { enabled: false, style: { fontFamily: font } },
    stroke: { curve: 'smooth', width: 2 },
    grid: { borderColor: line, strokeDashArray: 4, padding: { left: 6, right: 6 } },
    xaxis: {
      labels: {
        style: { fontFamily: font, colors: muted, fontSize: '11px' },
      },
      axisBorder: { color: line },
      axisTicks: { color: line },
    },
    yaxis: {
      labels: { style: { fontFamily: font, colors: muted, fontSize: '11px' } },
    },
    legend: {
      fontFamily: font,
      labels: { colors: muted },
      markers: { size: 4 },
      itemMargin: { horizontal: 8 },
    },
    tooltip: {
      theme: dark ? 'dark' : 'light',
      style: { fontFamily: font, fontSize: '12px' },
    },
    noData: {
      text: 'ບໍ່ມີຂໍ້ມູນ',
      style: { fontFamily: font, color: muted, fontSize: '12px' },
    },
  }

  if (props.type === 'bar') {
    base.plotOptions = {
      bar: { borderRadius: 6, columnWidth: '52%', horizontal: false },
    }
  }
  if (props.type === 'donut' || props.type === 'pie') {
    base.plotOptions = { pie: { donut: { size: '68%' } } }
    base.stroke = { width: 2, colors: [cssValue('--sf-surface', '#ffffff')] }
  }

  return merge(base, props.options)
}

const renderChart = async () => {
  if (!container.value || chart) return
  const module = await import('apexcharts')
  ApexCharts = module.default
  chart = new ApexCharts(container.value, {
    ...buildOptions(),
    series: props.series,
  })
  await chart.render()
  observer = new MutationObserver(() => {
    if (chart) chart.updateOptions(buildOptions())
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
}

watch(
  () => props.series,
  (series) => {
    if (chart) chart.updateSeries(series, true)
  },
  { deep: true },
)

watch(
  () => props.options,
  () => {
    if (chart) chart.updateOptions(buildOptions(), false, true)
  },
  { deep: true },
)

onMounted(renderChart)

onBeforeUnmount(() => {
  observer?.disconnect()
  observer = null
  chart?.destroy()
  chart = null
})
</script>
