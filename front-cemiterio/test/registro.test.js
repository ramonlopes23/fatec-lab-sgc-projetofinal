import test from "node:test";
import assert from "node:assert/strict";
import { buildRegistroFalecidoUpdatePayload, resolveRegistroLocation } from "../src/utils/registro.js";

test("resolveRegistroLocation follows sepultamento, quadra and cemetery references", () => {
    const location = resolveRegistroLocation(
        { quadra_sep: "block-1", num_sepultura_sep: "15" },
        [{ id: "block-1", number: 2, cemeteryId: "cemetery-1" }],
        [{ id: "cemetery-1", name: "Cemitério Municipal" }]
    );

    assert.deepEqual(location, {
        cemiterio: "Cemitério Municipal",
        quadra: "2",
        sepultura: "15",
    });
});

test("resolveRegistroLocation accepts nested and legacy relationship formats", () => {
    assert.deepEqual(
        resolveRegistroLocation(
            {
                quadra: { id: "block-legacy" },
                sepultura: { numero: 7 },
                cemetery: { name: "Cemitério Histórico" },
            },
            [{ id: "block-legacy", num_quadra: "4" }],
            []
        ),
        {
            cemiterio: "Cemitério Histórico",
            quadra: "4",
            sepultura: "7",
        }
    );
});

test("buildRegistroFalecidoUpdatePayload preserves naturalidade and omits nacionalidade", () => {
    const payload = buildRegistroFalecidoUpdatePayload({
        nome_fal: "Maria da Silva",
        naturalidade: "Ferraz de Vasconcelos - SP",
        nacionalidade: "Brasileira",
    });

    assert.equal(payload.naturalidade, "Ferraz de Vasconcelos - SP");
    assert.equal(Object.hasOwn(payload, "nacionalidade"), false);
});
