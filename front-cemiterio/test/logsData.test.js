import test from "node:test";
import assert from "node:assert/strict";
import { loadAuditLogsFromDb, normalizeAuditLogs } from "../src/services/logsData.js";

test("legacy records keep the deceased as entity data instead of audit actor", () => {
    const [log] = loadAuditLogsFromDb({
        falecidos: [
            {
                id: "fal-1",
                nome_fal: "Maria da Silva",
                nome_resp: "José da Silva",
                dh_falec: "2026-07-16T12:00:00.000Z",
            },
        ],
    });

    assert.equal(log.user.name, "Não identificado");
    assert.equal(log.user.isKnown, false);
    assert.equal(log.user.sourceLabel, "Registro legado");
    assert.match(log.description, /Maria da Silva/);
    assert.equal(log.entity.type, "falecido");
});

test("stored logs accept the authenticated actor contract expected from the backend", () => {
    const [log] = normalizeAuditLogs([
        {
            id: "log-1",
            timestamp: "2026-07-16T12:00:00.000Z",
            action: "CREATE",
            actor: {
                id: "usr-1",
                name: "Operador Municipal",
                username: "operador",
                role: "ADMIN",
            },
        },
    ]);

    assert.equal(log.user.id, "usr-1");
    assert.equal(log.user.name, "Operador Municipal");
    assert.equal(log.user.username, "operador");
    assert.equal(log.user.role, "ADMIN");
    assert.equal(log.user.isKnown, true);
    assert.equal(log.user.sourceLabel, "Sessão autenticada");
});
