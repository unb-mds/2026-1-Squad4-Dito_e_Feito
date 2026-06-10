const fs = require('fs');
const path = require('path');

const hookPath = path.join(__dirname, '..', '.git', 'hooks', 'pre-commit');

const hookContent = `#!/bin/sh

echo "============================================="
echo "🔍 Rodando testes automáticos de pré-commit..."
echo "============================================="

# 1. Executar testes do backend
echo "\\n-> Rodando testes unitários do backend (Pytest)..."
cd backend
pytest
BACKEND_EXIT=$?
cd ..

if [ $BACKEND_EXIT -ne 0 ]; then
  echo "\\n❌ Falha nos testes do backend. Commit abortado."
  exit 1
fi

# 2. Executar testes do frontend
echo "\\n-> Rodando testes unitários do frontend (Vitest)..."
cd frontend
npm run test
FRONTEND_EXIT=$?
cd ..

if [ $FRONTEND_EXIT -ne 0 ]; then
  echo "\\n❌ Falha nos testes do frontend. Commit abortado."
  exit 1
fi

echo "\\n✅ Todos os testes passaram! Criando o commit..."
exit 0
`;

try {
  // Cria a pasta hooks se ela não existir por algum motivo
  const hooksDir = path.dirname(hookPath);
  if (!fs.existsSync(hooksDir)) {
    fs.mkdirSync(hooksDir, { recursive: true });
  }

  // Grava o arquivo do hook
  fs.writeFileSync(hookPath, hookContent, { encoding: 'utf8', mode: 0o755 });
  
  // No Windows o 'mode' no writeFileSync nem sempre aplica permissão de execução
  // mas o Git Bash / WSL trata corretamente se configurado.
  try {
    fs.chmodSync(hookPath, '755');
  } catch (e) {
    // Silencia erros de chmod em sistemas onde não é suportado nativamente
  }

  console.log('✅ Git hook de pré-commit configurado com sucesso!');
  console.log('Toda vez que você rodar "git commit", os testes do backend e frontend serão validados automaticamente.');
} catch (err) {
  console.error('❌ Erro ao configurar o git hook:', err.message);
}
