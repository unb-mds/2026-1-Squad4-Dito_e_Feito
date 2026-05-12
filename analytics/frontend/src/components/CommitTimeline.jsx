export default function CommitTimeline({ commits }) {
  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--accent)' }}>
        Commits Recentes
      </h2>

      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
        {commits.map((c, i) => {
          const date = new Date(c.date).toLocaleString('pt-BR', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
          })

          return (
            <div
              key={i}
              className="flex gap-3 items-start rounded-xl p-3 transition-colors"
              style={{ background: 'var(--bg-card-alt)' }}
            >
              {/* timeline dot */}
              <div className="flex flex-col items-center flex-shrink-0 mt-1">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ background: c.verified ? 'var(--success)' : 'var(--accent)' }}
                />
                {i < commits.length - 1 && (
                  <div className="w-0.5 h-8 mt-1" style={{ background: 'var(--border)' }} />
                )}
              </div>

              {/* content */}
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{c.message}</p>
                <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                  <span className="font-mono" style={{ color: 'var(--accent)' }}>{c.sha}</span>
                  <span>{c.author}</span>
                  <span>{date}</span>
                  {c.verified && <span title="Assinatura verificada">✓</span>}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
