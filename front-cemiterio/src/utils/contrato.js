const normalizeValue = (value) => {
    if (value === undefined || value === null) return "";
    return String(value).trim();
};

const normalizeLower = (value) => normalizeValue(value).toLowerCase();

const POSITIVE_VALUES = new Set(["sim", "s", "true", "1", "particular", "proprio", "propria"]);

export const getContratoId = (contrato = {}) =>
    normalizeValue(
        contrato?.id ?? contrato?._id ?? contrato?.contrato_id ?? contrato?.contractId ?? contrato?.numero_titulo ?? ""
    );

export const getContratoNumeroTitulo = (contrato = {}) =>
    normalizeValue(
        contrato?.numero_titulo ??
            contrato?.numeroTitulo ??
            contrato?.numero_titulo_posse ??
            contrato?.titulo ??
            contrato?.numero ??
            ""
    );

export const getContratoTitularNome = (contrato = {}) =>
    normalizeValue(
        contrato?.nome_titular ?? contrato?.titular ?? contrato?.responsavel ?? contrato?.nome_responsavel ?? ""
    );

export const getContratoTitularCpf = (contrato = {}) =>
    normalizeValue(contrato?.cpf_titular ?? contrato?.cpf ?? contrato?.documento_titular ?? "");

export const getContratoContato = (contrato = {}) =>
    normalizeValue(
        contrato?.contato_responsavel ?? contrato?.telefone ?? contrato?.tel_resp ?? contrato?.contato ?? ""
    );

export const getContratoQuadraRef = (contrato = {}) =>
    normalizeValue(contrato?.quadra ?? contrato?.blockId ?? contrato?.quadra_sep ?? contrato?.block ?? "");

export const getContratoSepulturaRef = (contrato = {}) =>
    normalizeValue(contrato?.sepultura ?? contrato?.num_sepultura_sep ?? contrato?.num_sepultura ?? "");

export const getContratoCemiterioName = (contrato = {}) =>
    normalizeValue(contrato?.cemiterio ?? contrato?.cemiterio_nome ?? contrato?.nome_cemiterio ?? "");

export const getContratoVigenciaInicio = (contrato = {}) =>
    normalizeValue(contrato?.vigencia_inicio ?? contrato?.validade_titulo_inicio ?? contrato?.data_inicio ?? "");

export const getContratoVigenciaFim = (contrato = {}) =>
    normalizeValue(
        contrato?.vigencia_fim ?? contrato?.validade_titulo_fim ?? contrato?.validade_titulo ?? contrato?.data_fim ?? ""
    );

export const normalizeContratoStatus = (status) => {
    const normalized = normalizeLower(status);
    const aliases = {
        active: "ativo",
        inactive: "inativo",
        expired: "vencido",
    };

    return aliases[normalized] || normalized;
};

export const isTituloPosseSim = (value) => POSITIVE_VALUES.has(normalizeLower(value));

export const hasTituloPosse = (record = {}) =>
    isTituloPosseSim(record?.titulo_posse) ||
    isTituloPosseSim(record?.posse) ||
    isTituloPosseSim(record?.particular) ||
    Boolean(record?.contrato_id || record?.contractId || record?.contrato || getContratoNumeroTitulo(record));

export const normalizeContrato = (contrato = {}) => {
    const source = contrato || {};

    return {
        ...source,
        id: getContratoId(source),
        nome_titular: getContratoTitularNome(source),
        cpf_titular: getContratoTitularCpf(source),
        contato_responsavel: getContratoContato(source),
        numero_titulo: getContratoNumeroTitulo(source),
        status: normalizeContratoStatus(source?.status) || "ativo",
        vigencia_inicio: getContratoVigenciaInicio(source),
        vigencia_fim: getContratoVigenciaFim(source),
        sepultura: getContratoSepulturaRef(source),
        quadra: getContratoQuadraRef(source),
        valor: Number(source?.valor ?? source?.valor_anual ?? 0),
        cemiterio: getContratoCemiterioName(source),
    };
};

export const findContratoByReference = (value, contratos = []) => {
    const raw = normalizeValue(value);
    if (!raw) return null;

    return (
        (Array.isArray(contratos) ? contratos : []).find((contrato) =>
            [getContratoId(contrato), getContratoNumeroTitulo(contrato)]
                .filter(Boolean)
                .some((candidate) => normalizeValue(candidate) === raw)
        ) || null
    );
};
