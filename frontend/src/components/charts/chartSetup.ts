import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend,
)

export const CHART_COLORS = {
  green: '#22c55e',
  greenDim: 'rgba(34,197,94,0.5)',
  teal: '#14b8a6',
  sky: '#38bdf8',
  amber: '#f5a623',
  red: '#e5484d',
  violet: '#a78bfa',
  slate: '#94a3b8',
}

export function themeGlow(): string {
  return typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--c-line').trim()
    : 'rgba(255,255,255,0.08)'
}

export function themeMuted(): string {
  return typeof window !== 'undefined'
    ? getComputedStyle(document.documentElement).getPropertyValue('--c-muted').trim()
    : '#9fb3a7'
}

export function tooltipStyle() {
  return {
    backgroundColor: 'rgba(12,18,16,0.94)',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    titleColor: '#e8efe9',
    bodyColor: '#9fb3a7',
    padding: 12,
    cornerRadius: 12,
    boxPadding: 6,
    titleFont: { family: 'Inter', size: 12, weight: 700 as const },
    bodyFont: { family: 'Inter', size: 11 },
  }
}

export const GRID_STYLE = {
  color: () => themeGlow(),
  drawBorder: false,
  drawTicks: false,
}