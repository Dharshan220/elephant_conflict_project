import { useMemo } from 'react'
import { Line, Bar, Pie, Doughnut, Radar } from 'react-chartjs-2'
import type { ChartData, ChartOptions } from 'chart.js'
import { CHART_COLORS, tooltipStyle, GRID_STYLE, themeMuted } from './chartSetup'

interface Dataset {
  label: string
  data: number[]
  borderColor?: string
  backgroundColor?: string
  fill?: boolean
  tension?: number
}

interface ChartBlockProps {
  labels: string[]
  datasets: Dataset[]
  height?: number
  type?: 'line' | 'bar' | 'radar'
  yLabel?: string
}

function baseOptions(height: number, yLabel?: string): ChartOptions<'line' | 'bar' | 'radar'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: {
        labels: { color: themeMuted(), usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 18, font: { family: 'Inter', size: 11 } },
      },
      tooltip: tooltipStyle(),
    },
    scales:
      yLabel === undefined
        ? undefined
        : {
            x: { grid: GRID_STYLE, ticks: { color: themeMuted(), font: { family: 'Inter', size: 10 } } },
            y: {
              grid: GRID_STYLE,
              ticks: { color: themeMuted(), font: { family: 'Inter', size: 10 } },
              title: { display: !!yLabel, text: yLabel, color: themeMuted(), font: { family: 'Inter', size: 11 } },
              beginAtZero: true,
            },
          },
  }
}

export function MultipurposeChart({ labels, datasets, height = 260, type = 'line', yLabel }: ChartBlockProps) {
  const data = useMemo<ChartData<'line' | 'bar' | 'radar'>>(
    () => ({
      labels,
      datasets: datasets.map((d, i) => {
        const defaultColor = [CHART_COLORS.green, CHART_COLORS.sky, CHART_COLORS.amber][i % 3]
        if (type === 'bar') {
          return {
            label: d.label,
            data: d.data,
            backgroundColor: d.backgroundColor ?? `${defaultColor}99`,
            hoverBackgroundColor: defaultColor,
            borderRadius: 8,
            borderSkipped: false,
            maxBarThickness: 34,
          }
        }
        if (type === 'radar') {
          return { label: d.label, data: d.data, borderColor: d.borderColor ?? defaultColor, backgroundColor: d.backgroundColor ?? `${defaultColor}22`, pointBackgroundColor: defaultColor, pointRadius: 2.5 }
        }
        return {
          label: d.label,
          data: d.data,
          borderColor: d.borderColor ?? defaultColor,
          backgroundColor: d.backgroundColor ?? `${defaultColor}18`,
          fill: d.fill ?? true,
          tension: d.tension ?? 0.4,
          pointRadius: 3,
          pointHoverRadius: 5,
          borderWidth: 2,
        }
      }),
    }),
    [labels, datasets, type],
  )

  const opts = useMemo(() => baseOptions(height, yLabel), [height, yLabel])

  return (
    <div style={{ height }}>
      {type === 'line' && <Line data={data as ChartData<'line'>} options={opts as ChartOptions<'line'>} />}
      {type === 'bar' && <Bar data={data as ChartData<'bar'>} options={opts as ChartOptions<'bar'>} />}
      {type === 'radar' && <Radar data={data as ChartData<'radar'>} options={opts as ChartOptions<'radar'>} />}
    </div>
  )
}

function pieOptions(cutout?: string): ChartOptions<'pie' | 'doughnut'> {
  return {
    responsive: true,
    maintainAspectRatio: false,
    cutout: cutout ?? undefined,
    animation: { duration: 800 },
    plugins: {
      legend: {
        position: 'bottom',
        labels: { color: themeMuted(), usePointStyle: true, boxWidth: 8, padding: 16, font: { family: 'Inter', size: 11 } },
      },
      tooltip: tooltipStyle(),
    },
  }
}

export function DoughnutChart({
  labels,
  values,
  height = 260,
}: {
  labels: string[]
  values: number[]
  height?: number
}) {
  const colors = [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.red, CHART_COLORS.sky, CHART_COLORS.violet, CHART_COLORS.teal]
  const data: ChartData<'doughnut'> = {
    labels,
    datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderColor: 'rgba(0,0,0,0)', borderWidth: 2, hoverOffset: 6 }],
  }
  return (
    <div style={{ height }}>
      <Doughnut data={data} options={pieOptions('62%')} />
    </div>
  )
}

export function PieChart({ labels, values, height = 260 }: { labels: string[]; values: number[]; height?: number }) {
  const colors = [CHART_COLORS.green, CHART_COLORS.amber, CHART_COLORS.red, CHART_COLORS.sky, CHART_COLORS.violet]
  const data: ChartData<'pie'> = {
    labels,
    datasets: [{ data: values, backgroundColor: colors.slice(0, labels.length), borderColor: 'rgba(0,0,0,0)', borderWidth: 2, hoverOffset: 6 }],
  }
  return (
    <div style={{ height }}>
      <Pie data={data} options={pieOptions()} />
    </div>
  )
}