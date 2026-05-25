export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-fundo py-6 px-8 mt-auto flex flex-col md:flex-row justify-between items-center text-xs text-texto-secundario">
      <div className="flex items-center gap-4 mb-4 md:mb-0">
        <span className="font-semibold text-texto-principal">UnB</span>
        <span>Universidade de Brasília</span>
      </div>
      <div className="flex items-center gap-6">
        <p>© 2026 Dito e Feito. Squad 4 - Engenharia de Software.</p>
        <a 
          href="https://github.com/unb-mds/2026-1-Squad4" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="hover:text-primaria transition-colors flex items-center gap-1"
        >
          {/* SVG inline substitui a dependência do Lucide temporariamente */}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.02c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A4.8 4.8 0 0 0 8 18v4"></path>
          </svg>
          <span>Repositório</span>
        </a>
      </div>
    </footer>
  );
}