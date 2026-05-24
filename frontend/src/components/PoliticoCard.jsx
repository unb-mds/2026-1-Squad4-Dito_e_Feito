import { useState } from 'react';
import { Users } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PoliticoCard({ politico }) {
  // Estado para monitorar se a imagem quebrou (erro 404 da API governamental)
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <Link 
      to={`/politico/${politico.id}`} 
      state={{ politico }}
      className="bg-surface p-4 rounded-lg border border-slate-800 shadow-sm flex items-center gap-4 hover:border-brand-petroleo transition-colors block"
    >
      {/* Se houver foto e ela carregar com sucesso, exibe. Se falhar, ativa o fallback */}
      {politico.foto && imageLoaded ? (
        <img 
          src={politico.foto} 
          alt={`Foto de ${politico.nome}`} 
          className="w-12 h-12 rounded-full border border-slate-700 object-cover"
          onError={() => setImageLoaded(false)} 
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-texto-secundario border border-slate-700">
          <Users size={20} />
        </div>
      )}
      
      <div>
        <h3 className="font-semibold text-sm text-texto-principal">{politico.nome}</h3>
        <p className="text-xs text-texto-secundario uppercase">
          {politico.partido} • {politico.uf}
        </p>
      </div>
    </Link>
  );
}