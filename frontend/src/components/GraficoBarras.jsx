import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';

export function GraficoBarras({ data }) {
  const chartData = data || [];
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="partido" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(val) => `${val}%`} />
          <Tooltip cursor={{ fill: '#1c2128', opacity: 0.3 }} contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }} />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#8b949e' }} />
          <Bar dataKey="coerencia" name="Coerência Média (%)" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.coerencia >= 70 ? '#2ea043' : entry.coerencia >= 50 ? '#d29922' : '#f85149'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}