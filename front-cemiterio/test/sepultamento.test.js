import test from "node:test";
import assert from "node:assert/strict";
import { isSepultamentoVigente } from "../src/utils/sepultamento.js";

test("isSepultamentoVigente accepts confirmed or concluded burials", () => {
    assert.equal(isSepultamentoVigente({ confirmado: true }), true);
    assert.equal(isSepultamentoVigente({ confirmado: "true" }), true);
    assert.equal(isSepultamentoVigente({ status: "Concluído" }), true);
});

test("isSepultamentoVigente rejects pending and exhumed burials", () => {
    assert.equal(isSepultamentoVigente({ confirmado: false, status: "Pendente" }), false);
    assert.equal(isSepultamentoVigente({ confirmado: true, foi_exumado: true }), false);
    assert.equal(isSepultamentoVigente({ status: "Concluído", foi_exumado: "true" }), false);
    assert.equal(isSepultamentoVigente(null), false);
});
