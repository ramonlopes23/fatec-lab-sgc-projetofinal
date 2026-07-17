import test from "node:test";
import assert from "node:assert/strict";
import { createOperationalProcessConfirmer } from "../src/services/operationalProcessCore.js";

const createDependencies = (overrides = {}) => ({
    patchExumacao: async () => ({}),
    getGraves: async () => [],
    patchGrave: async () => ({}),
    getSepultamentoById: async () => null,
    getSepultamentos: async () => [],
    patchSepultamento: async () => ({}),
    patchVelorio: async () => ({}),
    onWarning: () => {},
    ...overrides,
});

test("sepultamento confirmation updates the primary record and grave capacity", async () => {
    const calls = [];
    const confirm = createOperationalProcessConfirmer(
        createDependencies({
            patchSepultamento: async (id, payload) => {
                calls.push(["sepultamento", id, payload]);
                return { id, ...payload };
            },
            getSepultamentoById: async () => ({ id: "sep-1", quadra_sep: "q-1", num_sepultura_sep: 2 }),
            getGraves: async (params) =>
                params ? [{ id: "grave-1", blockId: "q-1", number: 2, bodyCapacity: 2 }] : [],
            getSepultamentos: async () => [{ id: "sep-1", quadra_sep: "q-1", num_sepultura_sep: 2, confirmado: true }],
            patchGrave: async (id, payload) => {
                calls.push(["grave", id, payload]);
                return { id, ...payload };
            },
        })
    );

    const result = await confirm({ id: "sep-1", _type: "Sepultamento" });

    assert.deepEqual(calls, [
        ["sepultamento", "sep-1", { status: "Concluído", confirmado: true }],
        ["grave", "grave-1", { bodyCapacity: 1, status: "OCCUPIED" }],
    ]);
    assert.deepEqual(result.graveChange, { covaId: "grave-1", capacidade: 1 });
    assert.deepEqual(result.warnings, []);
});

test("primary confirmation errors are propagated", async () => {
    const expectedError = new Error("Falha de escrita");
    const confirm = createOperationalProcessConfirmer(
        createDependencies({ patchVelorio: async () => Promise.reject(expectedError) })
    );

    await assert.rejects(() => confirm({ id: "vel-1", _type: "Velório" }), expectedError);
});

test("secondary synchronization errors return an explicit warning", async () => {
    const confirm = createOperationalProcessConfirmer(
        createDependencies({
            patchExumacao: async () => ({ id: "exu-1" }),
            patchSepultamento: async () => ({ id: "sep-1" }),
            getSepultamentoById: async () => Promise.reject(new Error("Indisponível")),
        })
    );

    const result = await confirm({ id: "exu-1", _type: "Exumação", sepultamentoId: "sep-1" });

    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /capacidade da sepultura/);
});
