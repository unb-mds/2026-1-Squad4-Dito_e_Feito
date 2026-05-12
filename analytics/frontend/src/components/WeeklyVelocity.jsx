import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function WeeklyVelocity({ temporal }) {
  const data = temporal.daily_activity.slice(-30)

  return (
    <div className="glass-card" style={{ padding: '28px' }}>
      <h2 className="text-lg font-bold mb-5" style={{ color: 'var(--accent)' }}>
        Velocidade de Commits (últimos 30 dias)
      </h2>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#94a3b8', fontSize: 10 }}
            tickFormatter={d => d.slice(5)}
          />
          <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, color: '#f1f5f9' }}
            labelFormatter={d => new Date(d + 'T00:00:00').toLocaleDateString('pt-BR')}
            formatter={v => [`${v} commits`, 'Commits']}
          />
          <Area
            type="monotone"
            dataKey="commits"
            stroke="#06b6d4"
            strokeWidth={2}
            fill="url(#areaGradient)"
            dot={{ r: 3, fill: '#06b6d4' }}
            activeDot={{ r: 5, fill: '#818cf8' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
