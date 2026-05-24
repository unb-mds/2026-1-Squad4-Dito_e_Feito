import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 68 }, { name: 'Fev', value: 71 }, { name: 'Mar', value: 69 },
  { name: 'Abr', value: 74 }, { name: 'Mai', value: 76 }, { name: 'Jun', value: 73 },
  { name: 'Jul', value: 75 }, { name: 'Ago', value: 72 }, { name: 'Set', value: 74 },
  { name: 'Out', value: 71 }, { name: 'Nov', value: 73 }, { name: 'Dez', value: 70 },
];

export function GraficoTendencias() {
  return (
    <div style={{ width: '100%', height: '100%', minHeight: '250px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={true} horizontal={true} />
          <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} domain={[60, 80]} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px', color: '#F8FAFC' }}
            itemStyle={{ color: '#0F766E', fontWeight: 'bold' }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Coerência"
            stroke="#0F766E" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#0F766E', strokeWidth: 2, stroke: '#1E293B' }} 
            activeDot={{ r: 6, fill: '#F8FAFC' }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}