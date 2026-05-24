import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'PT', value: 78, color: '#882121' },
  { name: 'PL', value: 72, color: '#0F766E' },
  { name: 'UNIÃO', value: 75, color: '#166534' },
  { name: 'PP', value: 68, color: '#64748b' },
  { name: 'PSDB', value: 70, color: '#94a3b8' },
  { name: 'MDB', value: 67, color: '#4f46e5' },
  { name: 'PSD', value: 73, color: '#10b981' },
  { name: 'REP', value: 69, color: '#ef4444' },
];

export function GraficoBarras() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '250px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} />
          <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[50, 100]} />
          <Tooltip
            cursor={{ fill: '#334155', opacity: 0.4 }}
            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#F8FAFC' }}
          />
          <Bar dataKey="value" name="Coerência (%)" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}