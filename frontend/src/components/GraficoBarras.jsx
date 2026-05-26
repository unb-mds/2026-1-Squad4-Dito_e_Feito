import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'PT', value: 78, color: '#9b2335' }, 
  { name: 'PL', value: 72, color: '#14b8a6' },
  { name: 'UNIÃO', value: 75, color: '#166534' }, 
  { name: 'PP', value: 68, color: '#8b949e' },
  { name: 'PSDB', value: 70, color: '#b0bec5' }, 
  { name: 'MDB', value: 67, color: '#4f46e5' },
  { name: 'PSD', value: 73, color: '#22c55e' }, 
  { name: 'REP', value: 69, color: '#ef4444' },
];

export function GraficoBarras() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} tickFormatter={(val) => `${val}%`} />
          <Tooltip cursor={{ fill: '#1c2128', opacity: 0.3 }} contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }} />
          <Bar dataKey="value" name="Coerência" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}