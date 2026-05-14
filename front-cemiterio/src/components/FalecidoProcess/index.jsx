import React, { memo, useEffect, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Autocomplete from "@mui/material/Autocomplete";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LuChevronDown } from "react-icons/lu";
import { formatDateKey, formatDateTimeKey, formatDateDMY, formatDateTimeDMY, parseDateValue } from "../../utils/date";
import {
    getFieldError,
    hasErrors,
    isValidDateRange,
    RULES_FALECIDO,
    RULES_RESPONSAVEL,
} from "../../utils/validation";
import { BtnAction, BtnAction2, ChevronIcon, FilePreview, InlineFeedback, ReviewPanel, StepHeader } from "./styles";

function FalecidoProcess({
    form,
    fieldErrors,
    activeStep,
    stepsDeceased,
    handleChange,
    handleNextStep,
    handleBackStep,
    handleClearFalecido,
    updateFieldByName,
    handleFileChange,
    handleCepChange,
    handleCepBlur,
    disabledFor,
    resultados,
    busca,
    setBusca,
    validateFieldOnChange,
    isSubmitting,
    isIndigente,
    cepResp,
    loadingCep,
    fieldSxStyle,
    labelSxStyle,
    selectSxStyle,
}) {
    const [expandedSteps, setExpandedSteps] = useState({ 0: true, 1: false, 2: false, 3: false });

    const toggleStepExpanded = (stepIndex) => {
        setExpandedSteps((prev) => ({
            ...prev,
            [stepIndex]: !prev[stepIndex],
        }));
    };

    useEffect(() => {
        setExpandedSteps({
            0: activeStep === 0,
            1: activeStep === 1,
            2: activeStep === 2,
            3: activeStep === 3,
        });
    }, [activeStep]);

    const textFieldProps = (name) => ({
        value: form[name] || "",
        onChange: handleChange,
        error: !!fieldErrors[name],
        helperText: fieldErrors[name],
        disabled: disabledFor(name),
        sx: fieldSxStyle,
        slotProps: { inputLabel: { sx: labelSxStyle } },
    });

    const isFieldValid = (fieldName, rule) => !getFieldError(fieldName, form[fieldName], rule || {});

    const isStepComplete = (stepIndex) => {
        const step0DefaultFields = [
            "nome_fal",
            "idade",
            "sexo",
            "cor",
            "estado_civil",
            "data_nasc",
            "dh_falec",
            "filiacao_pai",
            "filiacao_mae",
            "profissao",
            "naturalidade",
            "causa_mortis",
        ];

        const step0IndigenteFields = ["nome_fal", "sexo", "cor", "dh_falec", "causa_mortis"];
        const step1Fields = ["cpf", "rg", "nome_doutor"];
        const step2Fields = ["nome_resp", "tel_resp", "doc_resp", "cep_resp", "endereco_resp"];

        if (stepIndex === 0) {
            const fields = isIndigente ? step0IndigenteFields : step0DefaultFields;
            const validFields = fields.every((field) => isFieldValid(field, RULES_FALECIDO[field]));
            const validRange = isIndigente ? true : isValidDateRange(form.data_nasc, form.dh_falec);
            return validFields && validRange;
        }

        if (stepIndex === 1) {
            if (isIndigente) return true;
            return step1Fields.every((field) => isFieldValid(field, RULES_FALECIDO[field]));
        }

        if (stepIndex === 2) {
            if (isIndigente) return true;
            return step2Fields.every((field) => isFieldValid(field, RULES_RESPONSAVEL[field]));
        }

        if (stepIndex === 3) {
            return isStepComplete(0) && isStepComplete(1) && isStepComplete(2);
        }

        return false;
    };

    return (
        <Stepper activeStep={activeStep} orientation="vertical">
            <Step expanded={expandedSteps[0]} completed={isStepComplete(0)}>
                <StepLabel onClick={() => toggleStepExpanded(0)} sx={{ cursor: "pointer" }}>
                    <StepHeader>
                        <span>{stepsDeceased[0]}</span>
                        <ChevronIcon isExpanded={expandedSteps[0]}>
                            <LuChevronDown size={20} />
                        </ChevronIcon>
                    </StepHeader>
                </StepLabel>
                <StepContent sx={{ display: expandedSteps[0] ? "block" : "none" }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <TextField fullWidth variant="outlined" label="Nome completo" name="nome_fal" placeholder="Digite o nome do falecido" {...textFieldProps("nome_fal")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 1 }}>
                            <TextField fullWidth variant="outlined" label="Idade" name="idade" {...textFieldProps("idade")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth error={!!fieldErrors.sexo}>
                                <InputLabel sx={labelSxStyle}>Sexo</InputLabel>
                                <Select label="Sexo" name="sexo" value={form.sexo} onChange={handleChange} disabled={disabledFor("sexo")} sx={selectSxStyle} slotProps={{ input: { notched: true } }}>
                                    <MenuItem value="">Selecione</MenuItem>
                                    <MenuItem value="masculino">Masculino</MenuItem>
                                    <MenuItem value="feminino">Feminino</MenuItem>
                                </Select>
                                {fieldErrors.sexo && <FormHelperText>{fieldErrors.sexo}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth error={!!fieldErrors.estado_civil}>
                                <InputLabel sx={labelSxStyle}>Estado civil</InputLabel>
                                <Select label="Estado civil" name="estado_civil" value={form.estado_civil} onChange={handleChange} disabled={disabledFor("estado_civil")} sx={selectSxStyle} slotProps={{ input: { notched: true } }}>
                                    <MenuItem value="">Selecione</MenuItem>
                                    <MenuItem value="Solteiro">Solteiro(a)</MenuItem>
                                    <MenuItem value="Casado">Casado(a)</MenuItem>
                                    <MenuItem value="Separado">Separado(a)</MenuItem>
                                    <MenuItem value="Divorciado">Divorciado(a)</MenuItem>
                                    <MenuItem value="Viuvo">Viuvo(a)</MenuItem>
                                </Select>
                                {fieldErrors.estado_civil && <FormHelperText>{fieldErrors.estado_civil}</FormHelperText>}
                            </FormControl>
                        </Grid>
                        <Grid size={{ xs: 12, md: 2 }}>
                            <FormControl fullWidth error={!!fieldErrors.cor}>
                                <InputLabel sx={labelSxStyle}>Cor/Raça</InputLabel>
                                <Select 
                                  label="Cor/Raça" 
                                  name="cor" 
                                  value={form.cor} 
                                  onChange={handleChange} 
                                  disabled={disabledFor("cor")} 
                                  sx={selectSxStyle}
                                  slotProps={{
                                    input: {
                                      notched: true
                                    }
                                  }}
                                >
                                    <MenuItem value="">Selecione</MenuItem>
                                    <MenuItem value="Branca">Branca</MenuItem>
                                    <MenuItem value="Preta">Preta</MenuItem>
                                    <MenuItem value="Parda">Parda</MenuItem>
                                    <MenuItem value="Amarela">Amarela</MenuItem>
                                    <MenuItem value="Indigena">Indigena</MenuItem>
                                </Select>
                                {fieldErrors.cor && <FormHelperText>{fieldErrors.cor}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <DatePicker
                                label="Data de nascimento"
                                format="dd/MM/yyyy"
                                value={parseDateValue(form.data_nasc)}
                                onChange={(newVal) => updateFieldByName("data_nasc", newVal ? formatDateKey(newVal) : "")}
                                disabled={disabledFor("data_nasc")}
                                slotProps={{ textField: { fullWidth: true, error: !!fieldErrors.data_nasc, helperText: fieldErrors.data_nasc, sx: fieldSxStyle, slotProps: { inputLabel: { sx: labelSxStyle } } } }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <DateTimePicker
                                label="Data e hora de falecimento"
                                format="dd/MM/yyyy HH:mm"
                                value={parseDateValue(form.dh_falec)}
                                onChange={(newVal) => updateFieldByName("dh_falec", newVal ? formatDateTimeKey(newVal) : "")}
                                disabled={disabledFor("dh_falec")}
                                slotProps={{ textField: { fullWidth: true, error: !!fieldErrors.dh_falec, helperText: fieldErrors.dh_falec, sx: fieldSxStyle, slotProps: { inputLabel: { sx: labelSxStyle } } } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth variant="outlined" label="Filiação pai" name="filiacao_pai" placeholder="Digite o nome do pai" {...textFieldProps("filiacao_pai")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth variant="outlined" label="Filiação mãe" name="filiacao_mae" placeholder="Digite o nome da mae" {...textFieldProps("filiacao_mae")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField fullWidth variant="outlined" label="Profissão" name="profissao" placeholder="Digite a profissao do falecido" {...textFieldProps("profissao")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Autocomplete
                                fullWidth
                                options={resultados}
                                getOptionLabel={(option) => `${option.nome} - ${option?.microrregiao?.mesorregiao?.UF?.sigla || ""}`}
                                inputValue={busca}
                                onInputChange={(_, newInputValue) => {
                                    updateFieldByName("naturalidade", newInputValue);
                                    setBusca(newInputValue);
                                    validateFieldOnChange("naturalidade", newInputValue);
                                }}
                                onChange={(_, newValue) => {
                                    const displayValue = newValue ? `${newValue.nome} - ${newValue?.microrregiao?.mesorregiao?.UF?.sigla || ""}` : "";
                                    updateFieldByName("naturalidade", displayValue);
                                    validateFieldOnChange("naturalidade", displayValue);
                                }}
                                renderInput={(params) => (
                                    <TextField {...params} label="Naturalidade" placeholder="Digite a naturalidade do falecido" error={!!fieldErrors.naturalidade} helperText={fieldErrors.naturalidade} sx={fieldSxStyle} slotProps={{ inputLabel: { sx: labelSxStyle } }} />
                                )}
                                noOptionsText="Nenhuma cidade encontrada"
                                loadingText="Carregando..."
                                disabled={isSubmitting}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField fullWidth variant="outlined" label="Causa mortis" name="causa_mortis" placeholder="Digite a causa da morte" {...textFieldProps("causa_mortis")} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth variant="outlined" label="Observações" name="obs_fal" placeholder="Observacoes..." multiline rows={4} {...textFieldProps("obs_fal")} />
                        </Grid>
                    </Grid>
                    <Box sx={{ mb: 2, mt: 3 }}>
                        <BtnAction type="button" onClick={handleNextStep} disabled={isSubmitting}>PROXIMO</BtnAction>
                    </Box>
                </StepContent>
            </Step>

            <Step expanded={expandedSteps[1]} completed={isStepComplete(1)}>
                <StepLabel onClick={() => toggleStepExpanded(1)} sx={{ cursor: "pointer" }}>
                    <StepHeader>
                        <span>{stepsDeceased[1]}</span>
                        <ChevronIcon isExpanded={expandedSteps[1]}>
                            <LuChevronDown size={20} />
                        </ChevronIcon>
                    </StepHeader>
                </StepLabel>
                <StepContent sx={{ display: expandedSteps[1] ? "block" : "none" }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth variant="outlined" label="CPF do falecido" name="cpf" placeholder="000.000.000-00" {...textFieldProps("cpf")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth variant="outlined" label="RG do falecido" name="rg" placeholder="00.000.000-0" {...textFieldProps("rg")} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth variant="outlined" label="Nome do médico responsável" name="nome_doutor" placeholder="Digite o nome do medico" {...textFieldProps("nome_doutor")} />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth variant="outlined" label="Comprovante de residência" type="file" accept="image/*" InputLabelProps={{ shrink: true }} onChange={(event) => handleFileChange(event, "residencia")} sx={fieldSxStyle} />
                            {form.residencia_preview && <FilePreview src={form.residencia_preview} alt="preview comprovante" />}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth variant="outlined" label="Declaração de óbito" type="file" accept="image/*" InputLabelProps={{ shrink: true }} name="dec_obito" onChange={(event) => handleFileChange(event, "dec_obito")} sx={fieldSxStyle} />
                            {form.dec_obito_preview && <FilePreview src={form.dec_obito_preview} alt="preview declaracao de obito" />}
                        </Grid>
                    </Grid>
                    <Box sx={{ mb: 2, mt: 3, display: "flex", gap: 1 }}>
                        <BtnAction2 type="button" onClick={handleBackStep} disabled={isSubmitting}>VOLTAR</BtnAction2>
                        <BtnAction type="button" onClick={handleNextStep} disabled={isSubmitting}>PROXIMO</BtnAction>
                    </Box>
                </StepContent>
            </Step>

            <Step expanded={expandedSteps[2]} completed={isStepComplete(2)}>
                <StepLabel onClick={() => toggleStepExpanded(2)} sx={{ cursor: "pointer" }}>
                    <StepHeader>
                        <span>{stepsDeceased[2]}</span>
                        <ChevronIcon isExpanded={expandedSteps[2]}>
                            <LuChevronDown size={20} />
                        </ChevronIcon>
                    </StepHeader>
                </StepLabel>
                <StepContent sx={{ display: expandedSteps[2] ? "block" : "none" }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth variant="outlined" label="Nome do familiar ou responsável" name="nome_resp" placeholder="Digite o nome do responsavel" {...textFieldProps("nome_resp")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth variant="outlined" label="CPF do responsável" name="doc_resp" placeholder="000.000.000-00" {...textFieldProps("doc_resp")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth variant="outlined" label="Profissão do responsável" name="prof_resp" placeholder="Profissao do responsavel" {...textFieldProps("prof_resp")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField fullWidth variant="outlined" label="Contato do responsável" name="tel_resp" placeholder="(XX)XXXXX-XXXX" {...textFieldProps("tel_resp")} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="CEP"
                                name="cep_resp"
                                value={cepResp ? (cepResp.length > 5 ? cepResp.replace(/^(\d{5})(\d{1,3})/, "$1-$2") : cepResp) : ""}
                                onChange={handleCepChange}
                                onBlur={handleCepBlur}
                                placeholder="00000-000"
                                error={!!fieldErrors.cep_resp}
                                helperText={fieldErrors.cep_resp}
                                disabled={disabledFor("cep_resp")}
                                sx={fieldSxStyle}
                                slotProps={{ inputLabel: { sx: labelSxStyle } }}
                            />
                            {loadingCep && <InlineFeedback>Buscando...</InlineFeedback>}
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField fullWidth variant="outlined" label="Endereço do responsável" name="endereco_resp" placeholder="Rua, bairro, cidade - UF" {...textFieldProps("endereco_resp")} />
                        </Grid>
                    </Grid>
                    <Box sx={{ mb: 2, mt: 3, display: "flex", gap: 1 }}>
                        <BtnAction2 type="button" onClick={handleBackStep} disabled={isSubmitting}>VOLTAR</BtnAction2>
                        <BtnAction type="button" onClick={handleNextStep} disabled={isSubmitting}>PROXIMO</BtnAction>
                    </Box>
                </StepContent>
            </Step>

            <Step expanded={expandedSteps[3]} completed={isStepComplete(3)}>
                <StepLabel onClick={() => toggleStepExpanded(3)} sx={{ cursor: "pointer" }}>
                    <StepHeader>
                        <span>{stepsDeceased[3]}</span>
                        <ChevronIcon isExpanded={expandedSteps[3]}>
                            <LuChevronDown size={20} />
                        </ChevronIcon>
                    </StepHeader>
                </StepLabel>
                <StepContent sx={{ display: expandedSteps[3] ? "block" : "none" }}>
                    <ReviewPanel>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Nome:</strong> {form.nome_fal || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Sexo:</strong> {form.sexo || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Idade:</strong> {form.idade || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Estado Civil:</strong> {form.estado_civil || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Cor/Raça:</strong> {form.cor || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>CPF:</strong> {form.cpf || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Filiação mãe:</strong> {form.filiacao_mae || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Filiação pai:</strong> {form.filiacao_pai || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Profissão:</strong> {form.profissao || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Naturalidade:</strong> {form.naturalidade || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Causa da morte:</strong> {form.causa_mortis || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>CPF:</strong> {form.cpf || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>RG:</strong> {form.rg || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Nome do médico responsável:</strong> {form.nome_doutor || "-"}</Grid>
                        <Grid size={{ xs: 12, md: 6 }}><strong>Data de Nascimento:</strong> {form.data_nasc ? formatDateDMY(form.data_nasc) : "-"}</Grid>
                        <Grid size={{ xs: 12, md: 6 }}><strong>Data e Hora de Falecimento:</strong> {form.dh_falec ? formatDateTimeDMY(form.dh_falec) : "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Responsavel:</strong> {form.nome_resp || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Contato:</strong> {form.tel_resp || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>CPF do responsável:</strong> {form.doc_resp || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Profissão do responsável:</strong> {form.prof_resp || "-"}</Grid>
                            <Grid size={{ xs: 12, md: 6 }}><strong>Endereço do responsável:</strong> {form.endereco_resp || "-"}</Grid>

                        </Grid>
                    </ReviewPanel>
                    <Box sx={{ mb: 2, mt: 3, display: "flex", gap: 1 }}>
                        <BtnAction2 type="button" onClick={handleClearFalecido} disabled={isSubmitting}>LIMPAR</BtnAction2>
                        <BtnAction2 type="button" onClick={handleBackStep} disabled={isSubmitting}>VOLTAR</BtnAction2>
                        <BtnAction type="submit" disabled={isSubmitting || hasErrors(fieldErrors)}>SALVAR</BtnAction>
                    </Box>
                </StepContent>
            </Step>
        </Stepper>
    );
}

export default memo(FalecidoProcess);
