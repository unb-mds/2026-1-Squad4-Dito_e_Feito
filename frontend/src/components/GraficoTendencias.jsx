import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Jan', value: 68 }, { name: 'Fev', value: 71 }, { name: 'Mar', value: 69 },
  { name: 'Abr', value: 74 }, { name: 'Mai', value: 76 }, { name: 'Jun', value: 73 },
  { name: 'Jul', value: 75 }, { name: 'Ago', value: 72 }, { name: 'Set', value: 74 },
  { name: 'Out', value: 71 }, { name: 'Nov', value: 73 }, { name: 'Dez', value: 70 },
];

export function GraficoTendencias() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
          <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[60, 80]} tickFormatter={(val) => `${val}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
            itemStyle={{ color: '#0F766E', fontWeight: 'bold' }}
          />
          <Line type="monotone" dataKey="value" name="Coerência" stroke="#0F766E" strokeWidth={2.5} dot={{ r: 3, fill: '#0F766E' }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}