# Análise Estrutural - Consumir db.json Completamente

## 1. Endpoints & Collections Mapeadas

### ✅ Já presentes em db.json:
- `falecidos` - dados de falecidos
- `velorios` - dados de velórios
- `exumacoes` - dados de exumações
- `sepultamentos` - dados de sepultamentos
- `cemeteries` - dados de cemitérios
- `quadras` - dados de quadras (blocos)
- `covas` - dados de covas
- `contratos` - dados de contratos
- `pets` - dados de pets

### ❌ Faltam em db.json:
- `graves` - necessário para graveService e componentes (Dashboard, PieChartSepulturas, VerMapa)

### ⚠️ Observações importantes:
- `db.json` usa chave `cemeteries`, mas mockApi tinha alias `blocks → quadras`
- Endpoint `/burial` (Cadastros) deveria apontar para `/sepultamentos`
- Todos os IDs são strings (UUIDs) no json-server, não números

---

## 2. Serviços Afetados & Endpoints Utilizados

### blockService.js → `/blocks`
```javascript
- getBlocks()          // GET /blocks
- createBlock()        // POST /blocks
- updateBlock()        // PUT /blocks/:id
- inactivateBlock()    // PATCH /blocks/:id/inactive
```
**Encontrado em:** VerMapa, useBlocks, useCreateBlocks

### graveService.js → `/graves`
```javascript
- getGraves()          // GET /graves
- createGrave()        // POST /graves
- updateGrave()        // PUT /graves/:id
- patchGraveStatus()   // PATCH /graves/:id (usado em VerMapa)
```
**Encontrado em:** VerMapa, PieChartSepulturas, Dashboard

### cemeteryService.js → `/cemeteries`
```javascript
- getCemeteries()      // GET /cemeteries
- createCemeteries()   // POST /cemeteries
- updateCemeteries()   // PUT /cemeteries/:id
- inactiveCemeteries() // PATCH /cemeteries/:id/inactive
```
**Encontrado em:** useCemeteryStore, VerMapa

### Endpoints diretos via api.post/get/delete (sem serviço):
| Endpoint | Métodos | Local | Propósito |
|----------|---------|-------|----------|
| `/falecidos` | GET, POST | Cadastros, Dashboard, RegistrosComponent, ApiInit | Gerenciar falecidos |
| `/sepultamentos` | GET, POST | Cadastros (como `/burial`), VerMapa, Dashboard | Gerenciar sepultamentos |
| `/exumacoes` | GET, POST, DELETE | VerMapa, Dashboard, RegistrosComponent | Gerenciar exumações |
| `/pets` | GET, POST, DELETE | CovaPetsSection, VerMapa | Gerenciar pets |
| `/contratos` | GET, POST, DELETE | ContratosComponent | Gerenciar contratos |
| `/quadras` | GET | Dashboard, RegistrosComponent, RelatoriosComponent | Listar quadras (alias para blocks) |
| `/covas` | GET | Dashboard, RegistrosComponent, RelatoriosComponent, ApiInit | Listar covas (graves) |

---

## 3. Mudanças Estruturais Necessárias

### 3.1 Atualizar db.json
Adicionar collection `graves`:
```json
{
  "graves": []
}
```

### 3.2 Criar graveService.js
Implementar o serviço seguindo o padrão dos outros:
```javascript
import { createCrudService } from "./createCrudService.js";

const service = createCrudService("graves");

export const getGraves = async (params) => service.list(params);
export const createGrave = async (payload) => service.create(payload);
export const updateGrave = async (id, payload) => service.update(id, payload);
export const inactivateGrave = async (id) => service.inactivate(id);
export const patchGraveStatus = async (id, payload) => service.patch(id, payload);
```

### 3.3 Ajustar endpoints com alias
**Problema:** Alguns endpoints no código chamam `/quadras` e `/covas` diretamente, mas os serviços usam `/blocks` e `/graves`.

**Solução:**
Criar wrapper de endpoints que mapeia:
- `/quadras` → `/blocks` (quando houver GET direto)
- `/covas` → `/graves` (quando houver GET direto)

Ou criar novo arquivo `aliasApi.js` que intercepta essas requisições.

### 3.4 Resolver endpoint `/burial`
Em Cadastros, há: `await api.post("/burial", payload)`

**Opções:**
- Renomear para `/sepultamentos` 
- Criar rota alias que mapeia `/burial` → `/sepultamentos`

---

## 4. Problemas & Soluções

| Problema | Causa | Solução |
|----------|-------|---------|
| Falta `graves` em db.json | Não foi criada | Adicionar `"graves": []` ao db.json |
| graveService não existe | Não foi implementado | Criar arquivo graveService.js com CRUD padrão |
| Alias `/quadras` e `/covas` | Chamadas diretas em componentes | Interceptar/mapear requisições ou usar endpoints corretos |
| IDs são strings, não números | json-server usa strings, código esperava números | Já foi ajustado em stores e hooks |
| `/burial` não corresponde a nenhuma collection | Endpoint criado ad-hoc | Renomear para `/sepultamentos` |

---

## 5. Ordem de Implementação Recomendada

1. ✅ Já feito: Ajustar tipos de IDs (string vs número)
2. ⏳ **Próximo:** Adicionar `"graves": []` em db.json
3. ⏳ **Próximo:** Criar/implementar graveService.js
4. ⏳ **Próximo:** Atualizar VerMapa para usar graveService
5. ⏳ **Próximo:** Criar aliasApi ou middleware para `/quadras` → `/blocks` e `/covas` → `/graves`
6. ⏳ **Próximo:** Renomear `/burial` → `/sepultamentos` em Cadastros
7. ⏳ **Próximo:** Testar fluxo completo com json-server rodando

---

## 6. Checklist de Validação

- [ ] db.json tem todas as 10 collections
- [ ] Todos os serviços (cemetery, block, grave) usam createCrudService
- [ ] Nenhum endpoint hardcoded quebra
- [ ] json-server está rodando em http://localhost:3000
- [ ] VITE_API_MODE = "dbjsonapi"
- [ ] Teste criar cemitério → quadra → cova → sepultamento (fluxo completo)
