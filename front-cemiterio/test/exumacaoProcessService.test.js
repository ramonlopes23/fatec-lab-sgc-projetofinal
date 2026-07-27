import test from "node:test";
import assert from "node:assert/strict";
import {
    createExumacaoCanceller,
    createExumacaoRequester,
    getExumacaoCancelErrorMessage,
    getExumacaoRequestErrorMessage,
    getExumacaoSepultamentoId,
    isExumacaoPending,
} from "../src/services/exumacaoProcessCore.js";

const validForm = {
    sepultamentoId: "sep-1",
    motivo: " transferência ",
    destino: " ossário ",
    coveiro: " operador ",
    obs_exu: " ",
};

test("solicitarExumacao trims fields and forces a pending unconfirmed process", async () => {
    let receivedPayload;
    const solicitarExumacao = createExumacaoRequester({
        createExumacao: async (payload) => {
            receivedPayload = payload;
            return { id: "exu-1", ...payload };
        },
    });

    const created = await solicitarExumacao({ form: validForm });

    assert.equal(created.id, "exu-1");
    assert.deepEqual(receivedPayload, {
        ...validForm,
        motivo: "transferência",
        destino: "ossário",
        coveiro: "operador",
        obs_exu: "",
        status: "pendente",
        confirmado: false,
    });
});

test("solicitarExumacao blocks whitespace-only required fields before the API call", async () => {
    let calls = 0;
    const solicitarExumacao = createExumacaoRequester({
        createExumacao: async () => {
            calls += 1;
            return {};
        },
    });

    await assert.rejects(
        () =>
            solicitarExumacao({
                form: { ...validForm, motivo: " ", destino: "\t", coveiro: "\n" },
            }),
        (error) => {
            assert.equal(error.code, "VALIDATION_ERROR");
            assert.deepEqual(Object.keys(error.fieldErrors).sort(), ["coveiro", "destino", "motivo"]);
            return true;
        }
    );
    assert.equal(calls, 0);
});

test("solicitarExumacao blocks a duplicate pending process before the API call", async () => {
    let calls = 0;
    const solicitarExumacao = createExumacaoRequester({
        createExumacao: async () => {
            calls += 1;
            return {};
        },
    });

    await assert.rejects(
        () => solicitarExumacao({ form: validForm, pendingExumacao: { id: "exu-existing" } }),
        (error) => error.code === "DUPLICATE_PENDING"
    );
    assert.equal(calls, 0);
});

test("solicitarExumacao rejects an invalid API response without confirming locally", async () => {
    const solicitarExumacao = createExumacaoRequester({
        createExumacao: async () => null,
    });

    await assert.rejects(
        () => solicitarExumacao({ form: validForm }),
        (error) => error.code === "INVALID_RESPONSE"
    );
});

test("solicitarExumacao preserves backend errors for UI mapping", async () => {
    const backendError = Object.assign(new Error("Conflito"), { response: { status: 409 } });
    const solicitarExumacao = createExumacaoRequester({
        createExumacao: async () => Promise.reject(backendError),
    });

    await assert.rejects(() => solicitarExumacao({ form: validForm }), backendError);
    assert.equal(getExumacaoRequestErrorMessage(backendError), "Já existe uma exumação pendente para este registro.");
});

test("exumacao error mapping preserves the documented HTTP contracts", () => {
    const withStatus = (status) => Object.assign(new Error("Falha"), { response: { status } });

    assert.match(getExumacaoRequestErrorMessage(withStatus(400)), /Revise os dados/);
    assert.match(getExumacaoRequestErrorMessage(withStatus(403)), /permissão/);
    assert.match(getExumacaoRequestErrorMessage(withStatus(404)), /não encontrado/);
    assert.match(getExumacaoRequestErrorMessage(withStatus(500)), /indisponível/);
    assert.match(getExumacaoCancelErrorMessage(withStatus(400)), /estado atual/);
    assert.match(getExumacaoCancelErrorMessage(withStatus(403)), /permissão/);
    assert.match(getExumacaoCancelErrorMessage(withStatus(404)), /não foi encontrada/);
    assert.match(getExumacaoCancelErrorMessage(withStatus(409)), /outra operação/);
    assert.match(getExumacaoCancelErrorMessage(withStatus(500)), /indisponível/);
});

test("getExumacaoSepultamentoId accepts canonical and legacy references", () => {
    assert.equal(getExumacaoSepultamentoId({ sepultamentoId: "sep-1" }), "sep-1");
    assert.equal(getExumacaoSepultamentoId({ sepultamento_id: "sep-2" }), "sep-2");
    assert.equal(getExumacaoSepultamentoId({ sepultamento: { id: "sep-3" } }), "sep-3");
});

test("isExumacaoPending normalizes current and legacy confirmation states", () => {
    assert.equal(isExumacaoPending({ status: "pendente", confirmado: true }), true);
    assert.equal(isExumacaoPending({ confirmado: false }), true);
    assert.equal(isExumacaoPending({ confirmado: null }), true);
    assert.equal(isExumacaoPending({ status: "Concluído", confirmado: null }), false);
});

test("cancelarExumacao deletes only a pending process and returns its relationship", async () => {
    const calls = [];
    const cancelarExumacao = createExumacaoCanceller({
        deleteExumacao: async (id) => calls.push(id),
    });

    const result = await cancelarExumacao({
        sepultamento: { id: "sep-1" },
        exumacao: { id: "exu-1", status: "pendente" },
    });

    assert.deepEqual(calls, ["exu-1"]);
    assert.equal(result.sepultamentoId, "sep-1");
    assert.equal(result.exumacao.id, "exu-1");
});

test("cancelarExumacao propagates deletion failures without returning local success", async () => {
    const backendError = Object.assign(new Error("Indisponível"), { response: { status: 500 } });
    const cancelarExumacao = createExumacaoCanceller({
        deleteExumacao: async () => Promise.reject(backendError),
    });

    await assert.rejects(
        () =>
            cancelarExumacao({
                sepultamento: { id: "sep-1" },
                exumacao: { id: "exu-1", status: "pendente" },
            }),
        backendError
    );
});

test("cancelarExumacao blocks completed processes before deletion", async () => {
    let calls = 0;
    const cancelarExumacao = createExumacaoCanceller({
        deleteExumacao: async () => {
            calls += 1;
        },
    });

    await assert.rejects(
        () =>
            cancelarExumacao({
                sepultamento: { id: "sep-1" },
                exumacao: { id: "exu-1", status: "Concluído", confirmado: true },
            }),
        (error) => error.code === "EXUMACAO_NOT_PENDING"
    );
    assert.equal(calls, 0);
});
