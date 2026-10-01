const accents = {
  cyan: 'bg-cyan-400/10 text-cyan-300 ring-cyan-400/20',
  rose: 'bg-rose-400/10 text-rose-300 ring-rose-400/20',
  emerald: 'bg-emerald-400/10 text-emerald-300 ring-emerald-400/20',
  amber: 'bg-amber-400/10 text-amber-300 ring-amber-400/20',
}

export default function StatCard({ label, value, delta, deltaType, icon: Icon, accent = 'cyan' }) {
  const deltaColor = deltaType === 'down' ? 'text-rose-300' : deltaType === 'up' ? 'text-emerald-300' : 'text-slate-400'
  return (
    <article className="rounded-2xl border border-anker-border bg-anker-card p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-xl ring-1 ${accents[accent]}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className={`mt-4 text-xs font-medium ${deltaColor}`}>{delta}</p>
    </article>
  )
}
