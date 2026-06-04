# 📋 TODO List

Um sistema de lista de tarefas simples, responsivo e agradável de usar, feito apenas com **HTML5**, **CSS3** e **JavaScript** puro (sem frameworks ou dependências externas além da fonte Inter).

## ✨ Funcionalidades

- ➕ Adicionar tarefas com **título**, **descrição** (opcional) e **prioridade**
- 🚦 Prioridades **Alta**, **Moderada** e **Baixa**, com cores de destaque e ordenação automática
- ✅ Marcar como concluída / ativa
- 👁️ Visualizar a tarefa em detalhe num **modal**, com opções de editar, excluir e alternar status
- ✏️ Editar tarefa (duplo clique na lista ou pelo modal) — título, descrição e prioridade
- 🗑️ Excluir tarefa (na lista ou pelo modal), sempre com **diálogo de confirmação**
- 🔎 **Busca** por título da tarefa (com botão para limpar)
- 🔍 Filtros por **status** (Todas / Ativas / Concluídas) e por **prioridade** (Alta / Moderada / Baixa)
- 🧹 Limpar todas as concluídas de uma vez
- 📊 Indicador de progresso e contador de itens restantes
- 💾 Persistência automática no navegador (`localStorage`)
- 🌙 Tema claro/escuro (respeita a preferência do sistema e é salvo)
- 📱 Layout totalmente responsivo

## 🎨 Princípios de UX aplicados

- **Cores suaves e agradáveis**: paleta em tons pastel de azul/verde, com bom contraste.
- **Feedback imediato**: animações sutis, estados de foco/hover e mensagens vivas (`aria-live`).
- **Estado vazio** com orientação clara para o próximo passo.
- **Hierarquia visual** clara entre título, ações e conteúdo.
- **Acessibilidade**: navegação por teclado, `aria-labels`, link "pular para o conteúdo", foco visível e suporte a `prefers-reduced-motion`.

## 🚀 Como usar

Não há build nem instalação. Basta abrir o arquivo `index.html` no navegador:

```bash
# A partir da pasta do projeto
xdg-open index.html      # Linux
# ou simplesmente dê um duplo clique no arquivo
```

Opcionalmente, você pode servir com um servidor local:

```bash
python3 -m http.server 8000
# depois acesse http://localhost:8000
```

## 📁 Estrutura

```
todo/
├── index.html   # Estrutura e marcação semântica
├── styles.css   # Estilos, temas e responsividade
├── script.js    # Lógica da aplicação (CRUD, filtros, tema, persistência)
└── README.md
```

## ⌨️ Atalhos

- **Enter** no campo de texto: adiciona a tarefa
- **Duplo clique** no texto: editar inline
- 👁️ (ícone de olho): abrir o modal de detalhes
- **Enter** durante a edição: salvar
- **Esc**: cancelar a edição / fechar o modal
