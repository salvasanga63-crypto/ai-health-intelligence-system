import dynamic from 'next/dynamic'

const Plot = dynamic(() => import('react-plotly.js'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-[220px] items-center justify-center rounded-xl bg-anker-surface/60">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-anker-accent border-t-transparent" />
    </div>
  ),
})

const darkDefaults = {
  paper_bgcolor: 'transparent',
  plot_bgcolor: 'transparent',
  font: { color: '#94a3b8', family: 'Inter, system-ui, sans-serif', size: 12 },
  xaxis: {
    gridcolor: 'rgba(148, 163, 184, 0.08)',
    zerolinecolor: 'rgba(148, 163, 184, 0.12)',
    tickfont: { color: '#64748b' },
  },
  yaxis: {
    gridcolor: 'rgba(148, 163, 184, 0.08)',
    zerolinecolor: 'rgba(148, 163, 184, 0.12)',
    tickfont: { color: '#64748b' },
  },
  margin: { t: 24, b: 40, l: 48, r: 16 },
}

export default function PlotlyChart({ data, layout = {}, config = {}, style, className }) {
  return (
    <Plot
      data={data}
      layout={{ ...darkDefaults, ...layout }}
      config={{ displayModeBar: false, responsive: true, ...config }}
      style={{ width: '100%', ...style }}
      className={className}
      useResizeHandler
    />
  )
}
