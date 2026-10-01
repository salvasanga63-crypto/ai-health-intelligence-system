import { useEffect, useRef, useState } from 'react'
import Layout from '../components/Layout'
import PlotlyChart from '../components/dashboard/PlotlyChart'
import { authFetch } from '../lib/api'
import {
  ChartBarIcon,
  PaperAirplaneIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline'

const WELCOME = {
  role: 'bot',
  reply: "Hi, I'm Chartbot — your AI charting assistant. Ask me to visualize hospital data in plain language, and I'll generate live charts from your platform data.",
  chart: null,
}

export default function ChartbotPage() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [activeChart, setActiveChart] = useState(null)
  const bottomRef = useRef(null)

  useEffect(() => {
    authFetch('/chartbot/suggestions')
      .then((res) => res.ok ? res.json() : { suggestions: [] })
      .then((data) => setSuggestions(data.suggestions || []))
      .catch(() => setSuggestions([]))
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text) {
    const query = (text || input).trim()
    if (!query || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: query }])
    setLoading(true)

    try {
      const response = await authFetch('/chartbot/query', {
        method: 'POST',
        body: JSON.stringify({
          message: query,
          history: messages.slice(-6).map((item) => ({
            role: item.role === 'bot' ? 'assistant' : 'user',
            content: item.content || item.reply || '',
          })),
        }),
      })

      if (!response.ok) {
        const err = await response.json().catch(() => ({}))
        setMessages((prev) => [
          ...prev,
          { role: 'bot', reply: err.error || 'Something went wrong. Please try again.', chart: null },
        ])
        return
      }

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'bot', ...data }])
      if (data.chart) setActiveChart(data.chart)
      if (data.suggestions?.length) setSuggestions(data.suggestions)
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', reply: 'Unable to reach the chartbot service. Is the backend running?', chart: null },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendMessage()
  }

  return (
    <Layout title="Chartbot">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Header */}
        <section className="mb-6 overflow-hidden rounded-2xl border border-anker-border bg-gradient-to-r from-anker-card via-anker-surface to-anker-card p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-anker-accent/15">
              <SparklesIcon className="h-6 w-6 text-anker-accent" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-anker-accent">AI Charting</p>
              <h1 className="mt-1 text-2xl font-extrabold text-white sm:text-3xl">Chartbot</h1>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Ask questions in natural language and get instant Plotly charts from live triage, inventory, device, and AI metrics data.
              </p>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
          {/* Chat panel */}
          <div className="flex flex-col xl:col-span-2 rounded-2xl border border-anker-border bg-anker-card shadow-card">
            <div className="border-b border-anker-border px-5 py-4">
              <h2 className="text-sm font-semibold text-white">Conversation</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5" style={{ minHeight: 420, maxHeight: 520 }}>
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-anker-accent text-anker-bg font-medium'
                        : 'border border-anker-border bg-anker-surface text-slate-300'
                    }`}
                  >
                    {msg.role === 'user' ? msg.content : msg.reply}
                    {msg.source && (
                      <a
                        href={msg.source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 block text-xs font-semibold text-anker-accent underline underline-offset-2 hover:text-cyan-300"
                      >
                        Source: {msg.source.name} ↗
                      </a>
                    )}
                    {msg.provider && (
                      <span className="mt-3 block text-xs font-medium text-slate-500">Response generated by {msg.provider}</span>
                    )}
                    {msg.chart && (
                      <button
                        type="button"
                        onClick={() => setActiveChart(msg.chart)}
                        className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-anker-accent hover:text-cyan-300"
                      >
                        <ChartBarIcon className="h-3.5 w-3.5" />
                        View chart: {msg.chart.title}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl border border-anker-border bg-anker-surface px-4 py-3">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-anker-accent [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-anker-accent [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-anker-accent" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="border-t border-anker-border px-5 py-3">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">Try asking</p>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage(s)}
                      disabled={loading}
                      className="rounded-full border border-anker-border bg-anker-surface px-3 py-1 text-xs text-slate-400 transition hover:border-anker-accent/50 hover:text-anker-accent disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="border-t border-anker-border p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder='e.g. "Show triage mix" or "Chart device failure risk"'
                  disabled={loading}
                  className="flex-1 rounded-xl border border-anker-border bg-anker-surface px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-anker-accent/60"
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="flex items-center gap-2 rounded-xl bg-anker-accent px-4 py-2.5 text-sm font-semibold text-anker-bg transition hover:bg-cyan-300 disabled:opacity-50"
                >
                  <PaperAirplaneIcon className="h-4 w-4" />
                  Ask
                </button>
              </div>
            </form>
          </div>

          {/* Chart preview */}
          <div className="xl:col-span-3 rounded-2xl border border-anker-border bg-anker-card p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {activeChart ? activeChart.title : 'Chart Preview'}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeChart
                    ? `${activeChart.type} chart generated from live platform data`
                    : 'Ask Chartbot a question to generate a visualization'}
                </p>
              </div>
              {activeChart && (
                <span className="rounded-full border border-anker-accent/30 bg-anker-accent/10 px-3 py-1 text-xs font-semibold text-anker-accent">
                  Live data
                </span>
              )}
            </div>

            {activeChart ? (
              <PlotlyChart data={activeChart.data} layout={activeChart.layout} />
            ) : (
              <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-dashed border-anker-border bg-anker-surface/40 text-center">
                <ChartBarIcon className="mb-3 h-12 w-12 text-slate-600" />
                <p className="text-sm text-slate-500">Your chart will appear here</p>
                <p className="mt-1 text-xs text-slate-600">Try: &ldquo;Show triage mix&rdquo; or &ldquo;Plot AI model accuracy&rdquo;</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}
