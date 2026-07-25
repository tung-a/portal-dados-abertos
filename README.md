# Portal de Dados Abertos — Observatório de Justiça Climática de São Vicente

Catálogo de datasets geoespaciais, tabulares e estatísticos sobre o território de São Vicente (SP). Desenvolvido como Projeto Integrador da disciplina **Governo Aberto** (EACH/USP), em parceria com o **Observatório de Justiça Climática de São Vicente** (Coop Clima).

## Sobre o projeto

O portal centraliza datasets sobre vulnerabilidade climática, risco socioambiental, território e dados socioeconômicos do município. Todos os conjuntos de dados são publicados com:

- **DOI registrado no CERN Zenodo** — identificador persistente e citável
- **Licença aberta** — CC BY 4.0, CC0 1.0 ou ODbL 1.0
- **Proveniência documentada** — metodologia, fonte e limitações conhecidas
- **Metadados W3C DWBP** — conformidade com as Boas Práticas de Dados na Web

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | React 19 + Vite 8 |
| Estilo | CSS vanilla (sem framework), variáveis CSS customizadas |
| Repositório de dados | CERN Zenodo Sandbox (REST API) |
| Dados estruturados | schema.org/Dataset via JSON-LD |
| Fontes | Londrina Solid (títulos) + Roboto (corpo) via Google Fonts |

## Funcionalidades

- **Catálogo paginado** — 5 cards por página, com busca por palavra-chave e filtros por categoria e formato
- **Sincronização automática com Zenodo** — carrega os depósitos da conta via API no primeiro acesso
- **Modal de detalhe** — descrição completa, lista de arquivos com busca e filtro por extensão, metadados técnicos, bloco W3C DWBP, download individual e em lote
- **Publicação de datasets** — modal de upload com formulário W3C DWBP (proveniência, qualidade, contato, frequência de atualização), envia para o Zenodo Sandbox
- **Link direto** — cada dataset tem URL própria via `?id=` para compartilhamento e rastreabilidade
- **SEO** — JSON-LD injetado no `<head>` ao abrir o detalhe de um dataset
- **Acessibilidade** — `role="dialog"`, `aria-modal`, `aria-labelledby`, navegação por teclado (Escape fecha o modal)
- **Mobile** — bottom sheet no detalhe do dataset com scroll lock (corrige iOS Safari), cabeçalho compacto

## Estrutura de componentes

```text
src/
├── components/
│   ├── Header/               # Cabeçalho com busca e grid de eixos temáticos
│   ├── SidebarFilters/       # Filtros por categoria e formato
│   ├── DatasetCard/          # Card do catálogo com badge de licença
│   ├── DatasetDetailModal/   # Modal de detalhe (bottom sheet no mobile)
│   └── DatasetUploadModal/   # Modal de publicação de novo dataset
├── assets/
│   └── logos/
└── App.jsx                   # Lógica central, filtros, paginação, integração Zenodo
```

## Configuração

### Pré-requisitos

- Node.js 18+
- Conta no [Zenodo Sandbox](https://sandbox.zenodo.org) com token de acesso pessoal

### Variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_ZENODO_TOKEN=seu_token_aqui
```

> **Atenção:** o token fica exposto no bundle do cliente (comportamento esperado para ambiente de desenvolvimento/sandbox). Não use um token de produção.

### Instalação e execução

```bash
npm install
npm run dev      # servidor de desenvolvimento
npm run build    # build de produção
npm run preview  # preview do build
```

## Conformidade W3C DWBP

| Prática | Descrição | Status |
| --- | --- | --- |
| BP4 | Licença visível e linkável em cada dataset | ✅ |
| BP5 | Proveniência e metodologia documentadas | ✅ |
| BP6 | Qualidade e limitações conhecidas | ✅ |
| BP7 | DOI como identificador persistente | ✅ |
| BP14 | Metadados schema.org/Dataset via JSON-LD | ✅ |
| BP23 | Contato responsável pelo dataset | ✅ |
| BP29 | Frequência de atualização declarada | ✅ |

## Identidade visual

O portal segue o manual de marca **Coop Clima São Vicente**. As cores institucionais estão definidas como CSS custom properties em `src/index.css`:

```css
--coop-verde:      #007a4a
--coop-escuro:     #1a3c2c
--coop-fundo-claro:#f9f3f0
--coop-marrom:     #874a33
--coop-azul:       #00a3e0
--coop-laranja:    #e87722
```

---

Projeto Integrador — Disciplina Governo Aberto (EACH/USP) · Observatório de Justiça Climática de São Vicente
