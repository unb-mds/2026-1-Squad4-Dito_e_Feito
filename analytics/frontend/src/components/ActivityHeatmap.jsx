import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function ActivityHeatmap({ temporal }) {
  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--accent)' }}>
        Atividade por Hora do Dia
      </h2>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={temporal.commits_by_hour} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#94a3b8', fontSize: 11 }}
            tickFormatter={h => `${h}h`}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }}
            labelFormatter={h => `${h}:00`}
            formatter={v => [`${v} commits`, 'Commits']}
          />
          <Bar dataKey="commits" radius={[4, 4, 0, 0]} fill="url(#barGradient)" />
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>

      {/* Day of week summary */}
      <div className="flex justify-between mt-4 px-2">
        {temporal.commits_by_day.map(d => {
          const max = Math.max(...temporal.commits_by_day.map(x => x.commits), 1)
          const opacity = 0.2 + (d.commits / max) * 0.8
          return (
            <div key={d.day} className="text-center">
              <div
                className="w-8 h-8 rounded-lg mx-auto mb-1 flex items-center justify-center text-xs font-bold"
                style={{ background: `rgba(6, 182, 212, ${opacity})` }}
              >
                {d.commits}
              </div>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{d.day}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
