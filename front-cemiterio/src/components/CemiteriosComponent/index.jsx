import React, { useCallback, useEffect, useMemo, useState } from "react";
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
} from "./styles.js";
import { createCemeteries, getCemeteries, updateCemeteries } from "../../services/cemeteryService.js";
import { getBlocks } from "../../services/blockService.js";
import { getGrave } from "../../services/graveService.js";
import { getSepultamentos } from "../../services/sepultamentoService.js";
import { getExumacoes } from "../../services/exumacaoService.js";
import { formatDateDMY, formatDateTimeDMY, parseDateValue } from "../../utils/date";
import { useToastFeedback } from "../../hooks/ToastFeedback/useToastFeedback.jsx";

const INITIAL_FORM = {
    name: "",
    foundation: "",
    active: true,
};

const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

const normalizeSearchText = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

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
    const [modalOpen, setModalOpen] = useState(false);
    const [cemeteries, setCemeteries] = useState([]);
    const [blocks, setBlocks] = useState([]);
    const [graves, setGraves] = useState([]);
    const [sepultamentos, setSepultamentos] = useState([]);
    const [exumacoes, setExumacoes] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
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
            closeModal();
        } catch (error) {
            console.error("Erro ao salvar cemitério", error);
            showError(error?.response?.data?.message || error?.message || "Não foi possível salvar o cemitério");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name || "",
            foundation: item.foundation || "",
            active: item.active !== false,
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleToggleStatus = async (item) => {
        const nextActive = !item.active;
        const ok = window.confirm(`${nextActive ? "Ativar" : "Inativar"} o cemitério ${item.name}?`);
        if (!ok) return;

        setIsSubmitting(true);
        try {
            await updateCemeteries(item.id, {
                ...item,
                active: nextActive,
            });
            await loadItems();
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
        <Container>
            <PageHeader>
                <HeaderCopy>
                    <Title>Controle de Cemitérios</Title>
                    <Subtitle>Gerencie os cemitérios cadastrados e acompanhe a capacidade disponível e a última movimentação.</Subtitle>
                </HeaderCopy>

                <HeaderActions>
                    <PrimaryActionButton type="button" onClick={openModal} disabled={isSubmitting}>
                        <FaPlus /> Novo Cemitério
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
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Buscar por nome ou fundação..."
                            />
                        </SearchWrapper>

                        <FilterSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                            <option value="all">Situação: Todas</option>
                            <option value="active">Situação: Ativos</option>
                            <option value="inactive">Situação: Inativos</option>
                        </FilterSelect>

                        <SecondaryButton type="button" onClick={clearFilters}>
                            <FaFilter /> Limpar filtros
                        </SecondaryButton>
                    </FilterGrid>

                    {isLoading ? <p style={{ margin: 0, color: "#6c7293" }}>Carregando dados...</p> : null}
                    {stats.totalCemeteries === 0 && !isLoading ? <p style={{ margin: 0, color: "#8a5a00" }}>Nenhum cemitério cadastrado.</p> : null}
                </FormStyled>
            </FiltersPanel>

            <StatsGrid>
                <StatCard>
                    <StatIcon><FaMapMarkerAlt /></StatIcon>
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
                    <StatIcon $tone="danger"><FaTimesCircle /></StatIcon>
                    <StatCopy>
                        <StatLabel>Cemitérios inativos</StatLabel>
                        <StatValue>{stats.inactiveCemeteries}</StatValue>
                        <StatHint>Bloqueados/arquivados</StatHint>
                    </StatCopy>
                </StatCard>

                <StatCard>
                    <StatIcon $tone="warning"><FaChartPie /></StatIcon>
                    <StatCopy>
                        <StatLabel>Capacidade x ocupação</StatLabel>
                        <StatValue>{stats.utilization.toFixed(1).replace(".", ",")}%</StatValue>
                        <StatHint>{stats.occupiedSpaces} ocupados de {stats.totalCapacity} vagas</StatHint>
                    </StatCopy>
                </StatCard>

                <StatCard>
                    <StatIcon><FaClock /></StatIcon>
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
                            <Table>
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

            {modalOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <CardTitle>{editingId ? "Editar cemitério" : "Novo cemitério"}</CardTitle>

                        <form onSubmit={handleSave}>
                            <ModalGrid>
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
