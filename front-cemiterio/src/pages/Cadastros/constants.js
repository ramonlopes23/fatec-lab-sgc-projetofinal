export const PROCESS_TYPES = {
    falecido: "falecido",
    sepultamento: "sepultamento",
};

export const PROCESS_TYPE_LABELS = {
    [PROCESS_TYPES.falecido]: "Cadastro de Falecido",
    [PROCESS_TYPES.sepultamento]: "Cadastro de Sepultamento",
};

export const PROCESS_TYPE_SUBTITLES = {
    [PROCESS_TYPES.falecido]: "Faça o cadastro dos falecidos antes de realizar processos de sepultamento.",
    [PROCESS_TYPES.sepultamento]: "Faça o cadastro do sepultamento para finalizar o processo.",
};

export const normalizeProcessType = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === PROCESS_TYPES.sepultamento || raw === "cadastro de sepultamento") return PROCESS_TYPES.sepultamento;
    return PROCESS_TYPES.falecido;
};

export const INITIAL_FALECIDO_FORM = {
    nome_fal: "",
    idade: "",
    data_nasc: "",
    dh_falec: "",
    filiacao_pai: "",
    filiacao_mae: "",
    sexo: "",
    cor: "",
    cpf: "",
    rg: "",
    profissao: "",
    estado_civil: "",
    naturalidade: "",
    causa_mortis: "",
    nome_doutor: "",
    certidao_obito: "",
    obs_fal: "",
    residencia: "",
    residencia_preview: "",
    dec_obito: "",
    dec_obito_preview: "",
    nome_resp: "",
    parentesco: "",
    doc_resp: "",
    prof_resp: "",
    tel_resp: "",
    cep_resp: "",
    endereco_resp: "",
};

export const INITIAL_SEPULTAMENTO_FORM = {
    nome_sep: "",
    data_obito_sep: "",
    dh_sep: "",
    com_velorio: false,
    dh_inicio_velorio: "",
    dh_fim_velorio: "",
    local_velorio: "",
    tipo_velorio: "",
    responsavel_velorio: "",
    obs_velorio: "",
    titulo_posse: "",
    contrato_id: "",
    numero_titulo: "",
    nome_titular: "",
    quadra_sep: "",
    num_sepultura_sep: "",
    coveiro_sep: "",
    obs_sep: "",
    taxa: "",
    taxa_id: "",
    taxa_valor: 0,
    foi_exumado: false,
    falecido_id: "",
    falecido: "",
};

export const VELORIO_FIELDS = [
    "dh_inicio_velorio",
    "dh_fim_velorio",
    "local_velorio",
    "tipo_velorio",
    "responsavel_velorio",
    "obs_velorio",
];

export const DEFAULT_TAXAS = [
    { id: "taxa-crianca", codigo: "crianca", descricao: "CRIANÇA", valor: 56.12, tipo: "sepultamento", active: true, isencao: false, vigencia_inicio: "", vigencia_fim: "" },
    { id: "taxa-crianca-fora", codigo: "crianca_fora", descricao: "CRIANÇA (FORA DO MUNICIPIO)", valor: 224.54, tipo: "sepultamento", active: true, isencao: false, vigencia_inicio: "", vigencia_fim: "" },
    { id: "taxa-adulto-terra", codigo: "adulto_terra", descricao: "ADULTO (TERRA)", valor: 112.27, tipo: "sepultamento", active: true, isencao: false, vigencia_inicio: "", vigencia_fim: "" },
    { id: "taxa-adulto-fora", codigo: "adulto_fora", descricao: "ADULTO (FORA DO MUNICIPIO)", valor: 430.42, tipo: "sepultamento", active: true, isencao: false, vigencia_inicio: "", vigencia_fim: "" },
    { id: "taxa-adulto-laje", codigo: "adulto_laje", descricao: "ADULTO LAJE", valor: 280.71, tipo: "sepultamento", active: true, isencao: false, vigencia_inicio: "", vigencia_fim: "" },
    { id: "taxa-indigente", codigo: "indigente", descricao: "ISENÇÃO POR INDIGÊNCIA", valor: 0, tipo: "sepultamento", active: true, isencao: true, vigencia_inicio: "", vigencia_fim: "" },
];

export const NAME_CASE_FIELDS = new Set([
    "nome_fal",
    "filiacao_pai",
    "filiacao_mae",
    "nome_doutor",
    "nome_resp",
]);

export const ALLOWED_FAL_INDI = new Set([
    "nome_fal",
    "sexo",
    "cor",
    "dh_falec",
    "causa_mortis",
    "obs_fal",
]);

export const STEPS_DECEASED = [
    "Dados do Falecido",
    "Documentação",
    "Responsável",
    "Revisão",
];

export const STORAGE_KEY = "cadastro_form_state";
