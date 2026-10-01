import Layout from '../Layout'

export default function DashboardShell({ title, children }) {
  return (
    <Layout title={title}>
      <div className="min-h-screen bg-anker-bg text-slate-200">
        {children}
      </div>
    </Layout>
  )
}
