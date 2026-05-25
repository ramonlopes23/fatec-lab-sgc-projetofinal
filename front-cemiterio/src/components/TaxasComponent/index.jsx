import React, { useEffect, useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
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
    Actions,
    BtnPrimaryClose,
    BtnPrimarySave,
    Card,
    CardBody,
    CardTitle,
    Container,
    FilterGrid,
    FilterSelect,
    FiltersPanel,
    FormStyled,
    HeaderActions,
    HeaderCopy,
    IconBtn,
    Input,
    ModalContent,
    ModalGrid,
    ModalOverlay,
    PageHeader,
    PrimaryActionButton,
    SearchField,
    SearchIcon,
    SearchWrapper,
    SecondaryButton,
    StatCard,
    StatCopy,
    StatHint,
    StatIcon,
    StatLabel,
    StatValue,
    StatsGrid,
    StatusBadge,
    Table,
    TableScroller,
    TableWrapper,
    TBody,
    Td,
    TdStatus,
    Th,
    THead,
    Title,
    Tr,
    Subtitle,
} from "./styles";
import useTaxas from "../../hooks/Taxas/useTaxas";
import { createTaxa, patchTaxaStatus, updateTaxa } from "../../services/taxaService";
import { formatDateDMY, parseDateValue } from "../../utils/date";
import { formatCurrencyBRL, formatTaxaLabel, normalizeTaxa } from "../../utils/taxas";
import { useToastFeedback } from "../../hooks/ToastFeedback/useToastFeedback.jsx";

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

const normalizeCode = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const normalizeSearchText = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isVencendoEm30Dias = (taxa) => {
    const date = parseDateValue(taxa?.vigencia_fim);
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);
    limit.setHours(23, 59, 59, 999);

    return date >= today && date <= limit;
};

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
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const { showSuccess, showError, ToastElement } = useToastFeedback();

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
        setEditingId(null);
        setForm(INITIAL_FORM);
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
        setForm(INITIAL_FORM);
        setErrors({});
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
            closeModal();
        } catch (err) {
            console.error("Erro ao salvar taxa", err);
            showError(err?.response?.data?.message || err?.message || "Erro ao salvar taxa.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (taxa) => {
        const normalized = normalizeTaxa(taxa);
        setEditingId(normalized.id);
        setForm({
            codigo: normalized.codigo,
            descricao: normalized.descricao,
            valor: String(normalized.valor ?? 0),
            tipo: normalized.tipo || "sepultamento",
            active: normalized.active,
            isencao: normalized.isencao,
            vigencia_inicio: normalized.vigencia_inicio || "",
            vigencia_fim: normalized.vigencia_fim || "",
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleToggleStatus = async (taxa) => {
        const normalized = normalizeTaxa(taxa);
        const nextActive = !normalized.active;
        const ok = window.confirm(`${nextActive ? "Ativar" : "Inativar"} a taxa ${normalized.descricao}?`);
        if (!ok) return;

        setIsSubmitting(true);
        try {
            await patchTaxaStatus(normalized.id, nextActive);
            setTaxas((prev) => prev.map((item) => (
                String(item.id) === String(normalized.id)
                    ? { ...item, active: nextActive, status: nextActive ? "active" : "inactive" }
                    : item
            )));
            await loadTaxas();
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
                    <PrimaryActionButton type="button" onClick={openModal} disabled={isSubmitting}>
                        <FaPlus /> Nova Taxa
                    </PrimaryActionButton>
                </HeaderActions>
            </PageHeader>

            <FiltersPanel>
                <FormStyled as="div">
                    <FilterGrid>
                        <SearchWrapper>
                            <SearchIcon>
                                <FaSearch />
                            </SearchIcon>
                            <SearchField
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Buscar por descrição, código, valor ou tipo..."
                            />
                        </SearchWrapper>

                        <FilterSelect value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                            <option value="all">Tipo: Todos</option>
                            {typeOptions.map((type) => (
                                <option key={type} value={type}>
                                    Tipo: {type}
                                </option>
                            ))}
                        </FilterSelect>

                        <FilterSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">Situação: Todas</option>
                            <option value="active">Situação: Ativas</option>
                            <option value="inactive">Situação: Inativas</option>
                        </FilterSelect>

                        <SecondaryButton type="button" onClick={clearFilters}>
                            <FaFilter /> Limpar filtros
                        </SecondaryButton>
                    </FilterGrid>

                    {error ? <p style={{ ...errorStyle, color: "#8a5a00", marginTop: 8 }}>{error}</p> : null}
                </FormStyled>
            </FiltersPanel>

            <StatsGrid>
                <StatCard>
                    <StatIcon $tone="primary"><FaDollarSign /></StatIcon>
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
                    <StatIcon $tone="warning"><FaClock /></StatIcon>
                    <StatCopy>
                        <StatLabel>A vencer</StatLabel>
                        <StatValue>{vencerTaxas}</StatValue>
                        <StatHint>Próximos 30 dias</StatHint>
                    </StatCopy>
                </StatCard>

                <StatCard>
                    <StatIcon $tone="danger"><FaTimesCircle /></StatIcon>
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
                            <Table>
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
                                                        <IconBtn type="button" onClick={() => handleToggleStatus(normalized)} disabled={isSubmitting} data-danger={normalized.active ? "true" : undefined}>
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

            {modalOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <Title>{editingId ? "Editar taxa" : "Nova taxa"}</Title>
                        <form onSubmit={handleSave}>
                            <ModalGrid>
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
                            </ModalGrid>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                                <BtnPrimaryClose type="button" onClick={closeModal} disabled={isSubmitting}>
                                    Cancelar
                                </BtnPrimaryClose>
                                <BtnPrimarySave type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Salvando..." : "Salvar"}
                                </BtnPrimarySave>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
        </>
    );
}

export default TaxasComponent;
