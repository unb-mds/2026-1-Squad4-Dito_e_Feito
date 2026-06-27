export const formatTipoParlamentar = (tipo) => {
  if (!tipo) return 'Senador';
  const t = tipo.toLowerCase();
  if (t.includes('senador') || t.includes('senadora')) return 'Senador';
  if (t.includes('deputado') || t.includes('deputada')) return 'Deputado';
  return tipo;
};

export const getPartidoLogo = (sigla) => {
  if (!sigla) return '';
  const s = sigla.toUpperCase().trim();
  const logos = {
    'PT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/PT_%28Brazil%29_logo_2021.svg/250px-PT_%28Brazil%29_logo_2021.svg.png',
    'PL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Partido_Liberal_%28Brazil%29_logo.svg/250px-Partido_Liberal_%28Brazil%29_logo.svg.png',
    'MDB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Movimento_Democr%C3%A1tico_Brasileiro_%282017%29.svg/250px-Movimento_Democr%C3%A1tico_Brasileiro_%282017%29.svg.png',
    'PSD': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/PSD_Brazil_logo.svg/250px-PSD_Brazil_logo.svg.png',
    'PP': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Progressistas_%28Brazil%29_logo.svg/250px-Progressistas_%28Brazil%29_logo.svg.png',
    'PSDB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Logo_of_the_Brazilian_Social_Democracy_Party_%282023%29.svg/250px-Logo_of_the_Brazilian_Social_Democracy_Party_%282023%29.svg.png',
    'REP': 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0d/Republicanos_logo.png/250px-Republicanos_logo.png',
    'REPUBLICANOS': 'https://upload.wikimedia.org/wikipedia/pt/thumb/0/0d/Republicanos_logo.png/250px-Republicanos_logo.png',
    'UNIÃO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Uni%C3%A3o_Brasil_logo.svg/250px-Uni%C3%A3o_Brasil_logo.svg.png',
    'PDT': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Bandeira.PDT.png/250px-Bandeira.PDT.png',
    'PSOL': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f4/Logo_PSOL_roxo.svg/250px-Logo_PSOL_roxo.svg.png',
    'PODE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Podemos_%28Brasil%29_logo.svg/250px-Podemos_%28Brasil%29_logo.svg.png',
    'PODEMOS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Podemos_%28Brasil%29_logo.svg/250px-Podemos_%28Brasil%29_logo.svg.png',
    'PSB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Logo_of_the_Brazilian_Socialist_Party_%28wordmark_color%29.svg/250px-Logo_of_the_Brazilian_Socialist_Party_%28wordmark_color%29.svg.png',
    'NOVO': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Partido_Novo_logo_%282023%29.svg/250px-Partido_Novo_logo_%282023%29.svg.png',
    'AVANTE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Avante_70.png/250px-Avante_70.png',
    'REDE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Rede_Sustentabilidade_logo.svg/250px-Rede_Sustentabilidade_logo.svg.png',
    'PV': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Logo_Partido_Verde_Brasil.png/250px-Logo_Partido_Verde_Brasil.png',
    'PCDOB': 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Partido_Comunista_do_Brasil_%28PCdoB%29_logo.svg/250px-Partido_Comunista_do_Brasil_%28PCdoB%29_logo.svg.png',
    'SOLIDARIEDADE': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Solidariedade_77_logo.svg/250px-Solidariedade_77_logo.svg.png'
  };
  return logos[s] || `https://ui-avatars.com/api/?name=${encodeURIComponent(sigla)}&background=1c2128&color=14b8a6&size=128&bold=true`;
};

export const getEstadoFlag = (sigla) => {
  if (!sigla) return '';
  const s = sigla.toUpperCase().trim();
  return `https://assets.codante.io/codante-apis/bandeiras-dos-estados/${s.toLowerCase()}-circle.svg`;
};
