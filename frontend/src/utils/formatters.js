export const formatTipoParlamentar = (tipo) => {
  if (!tipo) return 'Senador';
  const t = tipo.toLowerCase();
  if (t.includes('senador') || t.includes('senadora')) return 'Senador';
  if (t.includes('deputado') || t.includes('deputada')) return 'Deputado';
  return tipo;
};
