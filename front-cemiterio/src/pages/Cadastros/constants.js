export const PROCESS_TYPES = {
    falecido: "Cadastro de falecido",
    sepultamento: "Cadastro de sepultamento",
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
    titulo_posse: "",
    quadra_sep: "",
    num_sepultura_sep: "",
    coveiro_sep: "",
    obs_sep: "",
    taxa: "",
    taxa_valor: 0,
    foi_exumado: false,
    falecido_id: "",
    falecido: "",
};

export const TAXA_MAP = {
    crianca: 56.12,
    crianca_fora: 224.54,
    adulto_terra: 112.27,
    adulto_fora: 430.42,
    adulto_laje: 280.71,
    indigente: 0,
};

export const TAXA_LABEL = {
    crianca: "CRIANCA - R$56,12",
    crianca_fora: "CRIANCA (FORA DO MUNICIPIO) - R$224,54",
    adulto_terra: "ADULTO (TERRA) - R$112,27",
    adulto_fora: "ADULTO (FORA DO MUNICIPIO) - R$430,42",
    adulto_laje: "ADULTO LAJE - R$280,71",
    indigente: "ISENCAO POR INDIGENCIA",
};

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
