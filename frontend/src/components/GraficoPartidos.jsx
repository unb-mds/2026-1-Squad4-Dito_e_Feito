import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const defaultData = [
  { name: 'PT', value: 30, color: '#9b2335' },
  { name: 'PL', value: 25, color: '#14b8a6' },
  { name: 'UNIÃO', value: 20, color: '#166534' },
  { name: 'PP', value: 15, color: '#8b949e' },
  { name: 'OUTROS', value: 10, color: '#b0bec5' },
];

export function GraficoPartidos({ data = defaultData }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4">
      <ResponsiveContainer width="100%" height="70%">
        <PieChart>
          <Pie data={data} innerRadius="55%" outerRadius="85%" paddingAngle={2} dataKey="value" stroke="#161b22" strokeWidth={2}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="flex flex-wrap gap-x-3 gap-y-1.5 justify-center">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-[12px] text-text2">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }}></div>
            {item.name}
          </div>
        ))}
      </div>
    </div>
  );
}