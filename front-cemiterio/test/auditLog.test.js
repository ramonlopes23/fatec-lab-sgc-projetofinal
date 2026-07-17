import test from "node:test";
import assert from "node:assert/strict";
import { buildSystemMutationLog } from "../src/utils/auditLog.js";

test("buildSystemMutationLog creates a canonical mutation event", () => {
    const log = buildSystemMutationLog({
        action: "create",
        resource: "falecidos",
        result: { id: "fal-1" },
        payload: { nome_fal: "Maria da Silva", confirmado: true },
        actor: { name: "Operador", sourceField: "username" },
        timestamp: "2026-07-16T12:00:00.000Z",
    });

    assert.equal(log.action, "CREATE");
    assert.equal(log.entity.id, "fal-1");
    assert.equal(log.entity.type, "falecido");
    assert.equal(log.module, "Falecidos");
    assert.equal(log.user.name, "Operador");
    assert.equal(log.user.isKnown, true);
    assert.equal(log.timeline.length, 2);
    assert.equal(log.additionalInfo.nome_fal, "Maria da Silva");
});

test("buildSystemMutationLog omits sensitive fields and limits complex values", () => {
    const log = buildSystemMutationLog({
        action: "UPDATE",
        resource: "contratos",
        entityId: "contrato-1",
        payload: {
            accessToken: "segredo",
            password: "segredo",
            titular: { nome: "João" },
            parcelas: [1, 2, 3],
        },
    });

    assert.equal("accessToken" in log.additionalInfo, false);
    assert.equal("password" in log.additionalInfo, false);
    assert.equal(log.additionalInfo.titular, "[OBJETO]");
    assert.equal(log.additionalInfo.parcelas, "[LISTA: 3]");
});

test("buildSystemMutationLog preserves opaque identifiers", () => {
    const log = buildSystemMutationLog({
        action: "DELETE",
        resource: "pets",
        entityId: "pet-a8f3",
    });

    assert.equal(log.entity.id, "pet-a8f3");
    assert.equal(log.sourceRecordId, "pet-a8f3");
    assert.equal(log.user.name, "Não identificado");
    assert.equal(log.user.isKnown, false);
});
