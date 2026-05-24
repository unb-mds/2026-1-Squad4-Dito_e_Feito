import { Search } from 'lucide-react';

export function Header({ onSearch }) {
  return (
    <header className="mb-8 flex justify-between items-center">
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-texto-secundario" size={18} />
        <input 
          type="text" 
          placeholder="Buscar político por nome..." 
          onChange={(e) => onSearch && onSearch(e.target.value)}
          className="w-full bg-surface border border-slate-700 rounded-full py-2 pl-10 pr-4 text-texto-principal focus:outline-none focus:border-brand-petroleo focus:ring-1 focus:ring-brand-petroleo transition-all"
        />
      </div>
    </header>
  );
}