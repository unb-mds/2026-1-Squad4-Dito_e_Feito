import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { VisaoGeral } from './pages/VisaoGeral';
import { Politicos } from './pages/Politicos';
import { Comparacao } from './pages/Comparacao';
import { Relatorios } from './pages/Relatorios';
import { Sobre } from './pages/Sobre';
import { Footer } from './components/Footer';
import { PerfilPolitico } from './pages/PerfilPolitico';
import { Estados } from './pages/Estados';
import { Partidos } from './pages/Partidos';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg text-text-main overflow-hidden font-body relative">
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between bg-surface border-b border-border p-4 shrink-0">
        <div className="text-[18px] font-bold text-text-main tracking-[-0.3px]">Dito e Feito</div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-text2 hover:text-white p-1"
          aria-label="Abrir menu"
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden animate-[fadeIn_0.2s_ease]"
        />
      )}

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 overflow-y-auto main-scroll flex flex-col relative">
        <Routes>
          <Route path="/" element={<VisaoGeral />} />
          <Route path="/politicos" element={<Politicos />} />
          <Route path="/politicos/:id" element={<PerfilPolitico />} />
          <Route path="/estados" element={<Estados />} />
          <Route path="/estados/:uf" element={<Estados />} />
          <Route path="/partidos" element={<Partidos />} />
          <Route path="/partidos/:sigla" element={<Partidos />} />
          <Route path="/comparacao" element={<Comparacao />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/sobre" element={<Sobre />} />
        </Routes>
        <Footer />
      </main>
    </div>
  );
}