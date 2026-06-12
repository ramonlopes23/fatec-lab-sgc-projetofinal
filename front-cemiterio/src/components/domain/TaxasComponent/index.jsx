import React, { useEffect, useMemo, useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import {
    FaCheckCircle,
    FaClock,
    FaDollarSign,
    FaFilter,
    FaPlus,
    FaPowerOff,
    FaRegEdit,
    FaSearch,
    FaTimesCircle,
} from "react-icons/fa";
import {
    Card,
    CardBody,
    CardTitle,
    Container,
    FilterGrid,
    FiltersPanel,
    FormStyled,
    HeaderActions,
    HeaderCopy,
    IconBtn,
    Input,
    PageHeader,
    SearchWrapper,
    StatCard,
    StatCopy,
    StatHint,
    StatIcon,
    StatLabel,
    StatValue,
    StatsGrid,
    Title,
    Subtitle,
} from "./styles";
import {
    Actions,
    StatusBadge,
    Table,
    TableScroller,
    TableWrapper,
    TBody,
    Td,
    TdStatus,
    Th,
    THead,
    Tr,
} from "../../common/DefaultTable";
import { createTaxa, patchTaxaStatus, updateTaxa } from "../../../services/taxaService";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import SystemButton from "../../common/SystemButton";
import DefaultModal, {
    DefaultModalActions,
    DefaultModalGrid,
    DefaultModalInfoField,
    DefaultModalViewGrid,
} from "../../common/DefaultModal";
import { useFormModal, useTaxas, useToastFeedback } from "../../../hooks";
import { formatCurrencyBRL, formatDateDMY, formatTaxaLabel, isDateWithinNextDays, normalizeSearchText, normalizeTaxa } from "../../../utils";

const INITIAL_FORM = {
    codigo: "",
    descricao: "",
    valor: "0",
    tipo: "sepultamento",
    active: true,
    isencao: false,
    vigencia_inicio: "",
    vigencia_fim: "",
};

const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

const filterLabelSx = {
    fontSize: "14px",
    backgroundColor: "white",
    paddingX: "4px",
    marginLeft: "-4px",
};

const filterSelectSx = {
    borderRadius: "12px",
    fontSize: "14px",
    backgroundColor: "#fff",
    "& .MuiOutlinedInput-notchedOutline": {
        top: "0px",
        borderColor: "rgba(31, 38, 82, 0.12)",
    },
    "&:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "rgba(31, 38, 82, 0.2)",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
        borderColor: "#4a2fe3",
        boxShadow: "0 0 0 4px rgba(74, 47, 227, 0.08)",
    },
};

const filterTextFieldSx = {
    "& .MuiInputBase-root": { borderRadius: "12px", backgroundColor: "#fff" },
    "& .MuiOutlinedInput-root": { borderRadius: "12px" },
    "& .MuiOutlinedInput-notchedOutline": { borderRadius: "12px" },
    "& .MuiOutlinedInput-input": { fontSize: "14px" },
};

const normalizeCode = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const isVencendoEm30Dias = (taxa) => isDateWithinNextDays(taxa?.vigencia_fim, 30);

const formatVigencia = (taxa) => {
    const inicio = formatDateDMY(taxa?.vigencia_inicio, "");
    const fim = formatDateDMY(taxa?.vigencia_fim, "");

    if (inicio && fim) return `${inicio} até ${fim}`;
    if (inicio) return inicio;
    if (fim) return fim;
    return "-";
};

function TaxasComponent() {
    const { taxas, loading, error, loadTaxas, setTaxas } = useTaxas({ autoLoad: false, onlyActive: false });
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const [pendingStatusTaxa, setPendingStatusTaxa] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const { showSuccess, showError, ToastElement } = useToastFeedback();

    const {
        form,
        setForm,
        errors,
        setErrors,
        editingId,
        modalOpen,
        isSubmitting,
        setIsSubmitting,
        openCreate,
        openEdit,
        closeModal,

    } = useFormModal({ initialForm: INITIAL_FORM });

    useEffect(() => {
        loadTaxas();
    }, [loadTaxas]);

    const normalizedTaxas = useMemo(() => taxas.map((taxa) => normalizeTaxa(taxa)), [taxas]);

    const typeOptions = useMemo(() => {
        const values = new Set(normalizedTaxas.map((taxa) => String(taxa.tipo || "").trim()).filter(Boolean));
        return Array.from(values).sort((a, b) => a.localeCompare(b));
    }, [normalizedTaxas]);

    const filteredTaxas = useMemo(() => {
        const term = normalizeSearchText(search);

        return normalizedTaxas.filter((taxa) => {
            const matchesSearch = !term || [
                taxa.codigo,
                taxa.descricao,
                taxa.tipo,
                String(taxa.valor ?? ""),
                formatCurrencyBRL(taxa.valor),
                formatTaxaLabel(taxa),
            ].some((field) => normalizeSearchText(field).includes(term));

            const matchesStatus = statusFilter === "all"
                || (statusFilter === "active" && taxa.active)
                || (statusFilter === "inactive" && !taxa.active);

            const matchesType = typeFilter === "all"
                || normalizeSearchText(taxa.tipo) === normalizeSearchText(typeFilter);

            return matchesSearch && matchesStatus && matchesType;
        });
    }, [normalizedTaxas, search, statusFilter, typeFilter]);

    const totalTaxas = normalizedTaxas.length;
    const activeTaxas = normalizedTaxas.filter((taxa) => taxa.active).length;
    const inactiveTaxas = normalizedTaxas.filter((taxa) => !taxa.active).length;
    const vencerTaxas = normalizedTaxas.filter((taxa) => taxa.active && isVencendoEm30Dias(taxa)).length;

    const clearFilters = () => {
        setSearch("");
        setStatusFilter("all");
        setTypeFilter("all");
    };

    const updateField = (key, value) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "descricao" && !editingId) {
                next.codigo = normalizeCode(value);
            }
            if (key === "isencao" && value) {
                next.valor = "0";
            }
            return next;
        });
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const openModal = () => {
        setIsEditing(true);
        openCreate();
    };

    const validateForm = () => {
        const nextErrors = {};
        const codigo = normalizeCode(form.codigo);
        const descricao = form.descricao.trim();
        const valor = Number(form.valor);

        if (!codigo) nextErrors.codigo = "Informe o codigo da taxa";
        if (!descricao) nextErrors.descricao = "Informe a descricao da taxa";
        if (!Number.isFinite(valor) || valor < 0) nextErrors.valor = "Informe um valor valido";
        if (form.vigencia_inicio && form.vigencia_fim && new Date(form.vigencia_fim) < new Date(form.vigencia_inicio)) {
            nextErrors.vigencia_fim = "Vigencia final deve ser posterior ao inicio";
        }

        const duplicated = taxas.some((taxa) => taxa.id !== editingId && normalizeCode(taxa.codigo) === codigo);
        if (duplicated) nextErrors.codigo = "Ja existe uma taxa com esse codigo";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const now = new Date().toISOString();
            const payload = {
                codigo: normalizeCode(form.codigo),
                descricao: form.descricao.trim().toUpperCase(),
                valor: form.isencao ? 0 : Number(form.valor),
                tipo: form.tipo || "sepultamento",
                active: Boolean(form.active),
                isencao: Boolean(form.isencao),
                vigencia_inicio: form.vigencia_inicio,
                vigencia_fim: form.vigencia_fim,
                updated_at: now,
            };
            payload.label = formatTaxaLabel(payload);

            if (editingId) {
                await updateTaxa(editingId, { ...payload, id: editingId });
                showSuccess("Taxa atualizada com sucesso.");
            } else {
                await createTaxa({ ...payload, created_at: now });
                showSuccess("Taxa cadastrada com sucesso.");
            }

            await loadTaxas();
            if (editingId) {
                setIsEditing(false);
            } else {
                closeModal();
            }
        } catch (err) {
            console.error("Erro ao salvar taxa", err);
            showError(err?.response?.data?.message || err?.message || "Erro ao salvar taxa.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (taxa) => {
        const normalized = normalizeTaxa(taxa);
        setIsEditing(false);
        openEdit(normalized.id, {
            codigo: normalized.codigo,
            descricao: normalized.descricao,
            valor: String(normalized.valor ?? 0),
            tipo: normalized.tipo || "sepultamento",
            active: normalized.active,
            isencao: normalized.isencao,
            vigencia_inicio: normalized.vigencia_inicio || "",
            vigencia_fim: normalized.vigencia_fim || "",
        });
    };

    const handleCloseModal = () => {
        setIsEditing(false);
        closeModal();
    };

    const isViewingExisting = Boolean(editingId) && !isEditing;

    const taxaViewFields = [
        ["Descrição", form.descricao],
        ["Código", form.codigo],
        ["Valor", form.isencao ? "Isenta" : formatCurrencyBRL(form.valor)],
        ["Tipo", formatTaxaLabel(form.tipo)],
        ["Vigência início", formatDateDMY(form.vigencia_inicio, "-")],
        ["Vigência fim", formatDateDMY(form.vigencia_fim, "-")],
        ["Isenção", form.isencao ? "Sim" : "Não"],
        ["Status", form.active ? "Ativa" : "Inativa"],
    ];

    const closeConfirmDialog = () => {
        if (isSubmitting) return;
        setConfirmDialogOpen(false);
        setPendingStatusTaxa(null);
    };

    const requestToggleStatus = (taxa) => {
        const normalized = normalizeTaxa(taxa);
        setPendingStatusTaxa(normalized);
        setConfirmDialogOpen(true);
    };

    const confirmToggleStatus = async () => {
        if (!pendingStatusTaxa?.id) return;

        const nextActive = !pendingStatusTaxa.active;
        setIsSubmitting(true);
        try {
            await patchTaxaStatus(pendingStatusTaxa.id, nextActive);
            setTaxas((prev) => prev.map((item) => (
                String(item.id) === String(pendingStatusTaxa.id)
                    ? { ...item, active: nextActive, status: nextActive ? "active" : "inactive" }
                    : item
            )));
            await loadTaxas();
            setConfirmDialogOpen(false);
            setPendingStatusTaxa(null);
            showSuccess(nextActive ? "Taxa ativada com sucesso." : "Taxa inativada com sucesso.");
        } catch (err) {
            console.error("Erro ao alterar status da taxa", err);
            showError(err?.response?.data?.message || err?.message || "Erro ao alterar status da taxa.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {ToastElement}
            <Container>
                <PageHeader>
                    <HeaderCopy>
                        <Title>Controle de Taxas</Title>
                        <Subtitle>Gerencie as taxas de sepultamento vigentes do cemitério.</Subtitle>
                    </HeaderCopy>

                    <HeaderActions>
                        <SystemButton type="button" onClick={openModal} disabled={isSubmitting}>
                            <FaPlus /> Nova Taxa
                        </SystemButton>
                    </HeaderActions>
                </PageHeader>

                <FiltersPanel>
                    <FormStyled as="div">
                        <FilterGrid>
                            <SearchWrapper>
                                <TextField
                                    fullWidth
                                    size="medium"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Buscar por descrição, código, valor ou tipo..."
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <FaSearch />
                                            </InputAdornment>
                                        ),
                                    }}
                                    sx={filterTextFieldSx}
                                />
                            </SearchWrapper>

                            <FormControl fullWidth size="medium">
                                <InputLabel sx={filterLabelSx}>Tipo</InputLabel>
                                <Select value={typeFilter} label="Tipo" onChange={(event) => setTypeFilter(event.target.value)} sx={filterSelectSx}>
                                    <MenuItem value="all">Todos</MenuItem>
                                    {typeOptions.map((type) => (
                                        <MenuItem key={type} value={type}>
                                            {type}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            <FormControl fullWidth size="medium">
                                <InputLabel sx={filterLabelSx}>Situação</InputLabel>
                                <Select value={statusFilter} label="Situação" onChange={(event) => setStatusFilter(event.target.value)} sx={filterSelectSx}>
                                    <MenuItem value="all">Todas</MenuItem>
                                    <MenuItem value="active">Ativas</MenuItem>
                                    <MenuItem value="inactive">Inativas</MenuItem>
                                </Select>
                            </FormControl>

                            <SystemButton type="button" tone="cancel" onClick={clearFilters} sx={{ minHeight: 50 }}>
                                <FaFilter /> Limpar filtros
                            </SystemButton>
                        </FilterGrid>

                        {error ? <p style={{ ...errorStyle, color: "#8a5a00", marginTop: 8 }}>{error}</p> : null}
                    </FormStyled>
                </FiltersPanel>

                <StatsGrid>
                    <StatCard>
                        <StatIcon $tone="success"><FaDollarSign /></StatIcon>
                        <StatCopy>
                            <StatLabel>Total de Taxas</StatLabel>
                            <StatValue>{totalTaxas}</StatValue>
                            <StatHint>Cadastradas</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaCheckCircle /></StatIcon>
                        <StatCopy>
                            <StatLabel>Ativas</StatLabel>
                            <StatValue>{activeTaxas}</StatValue>
                            <StatHint>Vigentes</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaClock /></StatIcon>
                        <StatCopy>
                            <StatLabel>A vencer</StatLabel>
                            <StatValue>{vencerTaxas}</StatValue>
                            <StatHint>Próximos 30 dias</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaTimesCircle /></StatIcon>
                        <StatCopy>
                            <StatLabel>Inativas</StatLabel>
                            <StatValue>{inactiveTaxas}</StatValue>
                            <StatHint>Desativadas</StatHint>
                        </StatCopy>
                    </StatCard>
                </StatsGrid>

                <Card>
                    <CardBody>
                        <CardTitle>Taxas cadastradas</CardTitle>
                        <TableWrapper>
                            <TableScroller>
                                <Table $minWidth="940px">
                                    <THead>
                                        <Tr>
                                            <Th>Código</Th>
                                            <Th>Descrição</Th>
                                            <Th>Tipo</Th>
                                            <Th>Valor</Th>
                                            <Th>Vigência</Th>
                                            <Th>Status</Th>
                                            <Th>Ações</Th>
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {loading ? (
                                            <Tr><Td colSpan={7}>Carregando taxas...</Td></Tr>
                                        ) : filteredTaxas.length === 0 ? (
                                            <Tr><Td colSpan={7}>Nenhuma taxa encontrada.</Td></Tr>
                                        ) : filteredTaxas.map((taxa, index) => {
                                            const normalized = normalizeTaxa(taxa);
                                            return (
                                                <Tr key={String(normalized.id || normalized.codigo)} index={index}>
                                                    <Td>{normalized.codigo}</Td>
                                                    <Td>{normalized.descricao}</Td>
                                                    <Td>{normalized.tipo}</Td>
                                                    <Td>{formatCurrencyBRL(normalized.valor)}</Td>
                                                    <Td>{formatVigencia(normalized)}</Td>
                                                    <TdStatus>
                                                        <StatusBadge $status={normalized.active ? "ativo" : "inativo"}>
                                                            {normalized.active ? "Ativa" : "Inativa"}
                                                        </StatusBadge>
                                                    </TdStatus>
                                                    <Td>
                                                        <Actions>
                                                            <IconBtn type="button" onClick={() => handleEdit(normalized)} disabled={isSubmitting}>
                                                                <FaRegEdit />
                                                            </IconBtn>
                                                            <IconBtn type="button" onClick={() => requestToggleStatus(normalized)} disabled={isSubmitting} data-danger={normalized.active ? "true" : undefined}>
                                                                <FaPowerOff />
                                                            </IconBtn>
                                                        </Actions>
                                                    </Td>
                                                </Tr>
                                            );
                                        })}
                                    </TBody>
                                </Table>
                            </TableScroller>
                        </TableWrapper>
                    </CardBody>
                </Card>

                <ConfirmationDialog
                    open={confirmDialogOpen}
                    onClose={closeConfirmDialog}
                    onConfirm={confirmToggleStatus}
                    title={pendingStatusTaxa?.active ? "Inativar taxa" : "Ativar taxa"}
                    alertSeverity={pendingStatusTaxa?.active ? "warning" : "success"}
                    alertMessage={pendingStatusTaxa?.active ? "A taxa ficará indisponível para novos lançamentos." : "A taxa voltará a ficar disponível para uso."}
                    description={pendingStatusTaxa ? `Deseja ${pendingStatusTaxa.active ? "inativar" : "ativar"} a taxa ${pendingStatusTaxa.descricao}?` : "Confirme a alteração de status da taxa."}
                    confirmLabel={pendingStatusTaxa?.active ? "Inativar" : "Ativar"}
                    confirmTone={pendingStatusTaxa?.active ? "delete" : "confirm"}
                    confirmDisabled={!pendingStatusTaxa}
                    isSubmitting={isSubmitting}
                    ariaDescriptionId="taxa-status-dialog-description"
                />

                <DefaultModal
                    open={modalOpen}
                    title={editingId ? (isEditing ? "Editar taxa" : "Detalhes da taxa") : "Nova taxa"}
                    subtitle={"Visualização completa das taxas do cemitério."}
                    closeOnOverlay={false}
                    onClose={handleCloseModal}
                >
                    <form onSubmit={handleSave}>
                        {isViewingExisting ? (
                            <DefaultModalViewGrid>
                                {taxaViewFields.map(([label, value]) => (
                                    <DefaultModalInfoField key={label} label={label} value={value} />
                                ))}
                            </DefaultModalViewGrid>
                        ) : (
                            <DefaultModalGrid>
                                <div>
                                    <label>Descrição</label>
                                    <Input
                                        value={form.descricao}
                                        onChange={(event) => updateField("descricao", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.descricao ? <p style={errorStyle}>{errors.descricao}</p> : null}
                                </div>

                                <div>
                                    <label>Código</label>
                                    <Input
                                        value={form.codigo}
                                        onChange={(event) => updateField("codigo", normalizeCode(event.target.value))}
                                        disabled={isSubmitting || !!editingId}
                                    />
                                    {errors.codigo ? <p style={errorStyle}>{errors.codigo}</p> : null}
                                </div>

                                <div>
                                    <label>Valor</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.valor}
                                        onChange={(event) => updateField("valor", event.target.value)}
                                        disabled={isSubmitting || form.isencao}
                                    />
                                    {errors.valor ? <p style={errorStyle}>{errors.valor}</p> : null}
                                </div>

                                <div>
                                    <label>Tipo</label>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={form.tipo}
                                        onChange={(event) => updateField("tipo", event.target.value)}
                                        disabled={isSubmitting}
                                    >
                                        <MenuItem value="sepultamento">Sepultamento</MenuItem>
                                    </TextField>
                                </div>

                                <div>
                                    <label>Vigência início</label>
                                    <Input
                                        type="date"
                                        value={form.vigencia_inicio}
                                        onChange={(event) => updateField("vigencia_inicio", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label>Vigência fim</label>
                                    <Input
                                        type="date"
                                        value={form.vigencia_fim}
                                        onChange={(event) => updateField("vigencia_fim", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.vigencia_fim ? <p style={errorStyle}>{errors.vigencia_fim}</p> : null}
                                </div>

                                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={form.isencao}
                                        onChange={(event) => updateField("isencao", event.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                    Isenção
                                </label>

                                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(event) => updateField("active", event.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                    Ativa
                                </label>
                            </DefaultModalGrid>
                        )}

                        <DefaultModalActions>
                            {isViewingExisting ? (
                                <SystemButton
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setIsEditing(true);
                                    }}
                                    disabled={isSubmitting}
                                >
                                    Editar
                                </SystemButton>
                            ) : (
                                <SystemButton type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Salvando..." : "Salvar"}
                                </SystemButton>
                            )}
                            <SystemButton type="button" tone="cancel" onClick={handleCloseModal} disabled={isSubmitting}>
                                {editingId ? "Fechar" : "Cancelar"}
                            </SystemButton>
                        </DefaultModalActions>
                    </form>
                </DefaultModal>
            </Container>
        </>
    );
}

export default TaxasComponent;
