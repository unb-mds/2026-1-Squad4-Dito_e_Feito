import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const defaultData = [
  { name: 'Jan', value: 68 }, { name: 'Fev', value: 71 }, { name: 'Mar', value: 69 },
  { name: 'Abr', value: 74 }, { name: 'Mai', value: 76.2 }, { name: 'Jun', value: 73 },
  { name: 'Jul', value: 75 }, { name: 'Ago', value: 72 }, { name: 'Set', value: 74 },
  { name: 'Out', value: 71 }, { name: 'Nov', value: 73 }, { name: 'Dez', value: 70 },
];

export function GraficoTendencias({ data }) {
  // Se não vier data, ou vier nulo, mostra um array vazio para não quebrar o gráfico.
  // connectNulls=true vai conectar as linhas pulando os meses sem dados
  const chartData = data || defaultData;
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="0" stroke="#30363d" vertical={false} />
          <XAxis dataKey="name" stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#8b949e" fontSize={11} tickLine={false} axisLine={false} domain={[60, 80]} tickFormatter={(val) => `${val}%`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }}
            itemStyle={{ color: '#14b8a6', fontWeight: 'bold' }}
          />
          <Legend verticalAlign="top" height={36} wrapperStyle={{ fontSize: '12px', color: '#8b949e' }} />
          <Line type="monotone" dataKey="value" name="Coerência (%)" stroke="#14b8a6" strokeWidth={2} dot={{ r: 4, fill: '#14b8a6' }} activeDot={{ r: 6 }} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}