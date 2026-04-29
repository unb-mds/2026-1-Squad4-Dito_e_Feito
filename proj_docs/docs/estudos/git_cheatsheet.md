# Git — Resumo e Comandos Essenciais
---
## Como o Git funciona

O Git é um sistema de **controle de versão distribuído**. Isso significa que cada desenvolvedor tem uma cópia completa do repositório na própria máquina, incluindo todo o histórico.

### Os três estados de um arquivo

```
Working Directory  →  Staging Area (Index)  →  Repositório (.git)
    (edição)              (git add)               (git commit)
```

- **Working Directory**: onde você edita os arquivos normalmente.
- **Staging Area**: área intermediária onde você prepara o que vai entrar no próximo commit.
- **Repositório**: banco de dados interno do Git com todos os commits e histórico.

### O que é um commit

Um commit é um **snapshot** (fotografia) do projeto num determinado momento. Cada commit tem um hash SHA-1 único, uma mensagem, o autor, a data e um ponteiro para o commit anterior — formando uma cadeia (histórico).

### Branches e HEAD

Uma **branch** é apenas um ponteiro móvel para um commit. O **HEAD** aponta para a branch atual (ou diretamente para um commit, no estado "detached HEAD").

```
main  →  A ← B ← C ← D   (HEAD aponta para main)
                  ↑
              feature  →  E ← F
```

### Repositório remoto

Um **remote** (ex: GitHub) é outra cópia do repositório. O Git sincroniza com ele via `push` e `pull`. Por convenção, o remote principal se chama `origin`.

---

## Configuração inicial

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git config --global core.editor "code --wait"   # define o editor (VS Code neste caso)

git config --list                                # lista todas as configurações
```

---

## Criar e clonar repositórios

```bash
git init                        # inicia um repositório novo na pasta atual
git init nome-do-projeto        # cria uma nova pasta e inicia o repositório nela

git clone <url>                 # clona um repositório remoto
git clone <url> nome-local      # clona e renomeia a pasta local
```

---

## Status e histórico

```bash
git status                      # mostra o estado dos arquivos (modificados, staged, untracked)
git status -s                   # versão compacta do status

git log                         # histórico de commits completo
git log --oneline               # histórico resumido (uma linha por commit)
git log --oneline --graph       # histórico com visualização de branches
git log --oneline -10           # últimos 10 commits

git diff                        # diferença entre working directory e staging area
git diff --staged               # diferença entre staging area e último commit
git diff <branch1> <branch2>    # diferença entre duas branches

git show <hash>                 # detalhes de um commit específico
```

---

## Adicionar e commitar

```bash
git add <arquivo>               # adiciona um arquivo à staging area
git add .                       # adiciona todos os arquivos modificados/novos
git add -p                      # adiciona interativamente (pedaço por pedaço)

git commit -m "mensagem"        # cria um commit com a mensagem
git commit -am "mensagem"       # add + commit de arquivos já rastreados (não pega novos)
git commit --amend              # reescreve o último commit (mensagem ou conteúdo)
git commit --amend --no-edit    # reescreve o último commit mantendo a mesma mensagem
```

---

## Branches

```bash
git branch                      # lista branches locais
git branch -a                   # lista branches locais e remotas
git branch nome                 # cria uma nova branch
git branch -d nome              # deleta branch (seguro: só deleta se já foi mergeada)
git branch -D nome              # força a deleção da branch
git branch -m nome-novo         # renomeia a branch atual

git switch nome                 # muda para uma branch existente  (Git 2.23+)
git switch -c nome              # cria e muda para nova branch     (Git 2.23+)

# Equivalentes mais antigos (ainda muito usados):
git checkout nome               # muda para uma branch existente
git checkout -b nome            # cria e muda para nova branch
```

---

## Merge e Rebase

```bash
# Merge: une o histórico das branches com um "merge commit"
git merge nome-da-branch        # merge da branch indicada na branch atual

# Rebase: reaplica seus commits sobre outra base (histórico linear)
git rebase main                 # reaplica commits da branch atual sobre main

git rebase -i HEAD~3            # rebase interativo dos últimos 3 commits
                                # (útil para squash, reordenar, editar mensagens)

# Resolver conflitos (após merge ou rebase com conflito):
# 1. Edite os arquivos conflitantes
git add <arquivo-resolvido>
git merge --continue            # ou: git rebase --continue
git merge --abort               # cancela o merge
git rebase --abort              # cancela o rebase
```

---

## Repositório remoto

```bash
git remote -v                           # lista os remotes configurados
git remote add origin <url>             # adiciona um remote chamado origin
git remote remove origin               # remove o remote

git fetch                               # busca atualizações do remote SEM aplicar
git fetch origin                        # fetch de um remote específico

git pull                                # fetch + merge da branch atual
git pull --rebase                       # fetch + rebase (histórico mais limpo)

git push origin nome-da-branch          # envia a branch para o remote
git push -u origin nome-da-branch       # envia e configura o upstream (tracking)
git push                                # envia a branch atual (se upstream configurado)
git push --force-with-lease             # force push seguro (verifica conflitos remotos)

git push origin --delete nome-da-branch # deleta branch no remote
```

---

## Desfazer e corrigir erros

```bash
# Tirar arquivo da staging area (mantém as alterações no working directory)
git restore --staged <arquivo>          # (Git 2.23+)
git reset HEAD <arquivo>                # equivalente mais antigo

# Descartar alterações no working directory (IRREVERSÍVEL)
git restore <arquivo>                   # (Git 2.23+)
git checkout -- <arquivo>               # equivalente mais antigo

# Desfazer commits (sem alterar o working directory)
git reset --soft HEAD~1                 # desfaz 1 commit, mantém tudo staged
git reset --mixed HEAD~1                # desfaz 1 commit, mantém arquivos modificados (padrão)
git reset --hard HEAD~1                 # desfaz 1 commit e DESCARTA todas as alterações

# Criar um commit que reverte outro commit (seguro para histórico público)
git revert <hash>                       # cria um commit que desfaz o commit indicado
git revert HEAD                         # reverte o último commit
```

---

## Stash — guardar trabalho temporariamente

```bash
git stash                               # guarda as alterações atuais numa pilha
git stash push -m "descrição"          # stash com mensagem descritiva
git stash list                          # lista todos os stashes
git stash pop                           # aplica o stash mais recente e remove da pilha
git stash apply stash@{2}              # aplica um stash específico sem remover
git stash drop stash@{0}               # remove um stash específico
git stash clear                         # remove todos os stashes
```

---

## Tags

```bash
git tag                                 # lista todas as tags
git tag v1.0.0                          # cria uma tag leve no commit atual
git tag -a v1.0.0 -m "Release 1.0.0"   # cria uma tag anotada (recomendado)
git tag -a v1.0.0 <hash>               # cria tag em um commit específico

git push origin v1.0.0                  # envia uma tag para o remote
git push origin --tags                  # envia todas as tags

git tag -d v1.0.0                       # deleta tag localmente
git push origin --delete v1.0.0         # deleta tag no remote
```

---

## Cherry-pick

```bash
git cherry-pick <hash>                  # aplica um commit específico na branch atual
git cherry-pick <hash1> <hash2>         # aplica múltiplos commits
git cherry-pick A..B                    # aplica um intervalo de commits (A exclusivo, B inclusivo)
git cherry-pick --no-commit <hash>      # aplica as alterações sem criar o commit
```

---

## .gitignore

Arquivo que lista padrões de arquivos e pastas que o Git deve ignorar.

```
# Exemplos de .gitignore
node_modules/
*.log
*.env
.DS_Store
build/
dist/
```

```bash
git rm --cached <arquivo>       # para de rastrear um arquivo sem deletá-lo do disco
                                # (útil quando você esqueceu de colocar no .gitignore)
```

---

## Comandos úteis extras

```bash
git shortlog -sn                # conta commits por autor
git blame <arquivo>             # mostra quem escreveu cada linha de um arquivo
git bisect start                # inicia busca binária para encontrar commit que introduziu um bug
git reflog                      # histórico de todos os movimentos do HEAD (salva-vidas!)
git clean -fd                   # remove arquivos não rastreados e pastas (IRREVERSÍVEL)
git ls-files                    # lista todos os arquivos rastreados pelo Git
```

---

## Fluxo típico de trabalho

```bash
# 1. Atualizar main
git switch main
git pull

# 2. Criar branch para a feature
git switch -c feature/minha-feature

# 3. Desenvolver e commitar
git add .
git commit -m "feat: adiciona nova funcionalidade"

# 4. Atualizar com main antes de abrir PR
git fetch origin
git rebase origin/main

# 5. Enviar para o remote
git push -u origin feature/minha-feature

# 6. Após merge do PR, limpar
git switch main
git pull
git branch -d feature/minha-feature
```