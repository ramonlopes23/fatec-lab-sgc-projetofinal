import { parseDateValue } from "./date";

export const isEmpty = (value) => {
    return value === undefined || value === null || (typeof value === "string" && value.trim() === "");
}

export const isValidCPF = (value) => {
    const cpf = String(value || "").replace(/\D/g, "");

    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpf[i]) * (10 - i)
    }
    let resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    if (resto !== parseInt(cpf[9])) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpf[i]) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10) resto = 0;
    return resto === parseInt(cpf[10]);
};

export const isValidDate = (value) => {
    if (!value) return false;
    return parseDateValue(value) !== null;
};

export const isValidDateRange = (dataNasc, dataFalec) => {
    if (isEmpty(dataNasc) || isEmpty(dataFalec)) return true;
    const start = parseDateValue(dataNasc);
    const end = parseDateValue(dataFalec);
    if (!start || !end) return false;
    return end.getTime() >= start.getTime();
};

export const isValidAge = (value) => {
    const age = parseInt(value, 10);
    return !isNaN(age) && age >= 0 && age <= 150;
};

export const isValidPhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    return digits.length >= 10;
};

export const getFieldError = (fieldName, value, rule = {}) => {
    if (rule.required && isEmpty(value)) {
        return `${rule.label || fieldName} é obrigatório`
    }

    if ((fieldName === "cpf" || fieldName === "doc_resp") && !isEmpty(value)) {
        if (!isValidCPF(value)) return "CPF inválido";
    }

    if ((fieldName === "data_nasc" || fieldName === "dh_falec" || fieldName === "dh_sep" || fieldName === "dh_inicio_velorio" || fieldName === "dh_fim_velorio") && !isEmpty(value)) {
        if (!isValidDate(value)) return "Data inválida";
    }

    if (fieldName === "idade" && !isEmpty(value)) {
        if (!isValidAge(value)) return "Idade deve estar entre 0 e 150 anos";
    }

    if (fieldName === "tel_resp" && !isEmpty(value)) {
        if (!isValidPhone(value)) return "Telefone inválido (mínimo 10 dígitos)";
    }

    return "";
};

export const validateForm = (form, rules) => {
    const errors = {};
    Object.entries(rules).forEach(([fieldName, rule]) => {
        const error = getFieldError(fieldName, form[fieldName], rule);
        if (error) errors[fieldName] = error;
    });
    return errors;
};

export const RULES_FALECIDO = {
    nome_fal: { required: true, label: "Nome do falecido" },
    idade: { required: true, label: "Idade do falecido" },
    sexo: { required: true, label: "Sexo do falecido" },
    cor: { required: true, label: "Cor do falecido" },
    estado_civil: { required: true, label: "Estado civil do falecido" },
    data_nasc: { required: true, label: "Data de nascimento do falecido" },
    dh_falec: { required: true, label: "Data de falecimento" },
    filiacao_pai: { required: true, label: "Filiação do pai do falecido" },
    filiacao_mae: { required: true, label: "Filiacao da mãe do falecido" },
    profissao: { required: true, label: "Profissao do falecido" },
    naturalidade: { required: true, label: "Naturalidade do falecido" },
    causa_mortis: { required: true, label: "Causa da morte do falecido" },
    cpf: { required: true, label: "CPF do falecido" },
    rg: { required: true, label: "RG do falecido" },
    nome_doutor: { required: true, label: "Nome do médico" },
};

export const RULES_SEPULTAMENTO = {
    data_obito_sep: { required: true, label: "Data do óbito" },
    dh_sep: { required: true, label: "Data do sepultamento" },
    titulo_posse: { required: true, label: "Título de posse" },
    quadra_sep: { required: true, label: "Quadra" },
    num_sepultura_sep: { required: true, label: "Nº da sepultura" },
    taxa: { required: true, label: "Tipo de taxa" },
    numero_titulo: { required: true, label: "Nº do título" },
    nome_titular: { required: true, label: "Nome do titular do contrato" },
};

export const RULES_VELORIO = {
    dh_inicio_velorio: { required: true, label: "Data e hora de início do velório" },
    dh_fim_velorio: { required: true, label: "Data e hora de fim do velório" },
    local_velorio: { required: true, label: "Local do velório" },
    tipo_velorio: { required: true, label: "Tipo do velório" },
    responsavel_velorio: { required: true, label: "Responsável pelo velório" },
};

export const RULES_RESPONSAVEL = {
    nome_resp: { required: true, label: "Nome do responsável" },
    tel_resp: { required: true, label: "Contato" },
    doc_resp: { required: true, label: "CPF do responsável" },
    cep_resp: { required: true, label: "CEP" },
    endereco_resp: { required: true, label: "Endereço" },
};

export const hasErrors = (errors) => {
    return Object.keys(errors).length > 0;
};