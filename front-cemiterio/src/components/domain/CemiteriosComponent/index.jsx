import React, { useCallback, useEffect, useMemo, useState } from "react";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import {
    FaChartPie,
    FaCheckCircle,
    FaClock,
    FaFilter,
    FaMapMarkerAlt,
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
    FilterSelect,
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
import { createCemeteries, getCemeteries, updateCemeteries } from "../../../services/cemeteryService.js";
import { getBlocks } from "../../../services/blockService.js";
import { getGrave } from "../../../services/graveService.js";
import { getSepultamentos } from "../../../services/sepultamentoService.js";
import { getExumacoes } from "../../../services/exumacaoService.js";
import { formatDateDMY, formatDateTimeDMY, normalizeSearchText, parseDateValue } from "../../../utils";
import { useFormModal, useToastFeedback } from "../../../hooks";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import SystemButton from "../../common/SystemButton";
import DefaultModal, {
    DefaultModalActions,
    DefaultModalGrid,
    DefaultModalInfoField,
    DefaultModalViewGrid,
} from "../../common/DefaultModal";

const INITIAL_FORM = {
    name: "",
    foundation: "",
    active: true,
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

const getCemeteryActive = (cemetery) => cemetery?.active !== false && String(cemetery?.status ?? "").trim().toLowerCase() !== "inactive";

const getBlockId = (record) => String(record?.quadra_sep ?? record?.blockId ?? record?.block ?? record?.id ?? "").trim();

const isCompletedSepultamento = (sepultamento) => {
    if (!sepultamento || sepultamento.foi_exumado) return false;
    const confirmed = sepultamento.confirmado === true || String(sepultamento.confirmado).toLowerCase() === "true";
    const concluded = String(sepultamento.status ?? "").toLowerCase().includes("concl");
    return confirmed || concluded;
};

const getMovementDate = (record) => parseDateValue(
    record?.dh_exu
    || record?.dh_sep
    || record?.updated_at
    || record?.created_at
    || record?.updatedAt
    || record?.createdAt
);

const formatMovementLabel = (movement) => {
    if (!movement) return "Sem movimentação registrada";
    const dateLabel = movement.date ? formatDateTimeDMY(movement.date, formatDateDMY(movement.date, "")) : "";
    if (!dateLabel) return movement.type || "Movimentação";
    return `${movement.type || "Movimentação"} em ${dateLabel}`;
};

export default function CemiteriosComponent() {
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [cemeteries, setCemeteries] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [graves, setGraves] = useState([]);
    const [sepultamentos, setSepultamentos] = useState([]);
    const [exumacoes, setExumacoes] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [pendingToggleCemetery, setPendingToggleCemetery] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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
    const { showSuccess, showError, ToastElement } = useToastFeedback();

    const loadItems = useCallback(async () => {
        setIsLoading(true);
        try {
            const [cemeteriesResult, blocksResult, gravesResult, sepultamentosResult, exumacoesResult] = await Promise.allSettled([
                getCemeteries(),
                getBlocks(),
                getGrave(),
                getSepultamentos(),
                getExumacoes(),
            ]);

            const normalizeResult = (result) => (result.status === "fulfilled" && Array.isArray(result.value) ? result.value : []);

            setCemeteries(normalizeResult(cemeteriesResult));
            setBlocks(normalizeResult(blocksResult));
            setGraves(normalizeResult(gravesResult));
            setSepultamentos(normalizeResult(sepultamentosResult));
            setExumacoes(normalizeResult(exumacoesResult));
        } catch (error) {
            console.error("Erro ao carregar cemitérios", error);
            setCemeteries([]);
            setBlocks([]);
            setGraves([]);
            setSepultamentos([]);
            setExumacoes([]);
            showError("Erro ao carregar cemitérios");
        } finally {
            setIsLoading(false);
        }
    }, [showError]);

    useEffect(() => {
        loadItems();
    }, [loadItems]);

    const normalizedCemeteries = useMemo(() => cemeteries.map((cemetery) => ({
        ...cemetery,
        active: getCemeteryActive(cemetery),
    })), [cemeteries]);

    const filteredItems = useMemo(() => {
        const q = normalizeSearchText(query);

        return normalizedCemeteries.filter((item) => {
            const matchesSearch = !q || [item.name, item.foundation].some((field) => normalizeSearchText(field).includes(q));
            const matchesStatus = statusFilter === "all"
                || (statusFilter === "active" && item.active)
                || (statusFilter === "inactive" && !item.active);
            return matchesSearch && matchesStatus;
        });
    }, [normalizedCemeteries, query, statusFilter]);

    const stats = useMemo(() => {
        const cemeteriesById = new Map(normalizedCemeteries.map((cemetery) => [String(cemetery.id), cemetery]));
        const blockToCemeteryId = new Map(blocks.map((block) => [String(block.id), String(block.cemeteryId ?? "")]));
        const gravesByBlockId = new Map();

        graves.forEach((grave) => {
            const blockId = String(grave.blockId ?? grave.block ?? "").trim();
            if (!blockId) return;
            if (!gravesByBlockId.has(blockId)) gravesByBlockId.set(blockId, []);
            gravesByBlockId.get(blockId).push(grave);
        });

        const movements = [];

        sepultamentos.forEach((sepultamento) => {
            const date = getMovementDate(sepultamento);
            const blockId = getBlockId(sepultamento);
            const cemeteryId = blockToCemeteryId.get(blockId);
            if (!date || !cemeteryId) return;
            movements.push({
                date,
                type: "Sepultamento",
                cemeteryId,
            });
        });

        exumacoes.forEach((exumacao) => {
            const date = getMovementDate(exumacao);
            const blockId = getBlockId(exumacao);
            const cemeteryId = blockToCemeteryId.get(blockId);
            if (!date || !cemeteryId) return;
            movements.push({
                date,
                type: "Exumação",
                cemeteryId,
            });
        });

        movements.sort((a, b) => b.date.getTime() - a.date.getTime());

        const totals = normalizedCemeteries.reduce((acc, cemetery) => {
            const cemeteryId = String(cemetery.id);
            const cemeteryBlocks = blocks.filter((block) => String(block.cemeteryId ?? "") === cemeteryId);
            const blockIds = new Set(cemeteryBlocks.map((block) => String(block.id)));
            const cemeteryGraves = graves.filter((grave) => blockIds.has(String(grave.blockId ?? grave.block ?? "")));

            const totalCapacity = cemeteryGraves.reduce((sum, grave) => {
                const capacity = Number(grave.bodyCapacity ?? grave.capacidade ?? 0);
                return sum + (Number.isFinite(capacity) && capacity > 0 ? capacity : 0);
            }, 0);

            const occupiedSpaces = sepultamentos.filter((sepultamento) => {
                if (!isCompletedSepultamento(sepultamento)) return false;
                const blockId = getBlockId(sepultamento);
                return blockIds.has(blockId);
            }).length;

            const occupancyRate = totalCapacity > 0 ? (occupiedSpaces / totalCapacity) * 100 : 0;

            acc.totalCemeteries += 1;
            acc.activeCemeteries += cemetery.active ? 1 : 0;
            acc.inactiveCemeteries += cemetery.active ? 0 : 1;
            acc.totalCapacity += totalCapacity;
            acc.occupiedSpaces += occupiedSpaces;
            acc.cemeterySummaries.push({
                id: cemetery.id,
                name: cemetery.name || "-",
                foundation: cemetery.foundation || "",
                active: cemetery.active,
                blocksCount: cemeteryBlocks.length,
                gravesCount: cemeteryGraves.length,
                totalCapacity,
                occupiedSpaces,
                occupancyRate,
            });
            return acc;
        }, {
            totalCemeteries: normalizedCemeteries.length,
            activeCemeteries: 0,
            inactiveCemeteries: 0,
            totalCapacity: 0,
            occupiedSpaces: 0,
            cemeterySummaries: [],
        });

        const latestMovement = movements[0] ? {
            ...movements[0],
            cemeteryName: cemeteriesById.get(String(movements[0].cemeteryId))?.name || "-",
        } : null;

        const utilization = totals.totalCapacity > 0 ? (totals.occupiedSpaces / totals.totalCapacity) * 100 : 0;

        return {
            ...totals,
            utilization,
            latestMovement,
        };
    }, [blocks, exumacoes, graves, normalizedCemeteries, sepultamentos]);

    const clearFilters = () => {
        setQuery("");
        setStatusFilter("all");
    };

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

        if (!form.name.trim()) nextErrors.name = "Informe o nome do cemitério";
        if (!form.foundation.trim()) nextErrors.foundation = "Informe a data de fundação";
        if (form.foundation && !parseDateValue(form.foundation)) nextErrors.foundation = "Data de fundação em formato inválido";

        const normalizedName = normalizeSearchText(form.name);
        const duplicated = normalizedCemeteries.some(
            (cemetery) => cemetery.id !== editingId && normalizedName && normalizeSearchText(cemetery.name) === normalizedName
        );
        if (duplicated) {
            nextErrors.name = "Já existe um cemitério com esse nome";
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
                name: form.name.trim(),
                foundation: form.foundation,
                active: Boolean(form.active),
            };

            if (editingId) {
                await updateCemeteries(editingId, {
                    ...payload,
                    id: editingId,
                });
                showSuccess("Cemitério atualizado com sucesso.");
            } else {
                await createCemeteries(payload);
                showSuccess("Cemitério cadastrado com sucesso.");
            }

            await loadItems();
            if (editingId) {
                setIsEditing(false);
            } else {
                closeModal();
            }
        } catch (error) {
            console.error("Erro ao salvar cemitério", error);
            showError(error?.response?.data?.message || error?.message || "Não foi possível salvar o cemitério");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setIsEditing(false);
        openEdit(item.id, {
            name: item.name || "",
            foundation: item.foundation || "",
            active: item.active !== false,
        });
    };

    const handleCloseModal = () => {
        setIsEditing(false);
        closeModal();
    };

    const isViewingExisting = Boolean(editingId) && !isEditing;

    const cemeteryViewFields = [
        ["Nome", form.name],
        ["Data de fundação", formatDateDMY(form.foundation, "-")],
        ["Status", form.active ? "Ativo" : "Inativo"],
    ];

    const handleToggleStatus = async (item) => {
        setPendingToggleCemetery(item);
    };

    const closeToggleDialog = () => {
        setPendingToggleCemetery(null);
    };

    const confirmToggleStatus = async () => {
        const item = pendingToggleCemetery;
        if (!item) return;

        setIsSubmitting(true);
        try {
            const nextActive = !item.active;
            await updateCemeteries(item.id, {
                ...item,
                active: nextActive,
            });
            await loadItems();
            closeToggleDialog();
        } catch (error) {
            console.error("Erro ao alterar status do cemitério", error);
            showError(error?.response?.data?.message || error?.message || "Não foi possível alterar o status do cemitério");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {ToastElement}
            <ConfirmationDialog
                open={Boolean(pendingToggleCemetery)}
                onClose={closeToggleDialog}
                onConfirm={confirmToggleStatus}
                title={pendingToggleCemetery?.active ? "Inativar cemitério" : "Ativar cemitério"}
                alertSeverity={pendingToggleCemetery?.active ? "warning" : "success"}
                alertMessage={pendingToggleCemetery?.active ? "O cemitério ficará indisponível para novos registros." : "O cemitério voltará a ficar disponível para uso."}
                description={pendingToggleCemetery ? `Deseja ${pendingToggleCemetery.active ? "inativar" : "ativar"} o cemitério ${pendingToggleCemetery.name}?` : "Confirme a alteração de status do cemitério."}
                confirmLabel={pendingToggleCemetery?.active ? "Inativar" : "Ativar"}
                confirmTone={pendingToggleCemetery?.active ? "delete" : "confirm"}
                confirmDisabled={!pendingToggleCemetery}
                isSubmitting={isSubmitting}
                ariaDescriptionId="cemiterio-status-dialog-description"
            />
            <Container>
                <PageHeader>
                    <HeaderCopy>
                        <Title>Controle de Cemitérios</Title>
                        <Subtitle>Gerencie os cemitérios cadastrados e acompanhe a capacidade disponível e a última movimentação.</Subtitle>
                    </HeaderCopy>

                    <HeaderActions>
                        <SystemButton type="button" onClick={openModal} disabled={isSubmitting}>
                            <FaPlus /> Novo Cemitério
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
                                    value={query}
                                    onChange={(event) => setQuery(event.target.value)}
                                    placeholder="Buscar por nome ou fundação..."
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
                                <InputLabel sx={filterLabelSx}>Situação</InputLabel>
                                <Select value={statusFilter} label="Situação" onChange={(event) => setStatusFilter(event.target.value)} sx={filterSelectSx}>
                                    <MenuItem value="all">Todas</MenuItem>
                                    <MenuItem value="active">Ativos</MenuItem>
                                    <MenuItem value="inactive">Inativos</MenuItem>
                                </Select>
                            </FormControl>

                            <SystemButton type="button" tone="cancel" onClick={clearFilters} sx={{ minHeight: 50 }}>
                                <FaFilter /> Limpar filtros
                            </SystemButton>
                        </FilterGrid>

                        {isLoading ? <p style={{ margin: 0, color: "#6c7293" }}>Carregando dados...</p> : null}
                        {stats.totalCemeteries === 0 && !isLoading ? <p style={{ margin: 0, color: "#8a5a00" }}>Nenhum cemitério cadastrado.</p> : null}
                    </FormStyled>
                </FiltersPanel>

                <StatsGrid>
                    <StatCard>
                        <StatIcon $tone="success"><FaMapMarkerAlt /></StatIcon>
                        <StatCopy>
                            <StatLabel>Cemitérios cadastrados</StatLabel>
                            <StatValue>{stats.totalCemeteries}</StatValue>
                            <StatHint>Total no cadastro</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaCheckCircle /></StatIcon>
                        <StatCopy>
                            <StatLabel>Cemitérios ativos</StatLabel>
                            <StatValue>{stats.activeCemeteries}</StatValue>
                            <StatHint>Disponíveis para uso</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaTimesCircle /></StatIcon>
                        <StatCopy>
                            <StatLabel>Cemitérios inativos</StatLabel>
                            <StatValue>{stats.inactiveCemeteries}</StatValue>
                            <StatHint>Bloqueados/arquivados</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaChartPie /></StatIcon>
                        <StatCopy>
                            <StatLabel>Capacidade x ocupação</StatLabel>
                            <StatValue>{stats.utilization.toFixed(1).replace(".", ",")}%</StatValue>
                            <StatHint>{stats.occupiedSpaces} ocupados de {stats.totalCapacity} vagas</StatHint>
                        </StatCopy>
                    </StatCard>

                    <StatCard>
                        <StatIcon $tone="success"><FaClock /></StatIcon>
                        <StatCopy>
                            <StatLabel>Última movimentação</StatLabel>
                            <StatValue>{stats.latestMovement?.cemeteryName || "Sem registro"}</StatValue>
                            <StatHint>{formatMovementLabel(stats.latestMovement)}</StatHint>
                        </StatCopy>
                    </StatCard>
                </StatsGrid>

                <Card>
                    <CardBody>
                        <CardTitle>Cemitérios cadastrados</CardTitle>
                        <TableWrapper>
                            <TableScroller>
                                <Table $minWidth="780px">
                                    <THead>
                                        <Tr>
                                            <Th>Nome</Th>
                                            <Th>Fundação</Th>
                                            <Th>Status</Th>
                                            <Th>Ações</Th>
                                        </Tr>
                                    </THead>
                                    <TBody>
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item, index) => (
                                                <Tr key={item.id} index={index}>
                                                    <Td>{item.name}</Td>
                                                    <Td>{formatDateDMY(item.foundation, "-")}</Td>
                                                    <TdStatus>
                                                        <StatusBadge $status={item.active ? "ativo" : "inativo"}>
                                                            {item.active ? "Ativo" : "Inativo"}
                                                        </StatusBadge>
                                                    </TdStatus>
                                                    <Td>
                                                        <Actions>
                                                            <IconBtn type="button" onClick={() => handleEdit(item)} disabled={isSubmitting}>
                                                                <FaRegEdit />
                                                            </IconBtn>
                                                            <IconBtn
                                                                type="button"
                                                                onClick={() => handleToggleStatus(item)}
                                                                disabled={isSubmitting}
                                                                data-danger={item.active ? "true" : undefined}
                                                            >
                                                                <FaPowerOff />
                                                            </IconBtn>
                                                        </Actions>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <Tr>
                                                <Td colSpan={4}>Nenhum cemitério encontrado.</Td>
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
                    title={editingId ? (isEditing ? "Editar cemitério" : "Detalhes do cemitério") : "Novo cemitério"}
                    subtitle={"Visualização completa dos cemitérios cadastrados."}
                    onClose={handleCloseModal}
                >
                    <form onSubmit={handleSave}>
                        {isViewingExisting ? (
                            <DefaultModalViewGrid>
                                {cemeteryViewFields.map(([label, value]) => (
                                    <DefaultModalInfoField key={label} label={label} value={value} />
                                ))}
                            </DefaultModalViewGrid>
                        ) : (
                            <DefaultModalGrid>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label>Nome</label>
                                    <Input
                                        value={form.name}
                                        onChange={(event) => updateField("name", event.target.value)}
                                        placeholder="Nome do cemitério"
                                        disabled={isSubmitting}
                                    />
                                    {errors.name ? <p style={errorStyle}>{errors.name}</p> : null}
                                </div>

                                <div>
                                    <label>Data de fundação</label>
                                    <Input
                                        type="date"
                                        value={form.foundation}
                                        onChange={(event) => updateField("foundation", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.foundation ? <p style={errorStyle}>{errors.foundation}</p> : null}
                                </div>

                                <div>
                                    <label>Status</label>
                                    <FilterSelect
                                        value={form.active ? "active" : "inactive"}
                                        onChange={(event) => updateField("active", event.target.value === "active")}
                                        disabled={isSubmitting}
                                    >
                                        <option value="active">Ativo</option>
                                        <option value="inactive">Inativo</option>
                                    </FilterSelect>
                                </div>
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
