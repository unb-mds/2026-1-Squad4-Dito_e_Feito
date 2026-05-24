import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const data = [
  { subject: 'Coerência', A: 94, B: 62, fullMark: 100 },
  { subject: 'Presença', A: 98, B: 74, fullMark: 100 },
  { subject: 'Alinh. Partidário', A: 91, B: 58, fullMark: 100 },
  { subject: 'Votos Alinhados', A: 86, B: 55, fullMark: 100 },
  { subject: 'Discurso x Voto', A: 90, B: 60, fullMark: 100 },
];

export function GraficoRadar() {
  return (
    <div className="w-full h-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
          <PolarGrid stroke="rgba(51,65,85,0.6)" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94A3B8', fontSize: 11 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          
          <Radar name="Alessandro Vieira" dataKey="A" stroke="#0F766E" fill="#0F766E" fillOpacity={0.12} strokeWidth={2} dot={{ r: 4, fill: '#0F766E' }} />
          <Radar name="Fabiana Davila" dataKey="B" stroke="#EF4444" fill="#EF4444" fillOpacity={0.08} strokeWidth={2} dot={{ r: 4, fill: '#EF4444' }} />
          
          <Legend wrapperStyle={{ fontSize: '12px', color: '#94A3B8', paddingTop: '20px' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px', color: '#F8FAFC' }}
            itemStyle={{ fontSize: '13px', fontWeight: '500' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}