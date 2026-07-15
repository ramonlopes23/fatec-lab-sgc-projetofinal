import test from "node:test";
import assert from "node:assert/strict";
import {
    getInitialProcessForm,
    INITIAL_FALECIDO_FORM,
    INITIAL_SEPULTAMENTO_FORM,
    PROCESS_TYPES,
} from "../src/pages/Cadastros/constants.js";

test("getInitialProcessForm falls back when persisted state is absent or malformed", () => {
    assert.deepEqual(getInitialProcessForm(null, PROCESS_TYPES.falecido), INITIAL_FALECIDO_FORM);
    assert.deepEqual(
        getInitialProcessForm({ processType: PROCESS_TYPES.falecido }, PROCESS_TYPES.falecido),
        INITIAL_FALECIDO_FORM
    );
    assert.deepEqual(
        getInitialProcessForm({ processType: PROCESS_TYPES.falecido, form: [] }, PROCESS_TYPES.falecido),
        INITIAL_FALECIDO_FORM
    );
});

test("getInitialProcessForm ignores state saved for another process", () => {
    const result = getInitialProcessForm(
        { processType: PROCESS_TYPES.sepultamento, form: { nome_sep: "Registro anterior" } },
        PROCESS_TYPES.falecido
    );

    assert.deepEqual(result, INITIAL_FALECIDO_FORM);
    assert.equal("nome_sep" in result, false);
});

test("getInitialProcessForm merges partial persisted state with current defaults", () => {
    const result = getInitialProcessForm(
        {
            processType: PROCESS_TYPES.sepultamento,
            form: { nome_sep: "Maria da Silva", campo_legado: "preservado" },
        },
        PROCESS_TYPES.sepultamento
    );

    assert.equal(result.nome_sep, "Maria da Silva");
    assert.equal(result.campo_legado, "preservado");
    assert.equal(result.com_velorio, INITIAL_SEPULTAMENTO_FORM.com_velorio);
    assert.equal(result.taxa_valor, INITIAL_SEPULTAMENTO_FORM.taxa_valor);
});

test("getInitialProcessForm returns a new object instead of the shared default", () => {
    const result = getInitialProcessForm(null, PROCESS_TYPES.falecido);

    assert.notEqual(result, INITIAL_FALECIDO_FORM);
});
