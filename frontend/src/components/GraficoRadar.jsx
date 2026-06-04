import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const defaultData = [
  { subject: 'Direitos Humanos', A: 85, B: 60 },
  { subject: 'Educação', A: 90, B: 55 },
  { subject: 'Saúde', A: 78, B: 70 },
  { subject: 'Segurança', A: 92, B: 45 },
  { subject: 'Economia', A: 88, B: 65 },
];

export function GraficoRadar({ data = defaultData, nameA = "Parlamentar A", nameB = "Parlamentar B" }) {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="#30363d" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#8b949e', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar name={nameA} dataKey="A" stroke="#14b8a6" fill="#14b8a6" fillOpacity={0.15} strokeWidth={2} dot={{ r: 4, fill: '#14b8a6' }} />
          <Radar name={nameB} dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.1} strokeWidth={2} dot={{ r: 4, fill: '#ec4899' }} />

          
          <Legend wrapperStyle={{ fontSize: '12px', color: '#8b949e', paddingTop: '15px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', borderRadius: '6px', color: '#e6edf3' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}