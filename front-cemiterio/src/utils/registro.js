import { resolveCemiterioName } from "./cemiterio.js";
import { findQuadraByReference, getQuadraCemiterioRef, resolveQuadraDisplay } from "./quadra.js";
import { getSepulturaNumber, getSepulturaQuadraRef } from "./sepultura.js";

const getSepultamentoCemiterioRef = (sepultamento = {}) =>
    sepultamento?.cemiterio ??
    sepultamento?.cemiterio_nome ??
    sepultamento?.cemeteryId ??
    sepultamento?.cemetery_id ??
    sepultamento?.cemetery ??
    "";

export const resolveRegistroLocation = (sepultamento = {}, quadras = [], cemiterios = []) => {
    const quadraRef = getSepulturaQuadraRef(sepultamento);
    const quadra = findQuadraByReference(quadraRef, quadras);
    const cemiterioRef = getSepultamentoCemiterioRef(sepultamento) || getQuadraCemiterioRef(quadra || {});

    return {
        cemiterio: resolveCemiterioName(cemiterioRef, cemiterios, ""),
        quadra: resolveQuadraDisplay(quadraRef, quadras, ""),
        sepultura: getSepulturaNumber(sepultamento),
    };
};

export const buildRegistroFalecidoUpdatePayload = (form = {}) => ({
    nome_fal: form.nome_fal,
    idade: form.idade,
    sexo: form.sexo,
    cpf: form.cpf,
    data_nasc: form.data_nasc,
    dh_falec: form.data_obito,
    filiacao_pai: form.filiacao_pai,
    filiacao_mae: form.filiacao_mae,
    profissao: form.profissao,
    estado_civil: form.estado_civil,
    naturalidade: form.naturalidade,
    causa_mortis: form.causa_mortis,
    nome_resp: form.nome_resp,
    tel_resp: form.tel_resp,
    endereco_resp: form.endereco_resp,
    doc_resp: form.doc_resp,
});
