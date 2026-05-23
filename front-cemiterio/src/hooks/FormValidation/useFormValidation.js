import { useCallback, useState } from "react";
import {
  getFieldError,
  hasErrors,
  isEmpty,
  isValidDateRange,
  RULES_FALECIDO,
  RULES_RESPONSAVEL,
  RULES_SEPULTAMENTO,
  RULES_VELORIO,
  validateForm,
} from "../../utils/validation";
import { ALLOWED_FAL_INDI, PROCESS_TYPES, VELORIO_FIELDS } from "../../pages/Cadastros/constants";

export default function useFormValidation(form, processType, isIndigente, searchFal) {
  const [fieldErrors, setFieldErrors] = useState({});

  const hasAnyMeaningfulValue = useCallback((obj, ignore = []) => {
    const ignored = new Set(ignore);
    return Object.entries(obj).some(([key, value]) => {
      if (ignored.has(key)) return false;
      if (typeof value === "boolean") return value === true;
      if (value instanceof File) return true;
      return !isEmpty(value);
    });
  }, []);

  const validateFieldOnChange = useCallback((fieldName, value) => {
    if (processType === PROCESS_TYPES.falecido && isIndigente && !ALLOWED_FAL_INDI.has(fieldName)) {
      setFieldErrors((prev) => {
        if (!prev[fieldName]) return prev;
        const next = { ...prev };
        delete next[fieldName];
        return next;
      });
      return;
    }

    let rule = processType === PROCESS_TYPES.falecido ? RULES_FALECIDO[fieldName] : RULES_SEPULTAMENTO[fieldName];
    if (!rule && ["nome_resp", "tel_resp", "doc_resp", "prof_resp"].includes(fieldName)) {
      rule = RULES_RESPONSAVEL[fieldName];
    }
    if (!rule && form?.com_velorio && VELORIO_FIELDS.includes(fieldName)) {
      rule = RULES_VELORIO[fieldName];
    }

    const error = getFieldError(fieldName, value, rule || {});
    setFieldErrors((prev) => {
      const next = { ...prev };
      if (error) next[fieldName] = error;
      else delete next[fieldName];
      return next;
    });
  }, [form?.com_velorio, isIndigente, processType]);

  const validateBeforeSubmit = useCallback(() => {
    const ignoreForEmptyCheck = ["taxa_valor", "foi_exumado", "residencia_preview", "dec_obito_preview", "falecido", "falecido_id"];
    const hasAnyFormValue = hasAnyMeaningfulValue(form, ignoreForEmptyCheck);
    const hasSearchValue = processType === PROCESS_TYPES.sepultamento && !isEmpty(searchFal);

    if (!hasAnyFormValue && !hasSearchValue) {
      setFieldErrors({ _form: "Preencha ao menos um campo antes de salvar." });
      return false;
    }

    let rules = {};
    let extraErrors = {};

    if (processType === PROCESS_TYPES.falecido) {
      if (isIndigente) {
        ALLOWED_FAL_INDI.forEach((key) => {
          if (RULES_FALECIDO[key]) rules[key] = RULES_FALECIDO[key];
        });
      } else {
        rules = { ...RULES_FALECIDO, ...RULES_RESPONSAVEL };
        delete rules.certidao_obito;
      }

      if (!isEmpty(form.data_nasc) && !isEmpty(form.dh_falec) && !isValidDateRange(form.data_nasc, form.dh_falec)) {
        extraErrors.dh_falec = "Data de falecimento nao pode ser anterior a data de nascimento";
      }
    }

    if (processType === PROCESS_TYPES.sepultamento) {
      rules = { ...RULES_SEPULTAMENTO };
      if (isEmpty(searchFal) && isEmpty(form.nome_sep)) {
        extraErrors.nome_fal = "Informe o nome do falecido.";
      }

      if (form?.com_velorio) {
        rules = { ...rules, ...RULES_VELORIO };
        if (!isEmpty(form.dh_inicio_velorio) && !isEmpty(form.dh_fim_velorio) && !isValidDateRange(form.dh_inicio_velorio, form.dh_fim_velorio)) {
          extraErrors.dh_fim_velorio = "Data de fim do velório nao pode ser anterior ao início";
        }
      }
    }

    const errors = { ...validateForm(form, rules), ...extraErrors };
    setFieldErrors(errors);
    return !hasErrors(errors);
  }, [form, processType, isIndigente, searchFal, hasAnyMeaningfulValue]);

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors((prev) => {
      if (!prev[fieldName]) return prev;
      const next = { ...prev };
      delete next[fieldName];
      return next;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const clearErrorsExcept = useCallback((fieldsToKeep) => {
    setFieldErrors((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        if (!fieldsToKeep.has(key)) delete next[key];
      });
      return next;
    });
  }, []);

  return {
    fieldErrors,
    setFieldErrors,
    validateFieldOnChange,
    validateBeforeSubmit,
    clearFieldError,
    clearAllErrors,
    clearErrorsExcept,
  };
}
