import { Header } from "../components/Header.jsx";
import { PoliticoCard } from "../components/PoliticoCard.jsx";
import { GraficoPartidos } from "../components/GraficoPartidos.jsx";
import { GraficoTendencias } from "../components/GraficoTendencias.jsx";
import { GraficoBarras } from "../components/GraficoBarras.jsx";
import { useState, useEffect } from 'react';
import { getDeputados, getSenadores } from '../services/api';
import { AlertTriangle, TrendingUp, TrendingDown, User } from 'lucide-react';

export function VisaoGeral() {
  const [politicos, setPoliticos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(false); // Ajuste conforme seu serviço de API
        // Simulando carregamento de dados para o layout
      } catch (err) { console.error(err); }
    };
    carregarDados();
  }, []);

  return (
    <main className="p-8 w-full max-w-7xl mx-auto space-y-6">
      <Header />

      {/* 1. KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-sm font-medium text-texto-secundario">Votos Analisados</h3>
          <p className="text-4xl font-bold text-texto-principal mt-2">2.847</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-sm font-medium text-texto-secundario">Coerência Global</h3>
          <p className="text-4xl font-bold text-texto-principal mt-2">73.2%</p>
        </div>
        <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
          <h3 className="text-sm font-medium text-texto-secundario">Incoerências</h3>
          <p className="text-4xl font-bold text-texto-principal mt-2">142</p>
        </div>
      </div>

      {/* 2. Gráficos em Linha */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         <div className="lg:col-span-2 bg-surface p-6 rounded-xl border border-slate-700 shadow-lg h-[350px]">
            <h2 className="text-lg font-bold text-texto-principal mb-4">Tendências</h2>
            <GraficoTendencias />
         </div>
         <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg h-[350px]">
            <h2 className="text-lg font-bold text-texto-principal mb-4">Distribuição</h2>
            <GraficoPartidos />
         </div>
      </div>

      {/* 3. Listagem de Políticos (O que tinha sumido) */}
      <div className="bg-surface p-6 rounded-xl border border-slate-700 shadow-lg">
        <h2 className="text-xl font-bold text-texto-principal mb-6 border-b border-slate-700 pb-4">
          Parlamentares em Destaque
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Aqui voltamos a renderizar os cards que estavam faltando */}
          {loading ? (
            <p className="text-texto-secundario">Carregando...</p>
          ) : (
            // Exemplo: se não tiver dados da API agora, adicione um componente mock ou o seu PoliticoCard
            <div className="col-span-full text-center py-10 text-texto-secundario">
              Nenhum dado de parlamentar carregado.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}