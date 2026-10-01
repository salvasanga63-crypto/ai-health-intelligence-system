import DashboardShell from '../components/dashboard/DashboardShell'
import PlotlyChart from '../components/dashboard/PlotlyChart'
import StatCard from '../components/dashboard/StatCard'
import InsightCard from '../components/dashboard/InsightCard'
import {
  ArrowTrendingUpIcon,
  BoltIcon,
  ClockIcon,
  CpuChipIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'

const ACCENT = '#2aa9e0'

const admissionsData = [
  {
    x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    y: [12, 17, 14, 20, 18, 22, 19],
    type: 'scatter',
    mode: 'lines+markers',
    name: 'Admissions',
    line: { color: ACCENT, width: 3, shape: 'spline' },
    marker: { color: ACCENT, size: 8, line: { color: '#05080f', width: 2 } },
    fill: 'tozeroy',
    fillcolor: 'rgba(42, 169, 224, 0.12)',
  },
  {
    x: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    y: [8, 11, 10, 14, 13, 16, 15],
    type: 'scatter',
    mode: 'lines',
    name: 'Discharges',
    line: { color: '#8b5cf6', width: 2, dash: 'dot', shape: 'spline' },
  },
]

const deviceRiskData = [
  {
    x: ['Ventilator A', 'Monitor B', 'Pump C', 'Scanner D', 'Defibrillator E'],
    y: [5, 2, 8, 3, 6],
    type: 'bar',
    name: 'Risk score',
    marker: {
      color: ['#2aa9e0', '#06b6d4', '#f97316', '#ef4444', '#8b5cf6'],
      line: { color: 'rgba(255,255,255,0.08)', width: 1 },
    },
  },
]

const triageMixData = [
  {
    labels: ['Critical', 'Urgent', 'Standard', 'Low'],
    values: [8, 22, 45, 25],
    type: 'pie',
    hole: 0.62,
    marker: {
      colors: ['#ef4444', '#f97316', ACCENT, '#64748b'],
      line: { color: '#111827', width: 2 },
    },
    textinfo: 'none',
    hoverinfo: 'label+percent',
  },
]

const insights = [
  {
    title: 'Critical Care Queue',
    subtitle: 'Real-time triage prioritization',
    gradient: 'from-rose-900/80 via-rose-800/40 to-anker-card',
    stats: [
      { icon: UserGroupIcon, label: '8 patients' },
      { icon: ClockIcon, label: 'Avg 12 min wait' },
    ],
    href: '/triage',
  },
  {
    title: 'Device Telemetry',
    subtitle: 'Live vitals & equipment streams',
    gradient: 'from-cyan-900/80 via-teal-800/40 to-anker-card',
    stats: [
      { icon: CpuChipIcon, label: '142 devices' },
      { icon: BoltIcon, label: 'Live sync' },
    ],
    href: '/device-telemetry',
  },
  {
    title: 'Predictive Maintenance',
    subtitle: 'AI failure-risk forecasting',
    gradient: 'from-violet-900/80 via-purple-800/40 to-anker-card',
    stats: [
      { icon: ExclamationTriangleIcon, label: '3 alerts' },
      { icon: ArrowTrendingUpIcon, label: '94% accuracy' },
    ],
    href: '/failure-prediction',
  },
  {
    title: 'Clinical AI Assistant',
    subtitle: 'Diagnosis support & chat',
    gradient: 'from-blue-900/80 via-indigo-800/40 to-anker-card',
    stats: [
      { icon: HeartIcon, label: '24/7 online' },
      { icon: BoltIcon, label: 'Instant replies' },
    ],
    href: '/chat',
  },
]

const recentAlerts = [
  { time: '2 min ago', text: 'Ventilator A — pressure anomaly detected', level: 'critical' },
  { time: '14 min ago', text: 'Triage queue spike in Pediatrics wing', level: 'warning' },
  { time: '38 min ago', text: 'Scanner D scheduled maintenance due', level: 'info' },
  { time: '1 hr ago', text: 'New referral flagged as high priority', level: 'warning' },
]

const alertStyles = {
  critical: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  info: 'border-anker-accent/40 bg-anker-accent/10 text-anker-accent',
}

export function DashboardContent() {
  return (
  <>
      {/* Hero strip */}
      <section className="mb-8 overflow-hidden rounded-2xl border border-anker-border bg-gradient-to-r from-anker-card via-anker-surface to-anker-card p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-anker-accent">Operations Center</p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Health Intelligence Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-slate-400">
              Monitor admissions, triage flow, device health, and AI-assisted clinical insights — all in one command view.
            </p>
          </div>
          <div className="flex shrink-0 gap-3">
            <button
              type="button"
              className="rounded-full border border-slate-600 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-slate-400 hover:text-white"
            >
              Export report
            </button>
            <button
              type="button"
              className="rounded-full bg-anker-accent px-5 py-2.5 text-sm font-semibold text-anker-bg shadow-glow transition hover:bg-cyan-300"
            >
              Live briefing
            </button>
          </div>
        </div>
      </section>

      {/* KPI row */}
      <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Patients" value="1,246" delta="+4.2% vs last week" deltaType="up" icon={UserGroupIcon} accent="cyan" />
        <StatCard label="Open Referrals" value="24" delta="3 critical" deltaType="neutral" icon={HeartIcon} accent="rose" />
        <StatCard label="Avg Wait Time" value="38 min" delta="-6 min improvement" deltaType="up" icon={ClockIcon} accent="emerald" />
        <StatCard label="Device Alerts" value="7" delta="2 require action" deltaType="down" icon={ExclamationTriangleIcon} accent="amber" />
      </section>

      {/* Epic Collections-style insight cards */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Clinical Insights</h2>
          <button type="button" className="rounded-full bg-anker-accent/15 px-4 py-1.5 text-sm font-semibold text-anker-accent transition hover:bg-anker-accent/25">
            View All →
          </button>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {insights.map((item) => (
            <InsightCard key={item.title} {...item} />
          ))}
        </div>
      </section>

      {/* Charts row */}
      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2 rounded-2xl border border-anker-border bg-anker-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Admissions This Week</h2>
              <p className="text-sm text-slate-500">Daily intake vs discharges</p>
            </div>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
              +12% trend
            </span>
          </div>
          <PlotlyChart
            data={admissionsData}
            layout={{
              height: 340,
              showlegend: true,
              legend: { orientation: 'h', y: 1.12, x: 0, font: { color: '#94a3b8' } },
              xaxis: { title: '' },
              yaxis: { title: 'Patients' },
            }}
          />
        </div>

        <div className="rounded-2xl border border-anker-border bg-anker-card p-6 shadow-card">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-white">Triage Mix</h2>
            <p className="text-sm text-slate-500">Current priority distribution</p>
          </div>
          <PlotlyChart
            data={triageMixData}
            layout={{
              height: 340,
              showlegend: true,
              legend: { orientation: 'h', y: -0.05, font: { color: '#94a3b8' } },
              annotations: [{
                text: '100<br>cases',
                showarrow: false,
                font: { size: 16, color: '#e2e8f0' },
                x: 0.5,
                y: 0.5,
              }],
            }}
          />
        </div>
      </section>

      {/* Bottom row: device risk + alerts */}
      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-anker-border bg-anker-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Device Failure Risk</h2>
              <p className="text-sm text-slate-500">AI-scored equipment health</p>
            </div>
            <button type="button" className="rounded-full bg-anker-accent px-4 py-1.5 text-xs font-bold text-anker-bg transition hover:bg-cyan-300">
              Investigate
            </button>
          </div>
          <PlotlyChart
            data={deviceRiskData}
            layout={{
              height: 280,
              yaxis: { title: 'Risk score', range: [0, 10] },
              bargap: 0.35,
            }}
          />
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-anker-border pt-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Critical Issues</p>
              <p className="text-2xl font-bold text-rose-400">2</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-500">Pending Alerts</p>
              <p className="text-2xl font-bold text-amber-400">7</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-anker-border bg-anker-card p-6 shadow-card">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Recent Alerts</h2>
              <p className="text-sm text-slate-500">Live operational feed</p>
            </div>
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
            </span>
          </div>
          <ul className="space-y-3">
            {recentAlerts.map((alert) => (
              <li
                key={alert.text}
                className={`rounded-xl border px-4 py-3 ${alertStyles[alert.level]}`}
              >
                <p className="text-sm font-medium">{alert.text}</p>
                <p className="mt-1 text-xs opacity-70">{alert.time}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  )
}

export default function Dashboard() {
  return (
    <DashboardShell title="Dashboard">
      <DashboardContent />
    </DashboardShell>
  )
}
