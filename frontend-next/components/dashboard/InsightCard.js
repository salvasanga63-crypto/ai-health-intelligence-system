import Link from 'next/link'

export default function InsightCard({ title, subtitle, gradient, stats, href }) {
  return (
    <Link href={href} className={`group relative overflow-hidden rounded-2xl border border-anker-border bg-gradient-to-br ${gradient} p-5 shadow-card transition hover:-translate-y-1 hover:border-anker-accent/50`}>
      <div className="relative">
        <h3 className="text-base font-bold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {stats.map(({ icon: Icon, label }) => (
            <span key={label} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-200">
              <Icon className="h-4 w-4 text-anker-accent" />{label}
            </span>
          ))}
        </div>
      </div>
    </Link>
  )
}
