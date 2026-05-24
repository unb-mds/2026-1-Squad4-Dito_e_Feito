import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip } from 'recharts';

const data = [
  { name: 'PT', value: 400, color: '#882121' },
  { name: 'PL', value: 300, color: '#0F766E' },
  { name: 'UNIÃO', value: 300, color: '#166534' },
  { name: 'PP', value: 200, color: '#94A3B8' },
];

export function GraficoPartidos() {
  return (
    // The explicit width and height on this wrapper div prevent the -1 calculation error
    <div style={{ width: '100%', height: '300px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie 
            data={data} 
            dataKey="value" 
            nameKey="name" 
            cx="50%" 
            cy="50%" 
            innerRadius={60} 
            outerRadius={80} 
            paddingAngle={5}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#F8FAFC' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}