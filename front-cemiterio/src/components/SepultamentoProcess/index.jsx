import React, { memo, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LuChevronDown } from "react-icons/lu";
import { formatDateKey, formatDateTimeKey, parseDateValue } from "../../utils/date";
import { hasErrors } from "../../utils/validation"
import {
    BtnAction,
    BtnAction2,
    SearchFieldWrapper,
    SearchResults,
    SearchResultItem,
    StepHeader,
    ChevronIcon,
} from "./styles";

function SepultamentoProcess({
    form,
    fieldErrors,
    searchFal,
    setSearchFal,
    showFalList,
    setShowFalList,
    filteredFalecidos,
    handleSelectFalecido,
    cpfDoFalecidoSelecionado,
    updateFieldByName,
    isSubmitting,
    handleChange,
    handleQuadraSepChange,
    quadras,
    availableCovas,
    tipoCovaSelecionada,
    handleClearSepultamento,
    validateFieldOnChange,
    taxaOptions,
    fieldSxStyle,
    labelSxStyle,
    selectSxStyle,
}) {
    const [expandedSteps, setExpandedSteps] = useState({ 0: true });

    const toggleStepExpanded = (stepIndex) => {
        setExpandedSteps((prev) => ({
            ...prev,
            [stepIndex]: !prev[stepIndex],
        }));
    };
    return (
        <Stepper activeStep={0} orientation="vertical">
            <Step expanded={expandedSteps[0]}>
                <StepLabel onClick={() => toggleStepExpanded(0)} sx={{ cursor: "pointer" }}>
                    <StepHeader>
                        <span>Sepultamento</span>
                        <ChevronIcon isExpanded={expandedSteps[0]}>
                            <LuChevronDown size={20} />
                        </ChevronIcon>
                    </StepHeader>
                </StepLabel>
                <StepContent sx={{ display: expandedSteps[0] ? "block" : "none" }}>
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md:6 }}>
                            <SearchFieldWrapper>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Nome do falecido"
                                    name="nome_fal"
                                    placeholder="Digite o nome do falecido..."
                                    error={!!fieldErrors.nome_fal}
                                    helperText={fieldErrors.nome_fal}
                                    value={searchFal}
                                    onChange={(event) => {
                                        setSearchFal(event.target.value);
                                        setShowFalList(true);
                                        validateFieldOnChange("nome_fal", event.target.value);
                                    }}
                                    onFocus={() => setShowFalList(true)}
                                    onBlur={() => setTimeout(() => setShowFalList(false), 150)}
                                    sx={fieldSxStyle}
                                    slotProps={{ inputLabel: { sx: labelSxStyle } }}
                                />
                                {showFalList && filteredFalecidos.length > 0 && (
                                    <SearchResults>
                                        {filteredFalecidos.map((falecido) => (
                                            <SearchResultItem
                                                key={falecido.id}
                                                onMouseDown={(event) => {
                                                    event.preventDefault();
                                                    handleSelectFalecido(String(falecido.id));
                                                    setSearchFal(falecido.nome_fal || falecido.nome || "");
                                                    setShowFalList(false);
                                                }}
                                            >
                                                {falecido.nome_fal || falecido.nome}
                                            </SearchResultItem>
                                        ))}
                                    </SearchResults>
                                )}
                            </SearchFieldWrapper>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="CPF do falecido"
                                value={cpfDoFalecidoSelecionado}
                                disabled
                                sx={fieldSxStyle}
                                slotProps={{ inputLabel: { sx: labelSxStyle } }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <DatePicker
                                label="Data do falecimento"
                                format="dd/MM/yyyy"
                                value={parseDateValue(form.data_obito_sep)}
                                onChange={(newVal) => updateFieldByName("data_obito_sep", newVal ? formatDateKey(newVal) : "")}
                                disabled={isSubmitting}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!fieldErrors.data_obito_sep,
                                        helperText: fieldErrors.data_obito_sep,
                                        sx: fieldSxStyle,
                                        slotProps: { inputLabel: { sx: labelSxStyle } },
                                    },
                                    paper: { sx: { borderRadius: "12px" } },
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <DateTimePicker
                                label="Data e hora do sepultamento"
                                format="dd/MM/yyyy HH:mm"
                                value={parseDateValue(form.dh_sep)}
                                onChange={(newVal) => updateFieldByName("dh_sep", newVal ? formatDateTimeKey(newVal) : "")}
                                disabled={isSubmitting}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        error: !!fieldErrors.dh_sep,
                                        helperText: fieldErrors.dh_sep,
                                        sx: fieldSxStyle,
                                        slotProps: { inputLabel: { sx: labelSxStyle } },
                                    },
                                }}
                            />
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth error={!!fieldErrors.titulo_posse}>
                                <InputLabel sx={labelSxStyle}>Possui título de posse?</InputLabel>
                                <Select label="Possui titulo de posse?" name="titulo_posse" value={form.titulo_posse} onChange={handleChange} sx={selectSxStyle}>
                                    <MenuItem value="">Selecione a opcao</MenuItem>
                                    <MenuItem value="Sim">Sim</MenuItem>
                                    <MenuItem value="Nao">Nao</MenuItem>
                                </Select>
                                {fieldErrors.titulo_posse && <FormHelperText>{fieldErrors.titulo_posse}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 6 }}>
                            <FormControl fullWidth error={!!fieldErrors.quadra_sep}>
                                <InputLabel sx={labelSxStyle}>Quadra</InputLabel>
                                <Select
                                    label="Quadra"
                                    name="quadra_sep"
                                    value={form.quadra_sep ?? ""}
                                    onChange={(event) => handleQuadraSepChange(event.target.value)}
                                    disabled={isSubmitting}
                                    sx={selectSxStyle}
                                >
                                    <MenuItem value="">Selecione a quadra</MenuItem>
                                    {quadras.map((quadra) => (
                                        <MenuItem key={String(quadra.id)} value={String(quadra.id)}>
                                            {`Quadra número ${quadra.num_quadra ?? quadra.number ?? quadra.nome ?? quadra.id}`}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.quadra_sep && <FormHelperText>{fieldErrors.quadra_sep}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth error={!!fieldErrors.num_sepultura_sep}>
                                <InputLabel sx={labelSxStyle}>Nº da sepultura</InputLabel>
                                <Select
                                    label="Nº da sepultura"
                                    name="num_sepultura_sep"
                                    value={form.num_sepultura_sep ?? ""}
                                    onChange={handleChange}
                                    disabled={isSubmitting}
                                    sx={selectSxStyle}
                                >
                                    <MenuItem value="">Selecione a sepultura</MenuItem>
                                    {availableCovas.map((cova) => {
                                        const val = String(cova.num_cova ?? cova.number ?? cova.numero ?? cova.num_sepultura ?? "");
                                        const isReserved = String(cova.status ?? "").toLowerCase().includes("reserv");
                                        return (
                                            <MenuItem key={String(cova.id ?? `${cova.quadra_cova}-${cova.num_cova}`)} value={val}>
                                                {val}{isReserved ? " (Particular)" : ""}
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                                {fieldErrors.num_sepultura_sep && <FormHelperText>{fieldErrors.num_sepultura_sep}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField fullWidth variant="outlined" label="Tipo de sepultura" value={tipoCovaSelecionada || "-"} disabled sx={fieldSxStyle} slotProps={{ inputLabel: { sx: labelSxStyle } }} />
                        </Grid>

                        <Grid size={{ xs: 12, md: 4 }}>
                            <FormControl fullWidth error={!!fieldErrors.taxa}>
                                <InputLabel sx={labelSxStyle}>Taxa de sepultamento</InputLabel>
                                <Select label="Taxa de sepultamento" name="taxa" value={form.taxa} onChange={handleChange} disabled={isSubmitting} sx={selectSxStyle}>
                                    <MenuItem value="">Selecione o tipo de taxa</MenuItem>
                                    {(taxaOptions || []).map((taxa) => (
                                        <MenuItem key={String(taxa.id ?? taxa.codigo)} value={taxa.codigo}>
                                            {taxa.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {fieldErrors.taxa && <FormHelperText>{fieldErrors.taxa}</FormHelperText>}
                            </FormControl>
                        </Grid>

                        <Grid size={{ xs: 12 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Observações"
                                name="obs_sep"
                                value={form.obs_sep}
                                onChange={handleChange}
                                multiline
                                rows={4}
                                sx={fieldSxStyle}
                                slotProps={{ inputLabel: { sx: labelSxStyle } }}
                            />
                        </Grid>
                    </Grid>

                    <Box sx={{ mb: 2, mt: 3, display: "flex", gap: 1 }}>
                        <BtnAction2 type="button" onClick={handleClearSepultamento} disabled={isSubmitting}>LIMPAR</BtnAction2>
                        <BtnAction type="submit" disabled={isSubmitting || hasErrors(fieldErrors)}>SALVAR</BtnAction>
                    </Box>
                </StepContent>
            </Step>
        </Stepper>
    );
}

export default memo(SepultamentoProcess);
