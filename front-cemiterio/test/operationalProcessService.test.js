import test from "node:test";
import assert from "node:assert/strict";
import {
    createExumacaoConfirmer,
    createOperationalProcessConfirmer,
    createSepultamentoConfirmer,
    createVelorioConfirmer,
} from "../src/services/operationalProcessCore.js";

const createDependencies = (overrides = {}) => ({
    adjustGraveCapacity: async () => null,
    patchExumacao: async () => ({}),
    getSepultamentoById: async () => null,
    patchSepultamento: async () => ({}),
    patchVelorio: async () => ({}),
    onWarning: () => {},
    ...overrides,
});

test("sepultamento confirmation updates the primary record and grave capacity", async () => {
    const calls = [];
    const confirm = createSepultamentoConfirmer(
        createDependencies({
            patchSepultamento: async (id, payload) => {
                calls.push(["sepultamento", id, payload]);
                return { id, ...payload };
            },
            getSepultamentoById: async () => ({
                id: "sep-1",
                quadra_sep: "q-1",
                num_sepultura_sep: 2,
                confirmado: false,
            }),
            adjustGraveCapacity: async (id, delta) => {
                calls.push(["capacity", id, delta]);
                return { covaId: "grave-1", capacidade: 1 };
            },
        })
    );

    const result = await confirm({ id: "sep-1" });

    assert.deepEqual(calls, [
        ["sepultamento", "sep-1", { status: "Concluído", confirmado: true }],
        ["capacity", "sep-1", -1],
    ]);
    assert.deepEqual(result.graveChange, { covaId: "grave-1", capacidade: 1 });
    assert.deepEqual(result.warnings, []);
});

test("primary confirmation errors are propagated", async () => {
    const expectedError = new Error("Falha de escrita");
    const confirm = createVelorioConfirmer(
        createDependencies({ patchVelorio: async () => Promise.reject(expectedError) })
    );

    await assert.rejects(() => confirm({ id: "vel-1" }), expectedError);
});

test("confirmation remains compatible when the idempotency read is unavailable", async () => {
    const calls = [];
    const confirm = createVelorioConfirmer(
        createDependencies({
            getVelorioById: async () => Promise.reject(new Error("Leitura indisponível")),
            patchVelorio: async (id, payload) => calls.push([id, payload]),
        })
    );

    await confirm({ id: "vel-1" });

    assert.deepEqual(calls, [["vel-1", { status: "Concluído", confirmado: true }]]);
});

test("secondary synchronization errors return an explicit warning", async () => {
    const confirm = createExumacaoConfirmer(
        createDependencies({
            patchExumacao: async () => ({ id: "exu-1" }),
            patchSepultamento: async () => ({ id: "sep-1" }),
            adjustGraveCapacity: async () => Promise.reject(new Error("Indisponível")),
        })
    );

    const result = await confirm({ id: "exu-1", sepultamentoId: "sep-1" });

    assert.equal(result.warnings.length, 1);
    assert.match(result.warnings[0], /capacidade da sepultura/);
});

test("repeated sepultamento confirmation is idempotent", async () => {
    const calls = [];
    const confirm = createSepultamentoConfirmer(
        createDependencies({
            getSepultamentoById: async () => ({ id: "sep-1", status: "Concluído", confirmado: true }),
            patchSepultamento: async (...args) => calls.push(["sepultamento", ...args]),
            adjustGraveCapacity: async (...args) => calls.push(["capacity", ...args]),
        })
    );

    const result = await confirm({ id: "sep-1" });

    assert.deepEqual(calls, []);
    assert.deepEqual(result, { warnings: [], createdProcess: null, graveChange: null });
});

test("repeated exumacao confirmation does not restore grave capacity twice", async () => {
    const calls = [];
    const confirm = createExumacaoConfirmer(
        createDependencies({
            getExumacaoById: async () => ({ id: "exu-1", status: "Concluído", confirmado: true }),
            patchExumacao: async (...args) => calls.push(["exumacao", ...args]),
            patchSepultamento: async (...args) => calls.push(["sepultamento", ...args]),
            adjustGraveCapacity: async (...args) => calls.push(["capacity", ...args]),
        })
    );

    await confirm({ id: "exu-1", sepultamentoId: "sep-1" });

    assert.deepEqual(calls, []);
});

test("operational dispatcher keeps compatibility with typed dashboard processes", async () => {
    const calls = [];
    const confirm = createOperationalProcessConfirmer(
        createDependencies({
            patchVelorio: async (id, payload) => calls.push([id, payload]),
        })
    );

    const result = await confirm({ id: "vel-1", _type: "Velório" });

    assert.deepEqual(calls, [["vel-1", { status: "Concluído", confirmado: true }]]);
    assert.deepEqual(result, { warnings: [], createdProcess: null, graveChange: null });
});

test("operational dispatcher rejects unsupported process types before mutation", async () => {
    const confirm = createOperationalProcessConfirmer(createDependencies());

    await assert.rejects(() => confirm({ id: "unknown-1", _type: "Manutenção" }), /Tipo de processo não suportado/);
});
