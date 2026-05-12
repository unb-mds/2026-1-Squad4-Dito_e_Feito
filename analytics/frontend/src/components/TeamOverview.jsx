export default function TeamOverview({ team, issues, collab }) {
  const cards = [
    { label: 'Total Commits', value: team.total_commits, icon: '📊' },
    { label: 'Contribuidores', value: team.total_contributors, icon: '👥' },
    { label: 'Velocidade Semanal', value: team.weekly_velocity, icon: '🚀' },
    { label: 'Linhas Adicionadas', value: team.total_additions.toLocaleString('pt-BR'), icon: '➕' },
    { label: 'Linhas Removidas', value: team.total_deletions.toLocaleString('pt-BR'), icon: '➖' },
    { label: 'Arquivos Alterados', value: team.total_files_changed, icon: '📁' },
    { label: 'Issues Abertas', value: issues.open, icon: '🔴' },
    { label: 'Issues Fechadas', value: issues.closed, icon: '🟢' },
    { label: 'PRs Mergeados', value: collab.merged_prs, icon: '🔀' },
    { label: 'Taxa de Merge', value: `${collab.merge_rate}%`, icon: '✅' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((c, i) => (
        <div key={i} className="glass-card text-center" style={{ padding: '20px 16px' }}>
          <div className="text-2xl mb-2">{c.icon}</div>
          <div className="metric-value text-2xl">{c.value}</div>
          <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{c.label}</div>
        </div>
      ))}
    </div>
  )
}
