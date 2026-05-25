import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { VisaoGeral } from './pages/VisaoGeral';
import { Politicos } from './pages/Politicos';
import { Comparacao } from './pages/Comparacao';
import { Relatorios } from './pages/Relatorios';
import { Sobre } from './pages/Sobre';
import { Footer } from './components/Footer';

export default function App() {
  return (
    <div className="flex h-screen bg-bg text-text-main overflow-hidden font-body">
      <Sidebar />
      <main className="flex-1 overflow-y-auto main-scroll flex flex-col">
        <Routes>
          <Route path="/" element={<VisaoGeral />} />
          <Route path="/politicos" element={<Politicos />} />
          <Route path="/comparacao" element={<Comparacao />} />
          <Route path="/relatorios" element={<Relatorios />} />
          <Route path="/sobre" element={<Sobre />} />
        </Routes>
        <Footer/>
      </main>
    </div>
  );
}