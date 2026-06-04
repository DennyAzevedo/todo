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
- **Acessibilidade**: navegação por teclado, `aria-labels`, diálogos com `role="dialog"`/`alertdialog` e foco preso, foco visível e suporte a `prefers-reduced-motion`.

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

## 🤖 Desenvolvimento com o Cursor

Este projeto foi desenvolvido inteiramente com o auxílio do **[Cursor](https://cursor.com)** (editor com IA), por meio de prompts em linguagem natural, **sem intervenção direta no código**. Abaixo estão, em ordem, os prompts utilizados para construir e evoluir a aplicação:

1. **Criação inicial**
   > Criar um projeto de sistema de uma TODO List, utilizando HTML5, CSS3 e JavaScript.
   >
   > Crie um interface responsiva, que utilize os principais princípios do UX Designer e tenha cores suaves e agradáveis.

2. **Prioridade e descrição**
   > Perfeito. Mas além do título da tarefa quero colocar uma prioridade (vamos atuar com alta, moderada e baixo - com cores destacando a prioridade) e uma descrição das tarefas.

3. **Visualização em modal**
   > Para uma melhor visualização, quero poder visualizar uma tarefa em uma janela modal ou página individual, o que ficar melhor visualmente, e dentro das regras de UX. Podendo editar e excluir a tarefa nesta janela ou página. Não retirar a funcionalidade que já temos de edição e exclusão na tela principal.

4. **Correção do modal**
   > O modal está aberto de forma constante, e não fecha. Corrigir o problema, ele deve abrir para uma tarefa específica que eu selecionar.

5. **Confirmação de exclusão e limpeza**
   > Nas exclusões, pedir uma confirmação para efetuar a mesma. E verificar um elemento com o texto "Pular para o conteúdo" que foi colocado no início da página e não tem funcionalidade, remover.

6. **Busca e filtro por prioridade**
   > Adicionar uma busca por título da tarefa e um filtro por prioridade.
