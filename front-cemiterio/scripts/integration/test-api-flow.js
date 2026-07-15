#!/usr/bin/env node

/**
 * Script de teste para validar conexão com json-server e fluxo de cemitério → quadra
 *
 * Uso: npm run test:integration
 */

import axios from "axios";

const API_BASE = "http://localhost:3000";
const api = axios.create({ baseURL: API_BASE, timeout: 5000 });

const log = (msg, data = "") => console.log(`✓ ${msg}`, data ? `\n  ${JSON.stringify(data, null, 2)}` : "");
const error = (msg, err = "") => console.error(`✗ ${msg}`, err ? `\n  ${err}` : "");
const section = (title) => console.log(`\n${"=".repeat(60)}\n${title}\n${"=".repeat(60)}`);

async function testApiFlow() {
    section("🧪 TESTE DE FLUXO: Cemitério → Quadra");

    try {
        // 1. Verificar conexão
        log("Verificando conexão com json-server em " + API_BASE);
        await api.get("/cemeteries");
        log("✓ Conectado ao json-server");

        // 2. Listar cemitérios
        section("1️⃣ Carregando cemitérios");
        const cemRes = await api.get("/cemeteries");
        const cemeteries = cemRes.data;
        log(`Encontrados ${cemeteries.length} cemitérios`, cemeteries);

        if (cemeteries.length === 0) {
            error("ERRO: Nenhum cemitério encontrado em db.json");
            process.exit(1);
        }

        const selectedCemetery = cemeteries[0];
        const cemeteryId = selectedCemetery.id;
        log(`Cemitério selecionado: ${selectedCemetery.name} (ID: ${cemeteryId})`);

        // 3. Criar quadra
        section("2️⃣ Criando quadra");
        const blockPayload = {
            number: 1,
            description: "Quadra Teste",
            active: true,
            cemeteryId: cemeteryId,
        };
        log("Payload de quadra:", blockPayload);

        const blockRes = await api.post("/blocks", blockPayload);
        const createdBlock = blockRes.data;
        log("✓ Quadra criada com sucesso", createdBlock);

        const blockId = createdBlock.id;

        // 4. Criar cova
        section("3️⃣ Criando cova");
        const gravePayload = {
            number: 1,
            blockId: blockId,
            status: "livre",
            blocked: false,
            bodyCapacity: 2,
        };
        log("Payload de cova:", gravePayload);

        const graveRes = await api.post("/graves", gravePayload);
        const createdGrave = graveRes.data;
        log("✓ Cova criada com sucesso", createdGrave);

        // 5. Verificar dados no db.json
        section("4️⃣ Verificando dados salvos em db.json");
        const finalBlocks = await api.get("/blocks");
        const finalGraves = await api.get("/graves");

        log(`Total de quadras em db.json: ${finalBlocks.data.length}`);
        log(`Total de covas em db.json: ${finalGraves.data.length}`);

        section("✅ TESTE COMPLETO COM SUCESSO!");
        log("Fluxo funcional:", "Cemitério → Quadra → Cova criados e salvos em db.json");
    } catch (err) {
        section("❌ ERRO NO TESTE");
        if (err.code === "ECONNREFUSED") {
            error(
                "Falha ao conectar em http://localhost:3000",
                "json-server não está rodando. Inicie com: json-server --watch db.json"
            );
        } else if (err.response) {
            error(`Erro ${err.response.status}: ${err.response.statusText}`, err.response.data);
        } else {
            error("Erro desconhecido", err.message);
        }
        process.exit(1);
    }
}

testApiFlow();
