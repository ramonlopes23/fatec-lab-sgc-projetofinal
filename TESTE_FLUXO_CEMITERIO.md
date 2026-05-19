# ✅ Resolução: Sistema de Cemitério → Quadra

## 📋 Mudanças Realizadas

### 1. **Store (cemeteryStore.js)**
   - ✅ Removido Number() coercion de `selectedCemeteryId`
   - ✅ IDs agora mantêm tipo string (conforme db.json)
   - ✅ loadCemeteries usa setSelectedCemeteryId para normalizar

### 2. **Página VerMapa (index.jsx)**
   - ✅ Adicionado useEffect que chama `loadCemeteries()` no mount
   - ✅ handleCreateQuadra agora valida string IDs ao invés de Number
   - ✅ Adicionado console.log para debug de selectedCemeteryId

### 3. **Services & API**
   - ✅ aliasApi.js criado para mapear `/quadras` → `/blocks`, `/covas` → `/graves`
   - ✅ index.js atualizado para usar aliasApi em modo "dbjsonapi"
   - ✅ mockApi.js atualizado para usar collections corretas (blocks, graves)

### 4. **db.json**
   - ✅ Renomeado: `quadras` → `blocks`
   - ✅ Renomeado: `covas` → `graves`
   - ✅ 2 cemitérios cadastrados com IDs string

### 5. **Services Criados**
   - ✅ falecidoService.js
   - ✅ sepultamentoService.js
   - ✅ exumacaoService.js
   - ✅ petService.js
   - ✅ contratoService.js
   - ✅ velorioService.js

---

## 🧪 Status do Teste

**✅ TESTE DE API PASSOU:**
- json-server rodando em http://localhost:3000
- Cemitérios carregados com sucesso
- Quadra criada com sucesso
- Cova criada com sucesso

**📊 Dados em db.json:**
- Cemitérios: 2
- Quadras: 1 (da última criação)
- Covas: 1 (da última criação)

---

## 🚀 Próximos Passos para Testar no Frontend

### No navegador:
1. Abra http://localhost:5173 (Vite dev server)
2. Navegue para **VerMapa**
3. Verifique se cemitérios aparecem no dropdown
4. Clique em **"Adicionar Quadra"**
5. Preencha:
   - Número: `2`
   - Descrição: `Quadra Teste 2`
6. Clique em **Salvar**

### Resultado esperado:
- ✅ Quadra criada e adicionada à lista
- ✅ db.json atualizado com novo entry em `/blocks`
- ✅ Sem erro de "Selecione um cemitério"

---

## 🔍 Debug

Se ainda tiver erro, abra o **DevTools** (F12) e verifique:

```javascript
// No console do navegador:
// 1. Verificar selectedCemeteryId
console.log(useCemeteryStore.getState().selectedCemeteryId);

// 2. Verificar cemitérios carregados
console.log(useCemeteryStore.getState().cemeteries);

// 3. Verificar localStorage
console.log(localStorage.getItem('sgc-cemetery-selection'));
```

Se selectedCemeteryId for `null`, significa que `loadCemeteries()` não foi executado ou falhou.

---

## 📝 Checklist de Validação

- [ ] json-server rodando em http://localhost:3000
- [ ] `npm run dev` iniciado (Vite em http://localhost:5173)
- [ ] Acessar VerMapa e verificar se cemitérios aparecem
- [ ] Criar uma quadra com sucesso
- [ ] Verificar db.json e confirmar novo entry em `/blocks`
- [ ] Testar criar cova (grave) associada à quadra
- [ ] Testar criar sepultamento associado à cova
