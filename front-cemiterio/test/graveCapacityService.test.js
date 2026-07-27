import test from "node:test";
import assert from "node:assert/strict";
import { createGraveCapacityAdjuster, createGraveCapacityExhaustionMarker } from "../src/services/graveCapacityCore.js";

const createDependencies = (overrides = {}) => ({
    getGraves: async () => [],
    getSepultamentoById: async () => null,
    getSepultamentos: async () => [],
    patchGrave: async () => ({}),
    ...overrides,
});

test("capacity adjustment decrements remaining vacancies and preserves occupied status", async () => {
    const calls = [];
    const adjust = createGraveCapacityAdjuster(
        createDependencies({
            getSepultamentoById: async () => ({ id: "sep-1", quadra_sep: "q-1", num_sepultura_sep: 2 }),
            getGraves: async (params) =>
                params ? [{ id: "grave-1", blockId: "q-1", number: 2, bodyCapacity: 2 }] : [],
            getSepultamentos: async () => [{ id: "sep-1", quadra_sep: "q-1", num_sepultura_sep: 2, confirmado: true }],
            patchGrave: async (id, payload) => calls.push([id, payload]),
        })
    );

    const result = await adjust("sep-1", -1);

    assert.deepEqual(calls, [["grave-1", { bodyCapacity: 1, status: "OCCUPIED" }]]);
    assert.deepEqual(result, { covaId: "grave-1", capacidade: 1 });
});

test("capacity restoration marks grave available after its last active burial is exhumed", async () => {
    const calls = [];
    const adjust = createGraveCapacityAdjuster(
        createDependencies({
            getSepultamentoById: async () => ({
                id: "sep-1",
                quadra_sep: "q-1",
                num_sepultura_sep: 2,
                foi_exumado: true,
            }),
            getGraves: async () => [{ id: "grave-1", blockId: "q-1", number: 2, bodyCapacity: 0 }],
            getSepultamentos: async () => [
                {
                    id: "sep-1",
                    quadra_sep: "q-1",
                    num_sepultura_sep: 2,
                    confirmado: true,
                    foi_exumado: true,
                },
            ],
            patchGrave: async (id, payload) => calls.push([id, payload]),
        })
    );

    await adjust("sep-1", 1);

    assert.deepEqual(calls, [["grave-1", { bodyCapacity: 1, status: "AVAILABLE" }]]);
});

test("capacity adjustment never persists a negative remaining capacity", async () => {
    const calls = [];
    const adjust = createGraveCapacityAdjuster(
        createDependencies({
            getSepultamentoById: async () => ({ id: "sep-1", quadra_sep: "q-1", num_sepultura_sep: 2 }),
            getGraves: async () => [{ id: "grave-1", blockId: "q-1", number: 2, bodyCapacity: 0 }],
            getSepultamentos: async () => [{ id: "sep-1", quadra_sep: "q-1", num_sepultura_sep: 2, confirmado: true }],
            patchGrave: async (id, payload) => calls.push([id, payload]),
        })
    );

    await adjust("sep-1", -1);

    assert.deepEqual(calls, [["grave-1", { bodyCapacity: 0, status: "OCCUPIED" }]]);
});

test("capacity exhaustion marker normalizes legacy graves without vacancies", async () => {
    const calls = [];
    const markExhausted = createGraveCapacityExhaustionMarker({
        patchGrave: async (id, payload) => calls.push([id, payload]),
    });

    const result = await markExhausted("grave-1");

    assert.deepEqual(calls, [["grave-1", { status: "OCCUPIED", bodyCapacity: 0 }]]);
    assert.deepEqual(result, { covaId: "grave-1", capacidade: 0 });
});
