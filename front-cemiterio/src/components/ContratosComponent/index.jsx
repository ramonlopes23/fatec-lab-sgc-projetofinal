import React, { useEffect, useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import {
    FaCheckCircle,
    FaClock,
    FaDollarSign,
    FaFilter,
    FaPlus,
    FaRegEdit,
    FaSearch,
    FaTimesCircle,
    FaTrash,
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
    TdLocal,
    TdStatus,
    TdValue,
    Th,
    THead,
    Title,
    Tr,
    Subtitle,
} from "./styles";
import { getContratos, createContrato, updateContrato, deleteContrato } from "../../services/contratoService.js";
import { useCemeteryStore } from "../../stores/cemeteryStore.js";
import { formatCurrencyBRL } from "../../utils/taxas";
import { formatDateDMY, formatDateTimeKey, parseDateValue } from "../../utils/date";

const STATUS_OPTIONS = [
    { value: "ativo", label: "Ativo" },
    { value: "inativo", label: "Inativo" },
    { value: "vencido", label: "Vencido" },
];

const STATUS_FILTER_OPTIONS = [
    { value: "all", label: "Situação: Todas" },
    { value: "active", label: "Situação: Ativos" },
    { value: "expiring", label: "Situação: A vencer" },
    { value: "expired", label: "Situação: Vencidos" },
];

const INITIAL_FORM = {
    nome_titular: "",
    numero_titulo: "",
    status: "ativo",
    validade_titulo: "",
    sepultura: "",
    quadra: "",
    valor: "0",
    cemiterio: "",
};

const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

const normalizeSearchText = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const formatDateBR = (value) => formatDateDMY(value, value || "-");

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

const statusLabel = (status) => {
    const normalized = normalizeStatus(status);
    const found = STATUS_OPTIONS.find((item) => item.value === normalized);
    return found ? found.label : (status || "-");
};

const getValidityBucket = (contract) => {
    const date = parseDateValue(contract?.validade_titulo);
    if (!date) return "active";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);
    limit.setHours(23, 59, 59, 999);

    if (date < today) return "expired";
    if (date <= limit) return "expiring";
    return "active";
};

const formatLocal = (contract, cemeteryNameFallback) => {
    const cemeteryName = String(contract?.cemiterio || cemeteryNameFallback || "").trim();
    const quadra = String(contract?.quadra || "").trim();
    const sepultura = String(contract?.sepultura || "").trim();

    return [cemeteryName, quadra ? `Quadra ${quadra}` : "", sepultura ? `Sepultura ${sepultura}` : ""]
        .filter(Boolean)
        .join(" • ") || "-";
};

const normalizeContract = (contract) => ({
    id: contract?.id ?? contract?.numero_titulo ?? "",
    nome_titular: String(contract?.nome_titular || "").trim(),
    numero_titulo: String(contract?.numero_titulo || "").trim(),
    status: normalizeStatus(contract?.status) || "ativo",
    validade_titulo: contract?.validade_titulo || "",
    sepultura: String(contract?.sepultura || "").trim(),
    quadra: String(contract?.quadra || "").trim(),
    valor: Number(contract?.valor ?? contract?.valor_anual ?? 0),
    cemiterio: String(contract?.cemiterio || contract?.cemiterio_nome || "").trim(),
});

export default function ContratosComponent() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [titulos, setTitulos] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const cemeteries = useCemeteryStore((state) => state.cemeteries);
    const selectedCemeteryId = useCemeteryStore((state) => state.selectedCemeteryId);
    const selectedCemetery = useMemo(() => (
        cemeteries.find((cemetery) => String(cemetery?.id) === String(selectedCemeteryId))
        || cemeteries.find((cemetery) => cemetery?.active !== false)
        || cemeteries[0]
        || null
    ), [cemeteries, selectedCemeteryId]);

    const selectedCemeteryName = selectedCemetery?.name || "";

    useEffect(() => {
        loadContratos();
    }, []);

    const loadContratos = async () => {
        setIsLoading(true);
        try {
            const data = await getContratos();
            setTitulos(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar contratos", error);
            setTitulos([]);
            alert("Erro ao carregar contratos");
        } finally {
            setIsLoading(false);
        }
    };

    const normalizedTitulos = useMemo(() => titulos.map(normalizeContract), [titulos]);

    const filteredTitulos = useMemo(() => {
        const q = normalizeSearchText(query);

        return normalizedTitulos.filter((item) => {
            const local = formatLocal(item, selectedCemeteryName);
            const matchesSearch = !q || [
                item.numero_titulo,
                item.nome_titular,
                item.status,
                item.validade_titulo,
                item.sepultura,
                item.quadra,
                local,
                formatCurrencyBRL(item.valor),
            ].some((field) => normalizeSearchText(field).includes(q));

            const bucket = getValidityBucket(item);
            const matchesStatus = statusFilter === "all"
                || (statusFilter === "active" && bucket === "active")
                || (statusFilter === "expiring" && bucket === "expiring")
                || (statusFilter === "expired" && bucket === "expired");

            return matchesSearch && matchesStatus;
        });
    }, [normalizedTitulos, query, selectedCemeteryName, statusFilter]);

    const stats = useMemo(() => {
        const total = normalizedTitulos.length;
        const active = normalizedTitulos.filter((item) => getValidityBucket(item) === "active").length;
        const expiring = normalizedTitulos.filter((item) => getValidityBucket(item) === "expiring").length;
        const expired = normalizedTitulos.filter((item) => getValidityBucket(item) === "expired").length;
        const revenueAnnual = normalizedTitulos.reduce((sum, item) => {
            const bucket = getValidityBucket(item);
            if (bucket === "expired") return sum;
            return sum + (Number(item.valor) || 0);
        }, 0);

        return { total, active, expiring, expired, revenueAnnual };
    }, [normalizedTitulos]);

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const clearFilters = () => {
        setQuery("");
        setStatusFilter("all");
    };

    const openModal = () => {
        setEditingId(null);
        setForm({
            ...INITIAL_FORM,
            cemiterio: selectedCemeteryName,
        });
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
        setForm({
            ...INITIAL_FORM,
            cemiterio: selectedCemeteryName,
        });
        setErrors({});
    };

    const validateForm = () => {
        const nextErrors = {};
        const numero = form.numero_titulo.trim();
        const nome = form.nome_titular.trim();
        const valor = Number(form.valor);

        if (!nome) nextErrors.nome_titular = "Informe o nome do titular";
        if (!numero) nextErrors.numero_titulo = "Informe o número do título";
        if (!form.status.trim()) nextErrors.status = "Informe o status do título";
        if (!form.validade_titulo.trim()) nextErrors.validade_titulo = "Informe a vigência do título";
        if (!form.sepultura.trim()) nextErrors.sepultura = "Informe o número da sepultura";
        if (!form.quadra.trim()) nextErrors.quadra = "Informe o número da quadra";
        if (!Number.isFinite(valor) || valor < 0) nextErrors.valor = "Informe um valor válido";

        if (form.validade_titulo && !parseDateValue(form.validade_titulo)) {
            nextErrors.validade_titulo = "Data de vigência em formato inválido";
        }

        const duplicated = titulos.some(
            (item) => item.id !== editingId && String(item.numero_titulo || "").trim().toLowerCase() === numero.toLowerCase()
        );
        if (duplicated) nextErrors.numero_titulo = "Já existe um título com esse número";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSaveTitulo = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const now = formatDateTimeKey(new Date());
            const payload = {
                nome_titular: form.nome_titular.trim(),
                numero_titulo: form.numero_titulo.trim(),
                status: form.status,
                validade_titulo: form.validade_titulo,
                sepultura: form.sepultura.trim(),
                quadra: form.quadra.trim(),
                cemiterio: String(form.cemiterio || selectedCemeteryName || "").trim(),
                valor: Number(form.valor),
                update_at: now,
            };

            if (editingId) {
                await updateContrato(editingId, {
                    ...payload,
                    id: editingId,
                });
                alert("Título atualizado com sucesso.");
            } else {
                await createContrato({
                    ...payload,
                    created_at: now,
                });
                alert("Título cadastrado com sucesso.");
            }

            await loadContratos();
            closeModal();
        } catch (error) {
            console.error("Erro ao salvar contrato/titulo", error);
            alert(error?.response?.data?.message || error?.message || "Não foi possível salvar o título");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditTitulo = (item) => {
        const normalized = normalizeContract(item);
        setEditingId(normalized.id);
        setForm({
            nome_titular: normalized.nome_titular,
            numero_titulo: normalized.numero_titulo,
            status: normalized.status || "ativo",
            validade_titulo: normalized.validade_titulo,
            sepultura: normalized.sepultura,
            quadra: normalized.quadra,
            valor: String(normalized.valor ?? 0),
            cemiterio: normalized.cemiterio || selectedCemeteryName,
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleDeleteTitulo = async (id) => {
        const ok = window.confirm("Deseja realmente excluir este título?");
        if (!ok) return;

        setIsSubmitting(true);
        try {
            await deleteContrato(id);
            alert("Título excluído com sucesso");
            await loadContratos();
        } catch (error) {
            console.error("Erro ao excluir título", error);
            alert(error?.response?.data?.message || error?.message || "Não foi possível excluir o título");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container>
            <PageHeader>
                <HeaderCopy>
                    <Title>Contratos / Títulos de Posse</Title>
                    <Subtitle>Gerencie os contratos vigentes, acompanhe a validade e a receita anual dos títulos ativos.</Subtitle>
                </HeaderCopy>

                <HeaderActions>
                    <PrimaryActionButton type="button" onClick={openModal} disabled={isSubmitting}>
                        <FaPlus /> Novo Contrato
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
                                fullWidth
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Buscar por titular, número, local, valor ou vigência..."
                            />
                        </SearchWrapper>

                        <FilterSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            {STATUS_FILTER_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </FilterSelect>

                        <SecondaryButton type="button" onClick={clearFilters}>
                            <FaFilter /> Limpar filtros
                        </SecondaryButton>
                    </FilterGrid>
                </FormStyled>
            </FiltersPanel>

            <StatsGrid>
                <StatCard>
                    <StatIcon><FaPlus /></StatIcon>
                    <StatCopy>
                        <StatLabel>Total de contratos</StatLabel>
                        <StatValue>{stats.total}</StatValue>
                        <StatHint>Cadastrados</StatHint>
                    </StatCopy>
                </StatCard>

                <StatCard>
                    <StatIcon $tone="success"><FaCheckCircle /></StatIcon>
                    <StatCopy>
                        <StatLabel>Contratos ativos</StatLabel>
                        <StatValue>{stats.active}</StatValue>
                        <StatHint>Vigência acima de 30 dias</StatHint>
                    </StatCopy>
                </StatCard>

                <StatCard>
                    <StatIcon $tone="warning"><FaClock /></StatIcon>
                    <StatCopy>
                        <StatLabel>Contratos a vencer</StatLabel>
                        <StatValue>{stats.expiring}</StatValue>
                        <StatHint>Próximos 30 dias</StatHint>
                    </StatCopy>
                </StatCard>

                <StatCard>
                    <StatIcon $tone="danger"><FaTimesCircle /></StatIcon>
                    <StatCopy>
                        <StatLabel>Contratos vencidos</StatLabel>
                        <StatValue>{stats.expired}</StatValue>
                        <StatHint>Vigência expirada</StatHint>
                    </StatCopy>
                </StatCard>

                <StatCard>
                    <StatIcon><FaDollarSign /></StatIcon>
                    <StatCopy>
                        <StatLabel>Receita anual</StatLabel>
                        <StatValue>{formatCurrencyBRL(stats.revenueAnnual)}</StatValue>
                        <StatHint>Prevista com contratos vigentes</StatHint>
                    </StatCopy>
                </StatCard>
            </StatsGrid>

            <Card>
                <CardBody>
                    <CardTitle>Contratos cadastrados</CardTitle>
                    <TableWrapper>
                        <TableScroller>
                            <Table>
                                <THead>
                                    <Tr>
                                        <Th>Nº do Título</Th>
                                        <Th>Titular</Th>
                                        <Th>Local</Th>
                                        <Th>Vigência</Th>
                                        <Th>Valor</Th>
                                        <Th>Status</Th>
                                        <Th>Ações</Th>
                                    </Tr>
                                </THead>
                                <TBody>
                                    {isLoading ? (
                                        <Tr>
                                            <Td colSpan={7}>Carregando contratos...</Td>
                                        </Tr>
                                    ) : filteredTitulos.length > 0 ? (
                                        filteredTitulos.map((item, index) => {
                                            const normalized = normalizeContract(item);
                                            return (
                                                <Tr key={String(normalized.id || normalized.numero_titulo)} index={index}>
                                                    <Td>{normalized.numero_titulo}</Td>
                                                    <Td>{normalized.nome_titular}</Td>
                                                    <TdLocal>{formatLocal(normalized, selectedCemeteryName)}</TdLocal>
                                                    <Td>{formatDateBR(normalized.validade_titulo)}</Td>
                                                    <TdValue>{formatCurrencyBRL(normalized.valor)}</TdValue>
                                                    <TdStatus>
                                                        <StatusBadge $status={normalized.status}>
                                                            {statusLabel(normalized.status)}
                                                        </StatusBadge>
                                                    </TdStatus>
                                                    <Td>
                                                        <Actions>
                                                            <IconBtn type="button" onClick={() => handleEditTitulo(normalized)} disabled={isSubmitting}>
                                                                <FaRegEdit />
                                                            </IconBtn>
                                                            <IconBtn type="button" onClick={() => handleDeleteTitulo(normalized.id)} disabled={isSubmitting}>
                                                                <FaTrash />
                                                            </IconBtn>
                                                        </Actions>
                                                    </Td>
                                                </Tr>
                                            );
                                        })
                                    ) : (
                                        <Tr>
                                            <Td colSpan={7}>Nenhum contrato encontrado.</Td>
                                        </Tr>
                                    )}
                                </TBody>
                            </Table>
                        </TableScroller>
                    </TableWrapper>
                </CardBody>
            </Card>

            {modalOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <CardTitle>{editingId ? "Editar título de posse" : "Novo título de posse"}</CardTitle>

                        <form onSubmit={handleSaveTitulo}>
                            <ModalGrid>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label>Nome do titular</label>
                                    <Input
                                        value={form.nome_titular}
                                        onChange={(event) => updateField("nome_titular", event.target.value)}
                                        placeholder="Nome completo do titular"
                                        disabled={isSubmitting}
                                    />
                                    {errors.nome_titular ? <p style={errorStyle}>{errors.nome_titular}</p> : null}
                                </div>

                                <div>
                                    <label>Número do título</label>
                                    <Input
                                        value={form.numero_titulo}
                                        onChange={(event) => updateField("numero_titulo", event.target.value)}
                                        placeholder="Ex: 000145"
                                        disabled={isSubmitting}
                                    />
                                    {errors.numero_titulo ? <p style={errorStyle}>{errors.numero_titulo}</p> : null}
                                </div>

                                <div>
                                    <label>Valor</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.valor}
                                        onChange={(event) => updateField("valor", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.valor ? <p style={errorStyle}>{errors.valor}</p> : null}
                                </div>

                                <div>
                                    <label>Status</label>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={form.status}
                                        onChange={(event) => updateField("status", event.target.value)}
                                        disabled={isSubmitting}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "12px",
                                            },
                                            "& .MuiOutlinedInput-input": {
                                                fontSize: "14px",
                                            },
                                        }}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    {errors.status ? <p style={errorStyle}>{errors.status}</p> : null}
                                </div>

                                <div>
                                    <label>Sepultura</label>
                                    <Input
                                        value={form.sepultura}
                                        onChange={(event) => updateField("sepultura", event.target.value)}
                                        placeholder="Exemplo: 05"
                                        disabled={isSubmitting}
                                    />
                                    {errors.sepultura ? <p style={errorStyle}>{errors.sepultura}</p> : null}
                                </div>

                                <div>
                                    <label>Quadra</label>
                                    <Input
                                        value={form.quadra}
                                        onChange={(event) => updateField("quadra", event.target.value)}
                                        placeholder="Exemplo: 12"
                                        disabled={isSubmitting}
                                    />
                                    {errors.quadra ? <p style={errorStyle}>{errors.quadra}</p> : null}
                                </div>

                                <div>
                                    <label>Vigência</label>
                                    <Input
                                        type="date"
                                        value={form.validade_titulo}
                                        onChange={(event) => updateField("validade_titulo", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.validade_titulo ? <p style={errorStyle}>{errors.validade_titulo}</p> : null}
                                </div>
                            </ModalGrid>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                                <BtnPrimaryClose type="button" onClick={closeModal} disabled={isSubmitting}>
                                    Cancelar
                                </BtnPrimaryClose>
                                <BtnPrimarySave type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Salvando..." : "Salvar título"}
                                </BtnPrimarySave>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
}
