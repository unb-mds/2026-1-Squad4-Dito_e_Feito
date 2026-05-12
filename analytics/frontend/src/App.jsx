import { useState, useEffect } from 'react'
import TeamOverview from './components/TeamOverview'
import ContributorLeaderboard from './components/ContributorLeaderboard'
import ActivityHeatmap from './components/ActivityHeatmap'
import WeeklyVelocity from './components/WeeklyVelocity'
import CommitTimeline from './components/CommitTimeline'

export default function App() {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('./team_metrics.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setData)
      .catch(e => setError(e.message))
  }, [])

  if (error) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-primary)',color:'var(--text-muted)'}}>
      <div className="glass-card text-center max-w-md">
        <h2 className="text-xl font-bold mb-2" style={{color:'var(--danger)'}}>Erro ao carregar métricas</h2>
        <p>{error}</p>
        <p className="mt-4 text-sm">Verifique se o arquivo <code>team_metrics.json</code> existe no diretório de deploy.</p>
      </div>
    </div>
  )

  if (!data) return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'var(--bg-primary)'}}>
      <div className="pulse-dot" style={{width:32,height:32}}></div>
    </div>
  )

  const updated = new Date(data.generated_at).toLocaleString('pt-BR')

  return (
    <div className="min-h-screen" style={{background:'var(--bg-primary)', padding:'32px 24px'}}>
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <header className="mb-10 animate-in">
          <div className="flex items-center gap-3 mb-2">
            <div className="pulse-dot"></div>
            <span className="text-sm" style={{color:'var(--text-muted)'}}>Atualizado em {updated}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-1">
            <span style={{background:'linear-gradient(135deg, #06b6d4, #818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
              GitHub Team Analytics
            </span>
          </h1>
          <p style={{color:'var(--text-muted)'}}>
            {data.repository} — Painel de produtividade em tempo real
          </p>
        </header>

        {/* Team Overview Cards */}
        <section className="mb-8 animate-in" style={{animationDelay:'0.1s'}}>
          <TeamOverview team={data.team} issues={data.issues_summary} collab={data.collaboration} />
        </section>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="animate-in" style={{animationDelay:'0.2s'}}>
            <WeeklyVelocity temporal={data.temporal} />
          </div>
          <div className="animate-in" style={{animationDelay:'0.3s'}}>
            <ActivityHeatmap temporal={data.temporal} />
          </div>
        </div>

        {/* Leaderboard + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="animate-in" style={{animationDelay:'0.4s'}}>
            <ContributorLeaderboard contributors={data.contributors} />
          </div>
          <div className="animate-in" style={{animationDelay:'0.5s'}}>
            <CommitTimeline commits={data.recent_commits} />
          </div>
        </div>

      </div>
    </div>
  )
}
