import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar.jsx';
import { Footer } from './components/Footer.jsx';
import { VisaoGeral } from './pages/VisaoGeral.jsx';
import { Comparacao } from './pages/Comparacao.jsx';
import { PerfilPolitico } from './pages/PerfilPolitico.jsx';
import { Sobre } from './pages/Sobre.jsx';
import { Politicos } from './pages/Politicos.jsx'; // IMPORTAÇÃO NOVA
import { Relatorios } from './pages/Relatorios.jsx'; // IMPORTAÇÃO NOVA

function App() {
  return (
    <div className="flex h-screen bg-fundo text-texto-principal font-sans overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col h-full overflow-y-auto relative">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<VisaoGeral />} />
            <Route path="/politicos" element={<Politicos />} /> {/* ROTA NOVA */}
            <Route path="/relatorios" element={<Relatorios />} /> {/* ROTA NOVA */}
            <Route path="/comparacao" element={<Comparacao />} />
            <Route path="/politico/:id" element={<PerfilPolitico />} />
            <Route path="/sobre" element={<Sobre />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </div>
  );
}

export default App;