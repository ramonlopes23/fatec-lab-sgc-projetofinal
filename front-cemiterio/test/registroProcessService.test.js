import test from "node:test";
import assert from "node:assert/strict";
import { createRegistroArchiver, getRegistroArchiveErrorMessage } from "../src/services/registroProcessCore.js";

test("arquivarRegistroFalecido prioritizes the linked sepultamento", async () => {
    const calls = [];
    const arquivarRegistroFalecido = createRegistroArchiver({
        archiveFalecido: async (id) => calls.push(["falecido", id]),
        archiveSepultamento: async (id) => calls.push(["sepultamento", id]),
    });

    const result = await arquivarRegistroFalecido({
        id: "fal-1",
        sepultamento: { id: "sep-1" },
    });

    assert.deepEqual(calls, [["sepultamento", "sep-1"]]);
    assert.deepEqual(result, { entityType: "sepultamento", entityId: "sep-1" });
});

test("arquivarRegistroFalecido archives the deceased when no burial is linked", async () => {
    const calls = [];
    const arquivarRegistroFalecido = createRegistroArchiver({
        archiveFalecido: async (id) => calls.push(["falecido", id]),
        archiveSepultamento: async (id) => calls.push(["sepultamento", id]),
    });

    const result = await arquivarRegistroFalecido({ id: "fal-1" });

    assert.deepEqual(calls, [["falecido", "fal-1"]]);
    assert.deepEqual(result, { entityType: "falecido", entityId: "fal-1" });
});

test("arquivarRegistroFalecido rejects records without an opaque identifier", async () => {
    let calls = 0;
    const arquivarRegistroFalecido = createRegistroArchiver({
        archiveFalecido: async () => {
            calls += 1;
        },
        archiveSepultamento: async () => {
            calls += 1;
        },
    });

    await assert.rejects(
        () => arquivarRegistroFalecido({}),
        (error) => error.code === "INVALID_RECORD"
    );
    assert.equal(calls, 0);
});

test("arquivarRegistroFalecido propagates API failures without reporting success", async () => {
    const backendError = Object.assign(new Error("Conflito"), { response: { status: 409 } });
    const arquivarRegistroFalecido = createRegistroArchiver({
        archiveFalecido: async () => Promise.reject(backendError),
        archiveSepultamento: async () => ({}),
    });

    await assert.rejects(() => arquivarRegistroFalecido({ id: "fal-1" }), backendError);
    assert.match(getRegistroArchiveErrorMessage(backendError), /outra operação/);
});
