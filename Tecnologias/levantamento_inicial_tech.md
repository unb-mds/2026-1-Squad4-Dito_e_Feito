

<img width="1440" height="3194" alt="Image" src="https://github.com/user-attachments/assets/5a48d3a3-0781-4d69-98fe-f2122382be15" />

## Por que essa stack?

### Frontend:
 Next.js + TypeScript é a escolha mais sólida para um painel que precisa ser navegável por jornalistas e pesquisadores. SSR melhora o carregamento inicial de páginas pesadas de dados, e o ecossistema React tem as melhores bibliotecas de visualização. Se o projeto for puramente acadêmico ou protótipo rápido, Streamlit elimina a necessidade de escrever qualquer JavaScript — você entrega em 1/3 do tempo, mas sacrifica controle visual.

### NLP: 
BERTimbau é inegociável para português político. Modelos treinados em inglês perdem nuances importantes do discurso legislativo brasileiro (jargão, regionalismos, siglas). O pipeline natural é spaCy para pré-processamento leve (tokenização, lematização) → HuggingFace para embeddings semânticos → classificador customizado para posição (apoio/oposição).

### Banco: 
PostgreSQL com pgvector resolve dois problemas ao mesmo tempo: armazena os dados relacionais (parlamentar → discurso → voto) e serve como vector store para buscas semânticas nos embeddings, sem precisar manter dois sistemas separados. DuckDB é excelente para a fase exploratória local antes de montar o banco de produção.

### API: 
FastAPI se encaixa naturalmente porque todo o restante da stack já é Python. As docs automáticas via Swagger são úteis se houver outros consumidores dos dados (pesquisadores, jornalistas de dados). O suporte nativo a async é importante para não bloquear a API enquanto roda inferência NLP.

Por: Gustavo Antonio
