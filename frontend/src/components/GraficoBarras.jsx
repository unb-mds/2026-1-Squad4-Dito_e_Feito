import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const data = [
  { name: 'PT', value: 78, color: '#882121' }, { name: 'PL', value: 72, color: '#0F766E' },
  { name: 'UNIÃO', value: 75, color: '#166534' }, { name: 'PP', value: 68, color: '#64748B' },
  { name: 'PSDB', value: 70, color: '#94A3B8' }, { name: 'MDB', value: 67, color: '#4F46E5' },
  { name: 'PSD', value: 73, color: '#10B981' }, { name: 'REP', value: 69, color: '#EF4444' },
];

export function GraficoBarras() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
        <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
        <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[50, 100]} tickFormatter={(val) => `${val}%`} />
        <Tooltip cursor={{ fill: '#334155', opacity: 0.2 }} contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }} />
        <Bar dataKey="value" name="Coerência" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}