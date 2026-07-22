const normalizeValue = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

export const getFalecidoId = (falecido = {}) =>
    normalizeValue(
        falecido?.id ??
            falecido?._id ??
            falecido?.falecido_id ??
            falecido?.falecidoId ??
            falecido?.falecido?.id ??
            falecido?.falecido?._id ??
            (typeof falecido?.falecido === "object" ? "" : falecido?.falecido) ??
            ""
    );

export const getFalecidoIdFromRecord = (record = {}) =>
    normalizeValue(
        record?.falecidoId ??
            record?.falecido_id ??
            record?.falecido?.id ??
            record?.falecido?._id ??
            (typeof record?.falecido === "object" ? "" : record?.falecido) ??
            ""
    );

export const getFalecidoName = (falecido = {}) =>
    normalizeValue(
        falecido?.nome_fal ??
            falecido?.nome ??
            falecido?.nome_sep ??
            falecido?.falecido_nome ??
            falecido?.nome_falecido ??
            falecido?.falecido?.nome_fal ??
            falecido?.falecido?.nome ??
            ""
    );

export const getFalecidoCpf = (falecido = {}) =>
    normalizeValue(
        falecido?.cpf ??
            falecido?.cpf_fal ??
            falecido?.cpf_falecido ??
            falecido?.documento ??
            falecido?.doc_falecido ??
            ""
    );

export const getFalecidoMotherName = (falecido = {}) =>
    normalizeValue(falecido?.filiacao_mae ?? falecido?.mae ?? falecido?.nome_mae ?? "");

export const getFalecidoDeathDate = (falecido = {}) =>
    normalizeValue(
        falecido?.dh_falec ??
            falecido?.data_obito ??
            falecido?.data_obito_fal ??
            falecido?.data_obito_sep ??
            falecido?.sepultamento?.data_obito_sep ??
            ""
    );

export const getFalecidoBirthDate = (falecido = {}) =>
    normalizeValue(falecido?.data_nasc ?? falecido?.data_nascimento ?? falecido?.dt_nascimento ?? "");

export const getFalecidoNaturalidade = (falecido = {}) =>
    normalizeValue(falecido?.naturalidade ?? falecido?.cidade_naturalidade ?? "");

export const getFalecidoResponsibleName = (falecido = {}) =>
    normalizeValue(falecido?.nome_resp ?? falecido?.responsavel ?? falecido?.falecido?.nome_resp ?? "");

export const getFalecidoResponsiblePhone = (falecido = {}) =>
    normalizeValue(falecido?.tel_resp ?? falecido?.telefone_resp ?? falecido?.falecido?.tel_resp ?? "");

export const normalizeFalecido = (falecido = {}) => {
    const source = falecido || {};

    return {
        ...source,
        id: getFalecidoId(source),
        nome_fal: getFalecidoName(source),
        cpf: getFalecidoCpf(source),
        filiacao_mae: getFalecidoMotherName(source),
        dh_falec: source?.dh_falec ?? getFalecidoDeathDate(source),
        data_nasc: source?.data_nasc ?? getFalecidoBirthDate(source),
        naturalidade: getFalecidoNaturalidade(source),
        nome_resp: source?.nome_resp ?? getFalecidoResponsibleName(source),
        tel_resp: source?.tel_resp ?? getFalecidoResponsiblePhone(source),
    };
};

export const findFalecidoByReference = (value, falecidos = []) => {
    const raw = normalizeValue(value);
    if (!raw) return null;

    return (
        (Array.isArray(falecidos) ? falecidos : []).find((falecido) =>
            [getFalecidoId(falecido), getFalecidoName(falecido), getFalecidoCpf(falecido)]
                .filter(Boolean)
                .some((candidate) => normalizeValue(candidate) === raw)
        ) || null
    );
};
