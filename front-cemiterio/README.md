# SGC — Sistema de Gerenciamento de Cemitérios

Frontend do sistema municipal de gerenciamento de cemitérios. A aplicação reúne cadastros, mapa de quadras e sepulturas, falecidos, velórios, sepultamentos, exumações, ossários, pets, contratos, taxas, calendário, relatórios e logs de auditoria.

O projeto está em estágio avançado de protótipo e integração. Ele pode operar com uma API real, uma API local persistente baseada em `json-server` ou um mock em memória.

## Stack

- React 19 e Vite 7;
- JavaScript/JSX com módulos ES;
- React Router e Zustand;
- Axios;
- Styled Components, MUI e PrimeReact;
- Chart.js e Recharts;
- ESLint 9 e Prettier 3;
- testes com `node:test`.

## Requisitos

- Node.js 22.12 ou superior;
- npm 10.9 ou superior.

## Instalação

Execute os comandos neste diretório:

```powershell
npm ci
```

Use `npm install` somente quando for necessário adicionar, remover ou atualizar dependências e regenerar o `package-lock.json`.

## Execução local

Inicie o frontend:

```powershell
npm run dev
```

Por padrão, o Vite disponibiliza a aplicação em `http://localhost:5173`.

Para usar a API local persistente, mantenha outro terminal aberto com:

```powershell
npm run mock:server
```

O `json-server` utiliza `db.json` e responde em `http://localhost:3000`.

## Modos de API

O modo é selecionado pela variável `VITE_API_MODE`:

- `dbjsonapi` — modo padrão, usa o `json-server` por meio da camada de aliases;
- `mock` — usa uma cópia de `db.json` em memória, sem persistir alterações;
- qualquer outro valor — usa a API real em `/api`.

Variáveis adicionais:

- `VITE_MOCK_API_BASE_URL` substitui a URL da API local;
- `VITE_MOCK_API_DELAY_MS` configura o atraso artificial do mock em memória.

## Scripts

| Comando                    | Finalidade                                        |
| -------------------------- | ------------------------------------------------- |
| `npm run dev`              | Inicia o ambiente de desenvolvimento              |
| `npm run mock:server`      | Inicia a API local persistente                    |
| `npm run format`           | Formata os arquivos elegíveis com Prettier        |
| `npm run format:check`     | Verifica a formatação sem alterar arquivos        |
| `npm run lint`             | Executa o ESLint                                  |
| `npm run test:unit`        | Executa os testes unitários                       |
| `npm run test:integration` | Executa o fluxo destrutivo contra o `json-server` |
| `npm run build`            | Gera o bundle de produção                         |
| `npm run preview`          | Serve localmente o bundle gerado                  |

O teste de integração cria registros em `db.json`. Não o execute sem confirmar que alterações na base local são aceitáveis.

## Estrutura principal

```text
src/
├── charts/              gráficos e indicadores
├── components/
│   ├── common/          componentes reutilizáveis
│   └── domain/          componentes e fluxos do SGC
├── experimental/        experimentos fora do padrão de produção
├── hooks/               estado e comportamento reutilizável
├── layout/              estrutura visual da aplicação
├── pages/               composição das rotas
├── routes/              definição de navegação
├── services/            acesso às APIs e serviços de domínio
├── stores/              estado global Zustand
└── utils/               normalização e regras puras
```

## Qualidade e integração contínua

O workflow `.github/workflows/ci.yml` executa em pushes e pull requests.

Formatação, lint, testes unitários e build são gates bloqueantes. A auditoria de dependências de produção permanece temporariamente não bloqueante enquanto as vulnerabilidades conhecidas são tratadas. O aviso correspondente no workflow deve ser removido assim que esse baseline estiver aprovado.

Antes de abrir um pull request, execute:

```powershell
npm run format:check
npm run lint
npm run test:unit
npm run build
```

## Documentação complementar

Na raiz do repositório:

- `AGENTS.md` descreve arquitetura, regras de negócio e fluxo de trabalho atual;
- `DOCUMENTACAO_PROCESSO_EXUMACAO.md` registra cenários do processo de exumação;
- `ANALISE_ESTRUTURAL_DBJSON.md` e `TESTE_FLUXO_CEMITERIO.md` preservam análises históricas e podem representar estados anteriores do código e da base local.
