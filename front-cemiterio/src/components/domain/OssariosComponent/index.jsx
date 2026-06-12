import { useCallback, useEffect, useMemo, useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { FaChartPie, FaCheckCircle, FaFilter, FaPlus, FaRegEdit, FaSearch, FaTimesCircle, FaTrash } from "react-icons/fa";
import api from "../../../services/index.js";
import { normalizeSearchText } from "../../../utils";
import { useFormModal, useToastFeedback } from "../../../hooks";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import SystemButton from "../../common/SystemButton";
import DefaultModal, {
    DefaultModalActions,
    DefaultModalGrid,
    DefaultModalInfoField,
    DefaultModalViewGrid,
} from "../../common/DefaultModal";
import {
    Card,
    CardBody,
    CardTitle,
    ChartCardBody,
    ChartStage,
    Container,
    FilterGrid,
    FilterSelect,
    FiltersPanel,
    FormStyled,
    FullWidthField,
    HeaderActions,
    HeaderCopy,
    IconBtn,
    Input,
    LegendDot,
    LegendKey,
    LegendRow,
    PageHeader,
    SearchField,
    SearchIcon,
    SearchWrapper,
    StatCard,
    StatCopy,
    StatHint,
    StatIcon,
    StatLabel,
    StatValue,
    StatsGrid,
    Textarea,
    Title,
    Subtitle,
} from "./styles.js";
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
import { RiArchiveDrawerFill } from "react-icons/ri";

const TYPE_OPTIONS = [
    { value: "coletivo", label: "Coletivo" },
    { value: "familiar", label: "Familiar" },
];

const STATUS_OPTIONS = [
    { value: "disponivel", label: "Disponível" },
    { value: "ocupado", label: "Ocupado" },
    { value: "interditado", label: "Interditado" },
    { value: "manutencao", label: "Manutenção" },
];

const ACTIVE_STATUS = new Set(["disponivel", "ocupado"]);
const INACTIVE_STATUS = new Set(["interditado", "manutencao"]);

const INITIAL_FORM = {
    numero: "",
    tipo: "coletivo",
    status: "disponivel",
    capacidade: "",
    obs: "",
};

const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

const normalizeType = (value) => {
    const raw = String(value || "").trim().toLowerCase();
    if (raw === "individual") return "familiar";
    if (TYPE_OPTIONS.some((item) => item.value === raw)) return raw;
    return "";
};

const typeLabel = (type) => {
    const raw = String(type || "").trim().toLowerCase();
    if (raw === "individual") return "Individual";
    const found = TYPE_OPTIONS.find((option) => option.value === raw);
    return found ? found.label : (type || "-");
};

const statusLabel = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    const found = STATUS_OPTIONS.find((option) => option.value === normalized);
    return found ? found.label : (status || "-");
};

const normalizeStatus = (status) => String(status || "").trim().toLowerCase();

const isOssarioActive = (item) => {
    if (item?.active !== undefined) return Boolean(item.active);
    const status = normalizeStatus(item?.status);
    if (ACTIVE_STATUS.has(status)) return true;
    if (INACTIVE_STATUS.has(status)) return false;
    return status !== "";
};

export default function OssariosComponent() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingDeleteItem, setPendingDeleteItem] = useState(null);
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

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get("/ossarios");
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar ossários", error);
            setItems([]);
            showError("Erro ao carregar ossários");
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const normalizedItems = useMemo(() => items.map((item) => ({
        ...item,
        tipo: normalizeType(item.tipo) || item.tipo,
        active: isOssarioActive(item),
    })), [items]);

    const filteredItems = useMemo(() => {
        const q = normalizeSearchText(query);

        return normalizedItems.filter((item) => {
            const matchesSearch = !q || [item.numero, item.tipo, item.status, item.capacidade, item.obs].some((field) => normalizeSearchText(field).includes(q));
            const matchesStatus = statusFilter === "all"
                || (statusFilter === "active" && item.active)
                || (statusFilter === "inactive" && !item.active);
            return matchesSearch && matchesStatus;
        });
    }, [normalizedItems, query, statusFilter]);

    const stats = useMemo(() => {
        const total = normalizedItems.length;
        const active = normalizedItems.filter((item) => item.active).length;
        const inactive = total - active;
        const collective = normalizedItems.filter((item) => normalizeType(item.tipo) === "coletivo").length;
        const familiar = normalizedItems.filter((item) => normalizeType(item.tipo) === "familiar").length;

        return {
            total,
            active,
            inactive,
            collective,
            familiar,
        };
    }, [normalizedItems]);

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const openModal = () => {
        setIsEditing(true);
        openCreate();
    };

    const validateForm = () => {
        const nextErrors = {};
        if (!form.numero.trim()) nextErrors.numero = "Informe o número do ossário";
        if (!form.tipo.trim()) nextErrors.tipo = "Informe o tipo do ossário";
        if (!form.status.trim()) nextErrors.status = "Informe o status do ossário";
        if (!String(form.capacidade).trim()) {
            nextErrors.capacidade = "Informe a capacidade do ossário";
        } else if (!Number.isFinite(Number(form.capacidade)) || Number(form.capacidade) <= 0) {
            nextErrors.capacidade = "Informe uma capacidade maior que zero";
        }

        const numeroNormalizado = form.numero.trim().toLowerCase();
        const duplicated = items.some(
            (item) => item.id !== editingId && String(item.numero || "").trim().toLowerCase() === numeroNormalizado
        );
        if (duplicated) {
            nextErrors.numero = "Já existe um ossário com esse número";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        if (!validateForm()) return;
 
        setIsSubmitting(true);
        try {
            const payload = {
                numero: form.numero.trim(),
                tipo: normalizeType(form.tipo) || form.tipo,
                status: form.status,
                capacidade: Number(form.capacidade),
                obs: form.obs.trim(),
            };

            if (editingId) {
                await api.put(`/ossarios/${editingId}`, {
                    ...payload,
                    id: editingId,
                });
                showSuccess("Ossário atualizado com sucesso.");
            } else {
                await api.post("/ossarios", payload);
                showSuccess("Ossário cadastrado com sucesso.");
            }

            await loadItems();
            if (editingId) {
                setIsEditing(false);
            } else {
                closeModal();
            }
        } catch (error) {
            console.error("Erro ao salvar ossário", error);
            showError(error?.response?.data?.message || error?.message || "Não foi possível salvar o ossário");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setIsEditing(false);
        openEdit(item.id, {
            numero: item.numero || "",
            tipo: normalizeType(item.tipo) || "coletivo",
            status: normalizeStatus(item.status) || "disponivel",
            capacidade: item.capacidade ?? "",
            obs: item.obs || "",
        });
    };

    const handleCloseModal = () => {
        setIsEditing(false);
        closeModal();
    };

    const handleDelete = async (id) => {
        const target = items.find((item) => String(item.id) === String(id)) || null;
        setPendingDeleteItem(target ? { id: target.id, numero: target.numero } : { id });
    };

    const closeDeleteDialog = () => {
        setPendingDeleteItem(null);
    };

    const confirmDelete = async () => {
        if (!pendingDeleteItem?.id) return;

        setIsSubmitting(true);
        try {
            await api.delete(`/ossarios/${pendingDeleteItem.id}`);
            showSuccess("Ossário excluído com sucesso");
            await loadItems();
            closeDeleteDialog();
        } catch (error) {
            console.error("Erro ao excluir ossário", error);
            showError(error?.response?.data?.message || error?.message || "Não foi possível excluir o ossário");
        } finally {
            setIsSubmitting(false);
        }
    };

    const clearFilters = () => {
        setQuery("");
        setStatusFilter("all");
    };

    const isViewingExisting = Boolean(editingId) && !isEditing;

    const ossarioViewFields = [
        ["Número do ossário", form.numero],
        ["Tipo", typeLabel(form.tipo)],
        ["Status", statusLabel(form.status)],
        ["Capacidade", form.capacidade || "-"],
        ["Observações", form.obs],
    ];

    return (
        <>
            {ToastElement}
            <ConfirmationDialog
                open={Boolean(pendingDeleteItem)}
                onClose={closeDeleteDialog}
                onConfirm={confirmDelete}
                title="Excluir ossário"
                alertSeverity="error"
                alertMessage="Esta ação removerá o ossário do sistema."
                description={pendingDeleteItem ? `Deseja realmente excluir o ossário ${pendingDeleteItem.numero || pendingDeleteItem.id}?` : "Confirme a exclusão do ossário."}
                confirmLabel="Excluir"
                confirmTone="delete"
                confirmDisabled={!pendingDeleteItem}
                isSubmitting={isSubmitting}
                ariaDescriptionId="ossario-delete-dialog-description"
            />
            <Container>
                <PageHeader>
                    <HeaderCopy>
                        <Title>Controle de Ossários</Title>
                        <Subtitle>Gerencie os ossários cadastrados e acompanhe a distribuição entre coletivos e familiares.</Subtitle>
                    </HeaderCopy>

                    <HeaderActions>
                        <SystemButton type="button" onClick={openModal} disabled={isSubmitting}>
                            <FaPlus /> Novo Ossário
                        </SystemButton>
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
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Pesquisar por número, tipo, status ou observações..."
                                />
                            </SearchWrapper>

                            <FilterSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                                <option value="all">Situação: Todas</option>
                                <option value="active">Situação: Ativos</option>
                                <option value="inactive">Situação: Inativos</option>
                            </FilterSelect>

                            <SystemButton type="button" tone="cancel" onClick={clearFilters} sx={{ minHeight: 50 }}>
                                <FaFilter /> Limpar filtros
                            </SystemButton>
                        </FilterGrid>

                        {isLoading ? <p style={{ margin: 0, color: "#6c7293" }}>Carregando dados...</p> : null}
                        {stats.total === 0 && !isLoading ? <p style={{ margin: 0, color: "#8a5a00" }}>Nenhum ossário cadastrado.</p> : null}
                    </FormStyled>
                </FiltersPanel>

                <StatsGrid>
                    <StatCard>
                        <StatIcon $tone="success"><RiArchiveDrawerFill /></StatIcon>
                        <StatCopy>
                            <StatLabel>Ossários cadastrados</StatLabel>
                            <StatValue>{stats.total}</StatValue>
                            <StatHint>Total no cadastro</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaCheckCircle /></StatIcon>
                        <StatCopy>
                            <StatLabel>Ossários ativos</StatLabel>
                            <StatValue>{stats.active}</StatValue>
                            <StatHint>Disponíveis para uso</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaTimesCircle /></StatIcon>
                        <StatCopy>
                            <StatLabel>Ossários inativos</StatLabel>
                            <StatValue>{stats.inactive}</StatValue>
                            <StatHint>Bloqueados/arquivados</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaChartPie /></StatIcon>
                        <StatCopy>
                            <StatLabel>Coletivos x familiares</StatLabel>
                            <StatValue>{stats.collective} / {stats.familiar}</StatValue>
                            <StatHint>Distribuição por tipo</StatHint>
                        </StatCopy>
                    </StatCard>
                </StatsGrid>

                <Card>
                    <CardBody>
                        <CardTitle>Ossários cadastrados</CardTitle>
                        <TableWrapper>
                            <TableScroller>
                                <Table $minWidth="780px">
                                    <THead>
                                        <Tr>
                                            <Th>Número</Th>
                                            <Th>Tipo</Th>
                                            <Th>Status</Th>
                                            <Th>Capacidade</Th>
                                            <Th>Observações</Th>
                                            <Th>Ações</Th>
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item, index) => (
                                                <Tr key={item.id} index={index}>
                                                    <Td>{item.numero}</Td>
                                                    <Td>{typeLabel(item.tipo)}</Td>
                                                    <TdStatus>
                                                        <StatusBadge $status={normalizeStatus(item.status)}>
                                                            {statusLabel(item.status)}
                                                        </StatusBadge>
                                                    </TdStatus>
                                                    <Td>{item.capacidade ?? "-"}</Td>
                                                    <Td>{item.obs || "-"}</Td>
                                                    <Td>
                                                        <Actions>
                                                            <IconBtn type="button" onClick={() => handleEdit(item)} disabled={isSubmitting}>
                                                                <FaRegEdit />
                                                            </IconBtn>
                                                            <IconBtn type="button" onClick={() => handleDelete(item.id)} disabled={isSubmitting}>
                                                                <FaTrash />
                                                            </IconBtn>
                                                        </Actions>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={6}>Nenhum ossário encontrado.</Td>
                                            </Tr>
                                        )}
                                    </TBody>
                                </Table>
                            </TableScroller>
                        </TableWrapper>
                    </CardBody>
                </Card>

                <DefaultModal
                    open={modalOpen}
                    title={editingId ? (isEditing ? "Editar ossário" : "Detalhes do ossário")
                        : "Novo ossário"}
                    subtitle={"Visualização completa dos cemitérios cadastrados."}
                    closeOnOverlay={false}
                    onClose={handleCloseModal}
                >
                    <form onSubmit={handleSave}>
                        {isViewingExisting ? (
                            <DefaultModalViewGrid>
                                {ossarioViewFields.map(([label, value]) => (
                                    <DefaultModalInfoField key={label} label={label} value={value} />
                                ))}
                            </DefaultModalViewGrid>
                        ) : (
                            <DefaultModalGrid>
                                <div>
                                    <label>Número do ossário</label>
                                    <Input
                                        value={form.numero}
                                        onChange={(event) => updateField("numero", event.target.value)}
                                        placeholder="Ex: 01"
                                        disabled={isSubmitting}
                                    />
                                    {errors.numero ? <p style={errorStyle}>{errors.numero}</p> : null}
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
                                        sx={{
                                            "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                                            "& .MuiOutlinedInput-input": { fontSize: "14px" },
                                        }}
                                    >
                                        {TYPE_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    {errors.tipo ? <p style={errorStyle}>{errors.tipo}</p> : null}
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
                                            "& .MuiOutlinedInput-root": { borderRadius: "12px" },
                                            "& .MuiOutlinedInput-input": { fontSize: "14px" },
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
                                    <label>Capacidade</label>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={form.capacidade}
                                        onChange={(event) => updateField("capacidade", event.target.value)}
                                        placeholder="Ex: 12"
                                        disabled={isSubmitting}
                                    />
                                    {errors.capacidade ? <p style={errorStyle}>{errors.capacidade}</p> : null}
                                </div>

                                <FullWidthField>
                                    <label>Observações</label>
                                    <Textarea
                                        value={form.obs}
                                        onChange={(event) => updateField("obs", event.target.value)}
                                        placeholder="Observações gerais"
                                        disabled={isSubmitting}
                                        rows={4}
                                    />
                                </FullWidthField>
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
