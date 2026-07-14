# AGENTS.md

## Escopo destas instrucoes

Estas instrucoes se aplicam a todo o repositorio. A aplicacao ativa e mantida esta em `front-cemiterio/`; os arquivos da raiz servem principalmente como documentacao, dados auxiliares e suporte ao ambiente local.

Antes de alterar qualquer arquivo, verifique `git status` e preserve mudancas locais existentes. O repositorio costuma ter trabalho em andamento; nao reverta, reformate em massa nem sobrescreva alteracoes que nao pertencem a tarefa atual.

## Objetivo do produto

O SGC e um Sistema de Gerenciamento de Cemiterios voltado a operacao municipal. O frontend cobre, entre outros, os seguintes dominios:

- autenticacao e preferencias do usuario;
- cemiterios, quadras e sepulturas/covas;
- cadastro de falecidos, velorios e sepultamentos;
- exumacoes;
- ossarios e sepultamento de pets;
- contratos e titulos de posse de sepulturas particulares;
- taxas, calendario, registros, relatorios, indicadores e logs de auditoria.

O projeto esta em estagio avancado de prototipo/integracao. Ele precisa funcionar tanto com dados locais quanto com a API real. Preserve fluxos existentes e compatibilidade com formatos de dados legados ao implementar mudancas incrementais.

## Estrutura principal

- `front-cemiterio/src/pages/`: composicao das telas ligadas as rotas.
- `front-cemiterio/src/components/common/`: componentes reutilizaveis e independentes do dominio.
- `front-cemiterio/src/components/domain/`: componentes e fluxos especificos do SGC.
- `front-cemiterio/src/hooks/`: estado e comportamento reutilizavel de formularios e processos.
- `front-cemiterio/src/services/`: adaptadores de API e servicos por recurso.
- `front-cemiterio/src/stores/`: estado global Zustand; atualmente autenticacao e selecao de cemiterio usam persistencia em `localStorage`.
- `front-cemiterio/src/utils/`: normalizacao, resolucao de referencias, datas, validacao, mascaras e regras puras.
- `front-cemiterio/src/charts/`: graficos e indicadores.
- `front-cemiterio/src/experimental/`: experimentos; nao trate como padrao de producao sem confirmar o uso.
- `front-cemiterio/test/`: testes automatizados com `node:test`.
- `front-cemiterio/db.json`: base local usada pelo json-server e como semente do mock em memoria.
- `ANALISE_ESTRUTURAL_DBJSON.md`, `TESTE_FLUXO_CEMITERIO.md` e `DOCUMENTACAO_PROCESSO_EXUMACAO.md`: contexto historico e cenarios de negocio. Quando houver divergencia, confirme no codigo e nos dados atuais antes de seguir documentos antigos literalmente.

## Stack e convencoes observadas

- React 19 com Vite 7, JavaScript/JSX e modulos ES.
- React Router para navegacao e rotas protegidas.
- Zustand para estado global persistente.
- Axios para acesso HTTP.
- Styled Components como abordagem predominante de estilos, normalmente em `styles.js` ao lado do componente.
- MUI, PrimeReact e componentes proprios coexistem. Reutilize o padrao da area alterada e os componentes de `components/common` antes de introduzir uma nova biblioteca ou uma nova variacao visual.
- Datas usam `date-fns`, MUI Date Pickers e localidade `pt-BR`.
- Graficos usam Chart.js, Recharts e seus adaptadores ja existentes.
- A interface e as mensagens para o usuario devem permanecer em portugues do Brasil.
- O codigo possui nomes de campos em portugues, ingles e formatos legados. Nao renomeie contratos de dados em massa como parte de uma tarefa pontual.

Siga o estilo do arquivo tocado. O repositorio ainda possui variacoes de aspas, ponto e virgula e indentacao; evite uma reformatação ampla que esconda a mudanca funcional.

## Comandos de desenvolvimento

Execute os comandos da aplicacao dentro de `front-cemiterio/`, salvo quando indicado:

```powershell
npm install
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

Para usar a base persistente local, execute a partir da raiz do repositorio:

```powershell
npx json-server front-cemiterio/db.json --port 3000
```

O frontend Vite normalmente abre em `http://localhost:5173`. A API real e acessada por `/api`, com proxy de desenvolvimento para `http://localhost:8080`.

`front-cemiterio/test-api-flow.js` realiza requisicoes de escrita e cria quadras/covas no `db.json`. Nao execute esse script como validacao rotineira sem confirmar que a mutacao dos dados locais e aceitavel.

## Modos de API

O seletor fica em `src/services/index.js` e usa `VITE_API_MODE`:

- `dbjsonapi` (padrao): usa `aliasApi` sobre `dbJSONApi`, normalmente em `http://localhost:3000`;
- `mock`: usa uma copia em memoria do `db.json`; as alteracoes nao persistem no arquivo;
- qualquer outro valor: usa `realApi` em `/api`, incluindo token Bearer e tratamento de `401`.

`VITE_MOCK_API_BASE_URL` pode substituir a URL do json-server. `VITE_MOCK_API_DELAY_MS` controla atraso artificial do mock em memoria.

As colecoes canonicas atuais da base local incluem `cemeteries`, `blocks`, `graves`, `falecidos`, `velorios`, `sepultamentos`, `exumacoes`, `contratos`, `pets`, `ossarios`, `taxas` e `logs`. `aliasApi` mantem compatibilidade de `/quadras` para `/blocks` e de `/covas` para `/graves`.

## Regras de arquitetura

### Acesso a dados

- Prefira um service de dominio a chamadas HTTP espalhadas em paginas e componentes.
- Para CRUD convencional, reutilize `createCrudService` e exponha funcoes nomeadas no service do recurso.
- Mantenha a escolha entre API real, json-server e mock encapsulada na camada `services`; componentes nao devem decidir qual backend esta ativo.
- Trate IDs como identificadores opacos. A base local usa IDs string e a API pode variar; nao aplique `Number()` a IDs. Para comparacoes tolerantes entre fontes, normalize com `String(...)` ou use os resolvers existentes.
- Nao remova aliases ou campos legados sem verificar todos os consumidores e o contrato da API real.

### Normalizacao de dominio

- Centralize variantes de payload em `src/utils/`. Os utilitarios `cemiterio.js`, `contrato.js`, `falecido.js`, `sepultura.js`, `quadra.js` e `mapHelpers.js` sao o local preferencial para getters, normalizadores, resolucao de referencias e formatacao.
- Quando um backend puder retornar nomes diferentes para o mesmo campo, acrescente a compatibilidade ao utilitario do dominio em vez de repetir cadeias de `a ?? b ?? c` em diversos componentes.
- Preserve o objeto original ao normalizar, acrescentando os campos canonicos necessarios para a UI.
- Mantenha utilitarios puros sempre que possivel e adicione testes para regras de mapeamento, contagem, status, capacidade e relacionamento.
- Antes de criar uma nova funcao, procure uma equivalente em `src/utils/index.js` e nos modulos de dominio.

### Estado e componentes

- Use Zustand para estado realmente compartilhado entre telas ou persistente. Estado temporario de modal, filtro e formulario deve permanecer local ou em hooks especializados.
- Ao alterar stores persistidas, mantenha compativel o formato salvo no `localStorage` ou implemente uma migracao/fallback seguro.
- Paginas devem compor a rota; logica extensa e reutilizavel deve ficar em hooks, services, utils ou componentes de dominio.
- Reutilize controles comuns, especialmente `DefaultModal`, `ConfirmationDialog`, `DefaultTable`, `SystemButton`, `SystemSelect`, `CustomSelect`, `StableDateTimePicker`, `DrawerComponent`, `LoadingOverlay` e `EventTimeline`, quando atenderem ao fluxo.
- Para novos estilos, prefira o `styles.js` colocalizado e respeite tema, escala de fonte, estados de foco, responsividade e os estados disabled/loading/error existentes.
- Formularios assincronos devem impedir envio duplicado, apresentar erro util e limpar o erro do campo quando o usuario o corrigir.

## Regras de negocio que nao devem ser quebradas

- A hierarquia estrutural e `cemetery -> block/quadra -> grave/sepultura`.
- Uma quadra pertence a um cemiterio; uma sepultura pertence a uma quadra. Ao filtrar ou relacionar registros, use IDs/resolvers, nao apenas o texto exibido.
- Sepulturas consideram status do backend, bloqueio, capacidade e tipo de area. Valores como `AVAILABLE`, `OCCUPIED`, `MAINTENANCE` e `PERPETUAL` devem passar pelos normalizadores existentes antes de orientar a UI.
- Areas perpetuas/particulares estao ligadas a contrato ou titulo de posse e nao devem aparecer como sepulturas comuns disponiveis sem validar essa condicao.
- O fluxo de sepultamento depende de um falecido e de uma sepultura valida; pode incluir velorio, taxa e titulo de posse.
- Registros exumados nao devem continuar sendo contados como ocupacoes ativas quando a regra existente os exclui.
- Para criar exumacao, `motivo`, `destino` e `coveiro` sao obrigatorios e nao podem conter apenas espacos; observacoes sao opcionais.
- Nao deve existir mais de uma exumacao pendente para o mesmo sepultamento. Preserve o tratamento de erros HTTP `400`, `401/403`, `404`, `409` e `5xx` e nao confirme localmente uma criacao sem objeto valido retornado pela API.
- Dados de `db.json` sao fixtures de desenvolvimento, mas tambem representam cenarios manuais importantes. Nao limpe, reordene ou regenere o arquivo inteiro sem necessidade explicita.

## Fluxo de trabalho esperado

1. Leia a rota, componente, hook, service e utilitario relacionados antes de editar.
2. Verifique mudancas locais e historico recente para nao desfazer uma refatoracao em andamento.
3. Procure primeiro o padrao ja usado em um fluxo semelhante.
4. Implemente a menor mudanca coerente, mantendo compatibilidade com os tres modos de API quando aplicavel.
5. Adicione ou ajuste teste automatizado para logica pura e regressao reproduzivel.
6. Execute validacoes proporcionais a mudanca e informe claramente falhas preexistentes.

Nao crie commits, nao envie branches e nao abra pull requests sem solicitacao explicita. Quando solicitado, siga o padrao observado de commits curtos com prefixos como `feat:`, `fix:`, `refactor:` e `style:`.

## Validacao minima

- Mudanca em utilitario ou regra pura: `npm test` e testes direcionados relevantes.
- Mudanca em JavaScript/JSX: `npm run lint`.
- Mudanca estrutural, de rota, dependencia ou integracao: `npm run build`.
- Mudanca de API local: valide o modo `dbjsonapi`; quando pertinente, confira tambem `mock` e o contrato esperado de `realApi`.
- Mudanca visual ou de formulario: verifique no navegador estados normal, vazio, loading, erro, disabled e responsivo, alem do fluxo principal afetado.

Uma tarefa so esta pronta quando o comportamento solicitado esta implementado, as alteracoes relacionadas foram revisadas no diff, as validacoes relevantes foram executadas e nenhum arquivo alheio foi modificado.
