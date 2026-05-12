export default function ContributorLeaderboard({ contributors }) {
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--accent)' }}>
        Ranking de Contribuidores
      </h2>

      <div className="space-y-3">
        {contributors.map((c, i) => {
          const pct = contributors[0]?.score
            ? Math.round((c.score / contributors[0].score) * 100)
            : 0

          return (
            <div
              key={c.name}
              className="flex items-center gap-4 rounded-xl p-3 transition-colors"
              style={{ background: 'var(--bg-card-alt)' }}
            >
              {/* rank */}
              <span className="text-xl w-8 text-center flex-shrink-0">
                {i < 3 ? medals[i] : `#${i + 1}`}
              </span>

              {/* info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold truncate">{c.name}</span>
                  <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                    {c.commits} commits
                  </span>
                </div>

                {/* progress bar */}
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${pct}%`,
                      background: 'linear-gradient(90deg, #06b6d4, #818cf8)',
                    }}
                  />
                </div>

                <div className="flex gap-4 mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span>+{c.additions.toLocaleString('pt-BR')}</span>
                  <span>-{c.deletions.toLocaleString('pt-BR')}</span>
                  <span>🔥 streak: {c.current_streak}d</span>
                  <span>⏰ avg {c.avg_commit_hour}h</span>
                </div>
              </div>

              {/* score */}
              <div className="text-right flex-shrink-0">
                <div className="metric-value text-lg">{c.score}</div>
                <div className="text-xs" style={{ color: 'var(--text-muted)' }}>pontos</div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
