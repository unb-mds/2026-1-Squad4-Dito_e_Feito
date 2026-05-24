import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'PT', value: 400, color: '#882121' },
  { name: 'PL', value: 300, color: '#0F766E' },
  { name: 'UNIÃO', value: 300, color: '#166534' },
  { name: 'PP', value: 200, color: '#64748B' },
];

export function GraficoPartidos() {
  return (
    <>
      <ResponsiveContainer width="60%" height="100%">
        <PieChart>
          <Pie data={data} innerRadius="62%" outerRadius="90%" paddingAngle={2} dataKey="value" stroke="none">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }} />
        </PieChart>
      </ResponsiveContainer>
      
      <div className="flex flex-col gap-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px] text-texto-sec">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></div>
            {item.name}
          </div>
        ))}
      </div>
    </>
  );
}