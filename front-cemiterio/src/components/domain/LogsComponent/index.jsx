import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import {
    FaChevronLeft,
    FaChevronRight,
    FaClock,
    FaCopy,
    FaDownload,
    FaEllipsisV,
    FaExternalLinkAlt,
    FaFilter,
    FaSearch,
    FaShieldAlt,
    FaExclamationTriangle,
    FaUsers,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDateTimeDMY } from "../../../utils/date.js";
import { useSystemLogs } from "../../../hooks";
import {
    LOG_ACTION_META,
    LOG_STATUS_META,
    LOG_UNKNOWN_ACTOR_NAME,
    LOG_UNKNOWN_ACTOR_SOURCE_LABEL,
} from "../../../services/logsData.js";
import SystemButton from "../../common/SystemButton";
import DrawerComponent, { DrawerActionRow } from "../../common/DrawerComponent";
import EventTimeline from "../../common/EventTimeline";
import {
    ActionButton,
    Badge,
    ChangeCard,
    ChangeField,
    ChangesList,
    Container,
    DiffCell,
    DiffGrid,
    DiffLabel,
    DiffValue,
    EmptyState,
    EmptyText,
    EmptyTitle,
    FilterGrid,
    FilterHintRow,
    FilterSummary,
    FilterTopRow,
    FiltersPanel,
    HeaderActions,
    HeaderCopy,
    InfoGrid,
    InfoLabel,
    InfoTile,
    InfoValue,
    PageHeader,
    PaginationBar,
    PaginationButton,
    PaginationButtons,
    PaginationSummary,
    RowActionGroup,
    SearchWrapper,
    SectionCard,
    SectionHint,
    SectionHeader,
    SectionTitle,
    StatCard,
    StatCopy,
    StatHint,
    StatIcon,
    StatLabel,
    StatValue,
    StatsGrid,
    TdMeta,
    TdStack,
    TdTitle,
    Title,
    Subtitle,
} from "./styles.js";
import { Table, TableCard, TableScroller, TableTitle, TBody, Td, Th, THead, Tr } from "../../common/DefaultTable";

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
        borderColor: "#191970",
        boxShadow: "0 0 0 4px rgba(74, 47, 227, 0.08)",
    },
};

const filterTextFieldSx = {
    "& .MuiInputBase-root": { borderRadius: "12px", backgroundColor: "#fff" },
    "& .MuiOutlinedInput-root": { borderRadius: "12px" },
    "& .MuiOutlinedInput-notchedOutline": { borderRadius: "12px" },
    "& .MuiOutlinedInput-input": { fontSize: "14px" },
};

const formatRelative = (value) => {
    if (!value) return "";
    return formatDistanceToNow(new Date(value), { addSuffix: true, locale: ptBR });
};

const getActionMeta = (action) => LOG_ACTION_META[action] || { label: action, tone: "access" };

const getStatusMeta = (status) => LOG_STATUS_META[status] || { label: status, tone: "warning" };

const getActorName = (log) => (log?.user?.isKnown ? log.user.name : LOG_UNKNOWN_ACTOR_NAME);

const getActorSourceLabel = (log) =>
    log?.user?.sourceLabel || (log?.user?.isKnown ? "Sessão autenticada" : LOG_UNKNOWN_ACTOR_SOURCE_LABEL);

const formatListValue = (value) => (value == null || value === "" ? "—" : String(value));

const formatFieldLabel = (value) =>
    String(value || "")
        .replace(/_/g, " ")
        .replace(/\b\w/g, (match) => match.toUpperCase());

const buildPaginationItems = (currentPage, totalPages) => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);

    const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
    const items = [];
    let previous = null;

    Array.from(pages)
        .filter((page) => page > 0 && page <= totalPages)
        .sort((left, right) => left - right)
        .forEach((page) => {
            if (previous && page - previous > 1) {
                items.push(`ellipsis-${previous}`);
            }
            items.push(page);
            previous = page;
        });

    return items;
};

const downloadJson = (filename, payload) => {
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
};

const buildLogExportPayload = (logs = []) => ({
    generatedAt: new Date().toISOString(),
    total: logs.length,
    records: logs.map((log) => ({
        id: log.id,
        codigo: log.eventCode,
        dataHora: formatDateTimeDMY(log.timestamp, "-"),
        timestamp: log.timestamp,
        usuario: getActorName(log),
        usuarioId: log.user?.id || null,
        usuarioLogin: log.user?.username || null,
        usuarioPerfil: log.user?.role || null,
        usuarioIdentificado: Boolean(log.user?.isKnown),
        usuarioOrigem: getActorSourceLabel(log),
        modulo: log.module || "-",
        acao: getActionMeta(log.action).label,
        status: getStatusMeta(log.status).label,
        descricao: log.description || "-",
        entidade: log.entity?.label || "-",
        entidadeId: log.entity?.id || "-",
        origem: log.sourceCollection || "-",
        registroOrigem: log.sourceRecordId || "-",
        alteracoes: (log.changes || []).map((change) => ({
            campo: change.label || formatFieldLabel(change.field),
            chave: change.field,
            valorAnterior: formatListValue(change.before),
            valorNovo: formatListValue(change.after),
        })),
        informacoesAdicionais: Object.fromEntries(
            Object.entries(log.additionalInfo || {}).map(([key, value]) => [
                formatFieldLabel(key),
                formatListValue(value),
            ])
        ),
    })),
});

export default function LogsComponent() {
    const navigate = useNavigate();
    const {
        loading,
        filteredLogs,
        paginatedLogs,
        stats,
        selectedLog,
        selectedRelative,
        page,
        totalPages,
        filters,
        availableUsers,
        availableModules,
        availableEventTypes,
        drawerOpen,
        advancedOpen,
        setPage,
        updateFilter,
        clearFilters,
        openLog,
        closeLog,
    } = useSystemLogs();

    const paginationItems = useMemo(() => buildPaginationItems(page, totalPages), [page, totalPages]);

    const exportLogs = () => {
        const fileName = `logs-sistema-${new Date().toISOString().slice(0, 10)}.json`;
        downloadJson(fileName, buildLogExportPayload(filteredLogs));
    };

    const copyEventId = async () => {
        if (!selectedLog?.id || !navigator?.clipboard) return;
        await navigator.clipboard.writeText(String(selectedLog.id));
    };

    const exportEvent = () => {
        if (!selectedLog) return;
        downloadJson(`evento-${selectedLog.id}.json`, buildLogExportPayload([selectedLog]).records[0]);
    };

    const selectedTimelineItems = useMemo(() => {
        const tone = getStatusMeta(selectedLog?.status).tone;

        return (selectedLog?.timeline || []).map((step, index) => ({
            id: `${step.label}-${step.timestamp || index}`,
            label: step.label,
            text: step.value,
            meta: formatRelative(step.timestamp),
            tone,
        }));
    }, [selectedLog]);

    const viewEntity = () => {
        if (!selectedLog?.entity?.route) return;
        navigate(selectedLog.entity.route);
    };

    const statsCards = [
        {
            label: "Total de eventos",
            value: stats.totalEvents.toLocaleString("pt-BR"),
            hint: "No período selecionado",
            icon: <FaUsers />,
            tone: "success",
        },
        {
            label: "Usuários ativos",
            value: stats.activeUsers.toLocaleString("pt-BR"),
            hint: "Ações distintas rastreadas",
            icon: <FaUsers />,
            tone: "success",
        },
        {
            label: "Eventos críticos",
            value: stats.criticalEvents.toLocaleString("pt-BR"),
            hint: "Alertas e falhas monitoradas",
            icon: <FaExclamationTriangle />,
            tone: "success",
        },
        {
            label: "Última atualização",
            value: stats.latestTimestamp ? formatDateTimeDMY(stats.latestTimestamp, "-") : "-",
            hint: stats.latestTimestamp ? formatRelative(stats.latestTimestamp) : "Sem eventos recentes",
            icon: <FaClock />,
            tone: "success",
        },
    ];

    return (
        <Container>
            <PageHeader>
                <HeaderCopy>
                    <Title>Logs do sistema</Title>
                    <Subtitle>
                        Acompanhe as ações realizadas pelos usuários com rastreabilidade detalhada, antes/depois e
                        trilha de compliance.
                    </Subtitle>
                </HeaderCopy>

                <HeaderActions>
                    <SystemButton type="button" onClick={exportLogs} disabled={loading || filteredLogs.length === 0}>
                        <FaDownload />
                        Exportar logs
                    </SystemButton>
                </HeaderActions>
            </PageHeader>

            <StatsGrid>
                {statsCards.map((card) => (
                    <StatCard key={card.label}>
                        <StatIcon $tone={card.tone}>{card.icon}</StatIcon>
                        <StatCopy>
                            <StatLabel>{card.label}</StatLabel>
                            <StatValue>{card.value}</StatValue>
                            <StatHint>{card.hint}</StatHint>
                        </StatCopy>
                    </StatCard>
                ))}
            </StatsGrid>

            <FiltersPanel>
                <FilterTopRow>
                    <SearchWrapper>
                        <TextField
                            fullWidth
                            size="medium"
                            value={filters.search}
                            placeholder="Buscar por usuário, ação, módulo ou descrição..."
                            onChange={(event) => updateFilter("search", event.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <FaSearch size={14} />
                                    </InputAdornment>
                                ),
                            }}
                            sx={filterTextFieldSx}
                        />
                    </SearchWrapper>

                    <SystemButton type="button" tone="cancel" onClick={clearFilters} sx={{ minHeight: 50 }}>
                        <FaFilter />
                        Limpar filtros
                    </SystemButton>
                </FilterTopRow>

                {advancedOpen ? (
                    <FilterGrid>
                        <TextField
                            type="date"
                            fullWidth
                            size="medium"
                            label="Período inicial"
                            value={filters.periodStart}
                            onChange={(event) => updateFilter("periodStart", event.target.value)}
                            sx={filterTextFieldSx}
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            type="date"
                            fullWidth
                            size="medium"
                            label="Período final"
                            value={filters.periodEnd}
                            onChange={(event) => updateFilter("periodEnd", event.target.value)}
                            sx={filterTextFieldSx}
                            InputLabelProps={{ shrink: true }}
                        />
                        <FormControl fullWidth size="medium">
                            <InputLabel sx={filterLabelSx}>Usuário</InputLabel>
                            <Select
                                value={filters.user}
                                label="Usuário"
                                onChange={(event) => updateFilter("user", event.target.value)}
                                sx={filterSelectSx}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                {availableUsers.map((item) => (
                                    <MenuItem key={item} value={item}>
                                        {item}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="medium">
                            <InputLabel sx={filterLabelSx}>Módulo</InputLabel>
                            <Select
                                value={filters.module}
                                label="Módulo"
                                onChange={(event) => updateFilter("module", event.target.value)}
                                sx={filterSelectSx}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                {availableModules.map((item) => (
                                    <MenuItem key={item} value={item}>
                                        {item}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="medium">
                            <InputLabel sx={filterLabelSx}>Tipo de evento</InputLabel>
                            <Select
                                value={filters.eventType}
                                label="Tipo de evento"
                                onChange={(event) => updateFilter("eventType", event.target.value)}
                                sx={filterSelectSx}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                {availableEventTypes.map((item) => (
                                    <MenuItem key={item} value={item}>
                                        {getActionMeta(item).label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth size="medium">
                            <InputLabel sx={filterLabelSx}>Status</InputLabel>
                            <Select
                                value={filters.status}
                                label="Status"
                                onChange={(event) => updateFilter("status", event.target.value)}
                                sx={filterSelectSx}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="success">Sucesso</MenuItem>
                                <MenuItem value="warning">Alerta</MenuItem>
                                <MenuItem value="failure">Falha</MenuItem>
                            </Select>
                        </FormControl>
                    </FilterGrid>
                ) : null}
            </FiltersPanel>

            <TableCard>
                <TableScroller>
                    <TableTitle>Logs registrados</TableTitle>

                    <Table $minWidth="1220px">
                        <THead>
                            <tr>
                                <Th>Data/Hora</Th>
                                <Th>Usuário</Th>
                                <Th>Módulo</Th>
                                <Th>Ação realizada</Th>
                                <Th>Descrição</Th>
                                <Th>Origem</Th>
                                <Th>Status</Th>
                                <Th>Ações</Th>
                            </tr>
                        </THead>
                        <TBody>
                            {paginatedLogs.map((log, index) => {
                                const actionMeta = getActionMeta(log.action);
                                const statusMeta = getStatusMeta(log.status);

                                return (
                                    <Tr key={log.id} $index={index} $clickable onClick={() => openLog(log)}>
                                        <Td>
                                            <TdStack>
                                                <TdTitle>{formatDateTimeDMY(log.timestamp, "-")}</TdTitle>
                                                <TdMeta>{formatRelative(log.timestamp)}</TdMeta>
                                            </TdStack>
                                        </Td>
                                        <Td>
                                            <TdStack>
                                                <TdTitle>{getActorName(log)}</TdTitle>
                                                <TdMeta>{getActorSourceLabel(log)}</TdMeta>
                                            </TdStack>
                                        </Td>
                                        <Td>
                                            <Badge $tone="access">{log.module}</Badge>
                                        </Td>
                                        <Td>
                                            <Badge $tone={actionMeta.tone}>{actionMeta.label}</Badge>
                                        </Td>
                                        <Td>
                                            <TdStack>
                                                <TdTitle>{log.description}</TdTitle>
                                                <TdMeta>{log.entity?.label || "Entidade não informada"}</TdMeta>
                                            </TdStack>
                                        </Td>
                                        <Td>
                                            <Badge $tone="logout">{log.sourceCollection || "db.json"}</Badge>
                                        </Td>
                                        <Td>
                                            <Badge $tone={statusMeta.tone}>{statusMeta.label}</Badge>
                                        </Td>
                                        <Td>
                                            <RowActionGroup>
                                                <ActionButton
                                                    type="button"
                                                    title="Ver detalhes"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        openLog(log);
                                                    }}
                                                >
                                                    <FaEllipsisV size={14} />
                                                </ActionButton>
                                            </RowActionGroup>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </TBody>
                    </Table>
                </TableScroller>

                {!loading && filteredLogs.length === 0 ? (
                    <EmptyState>
                        <EmptyTitle>Nenhum log encontrado</EmptyTitle>
                        <EmptyText>
                            Ajuste os filtros para visualizar outro recorte de auditoria ou limpe a busca para voltar ao
                            histórico completo.
                        </EmptyText>
                    </EmptyState>
                ) : null}

                <PaginationBar>
                    <PaginationSummary>
                        Exibindo {paginatedLogs.length.toLocaleString("pt-BR")} de{" "}
                        {filteredLogs.length.toLocaleString("pt-BR")} eventos.
                    </PaginationSummary>

                    <PaginationButtons>
                        <PaginationButton
                            type="button"
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                        >
                            <FaChevronLeft size={12} />
                        </PaginationButton>

                        {paginationItems.map((item) => (
                            <PaginationButton
                                key={item}
                                type="button"
                                $active={item === page}
                                disabled={typeof item === "string"}
                                onClick={() => typeof item === "number" && setPage(item)}
                            >
                                {typeof item === "string" ? "…" : item}
                            </PaginationButton>
                        ))}

                        <PaginationButton
                            type="button"
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                        >
                            <FaChevronRight size={12} />
                        </PaginationButton>
                    </PaginationButtons>
                </PaginationBar>
            </TableCard>

            {drawerOpen && selectedLog ? (
                <DrawerComponent
                    open={drawerOpen}
                    title="Detalhe da auditoria"
                    subtitle={`${selectedLog.eventCode} · ${selectedRelative || formatRelative(selectedLog.timestamp)}`}
                    onClose={closeLog}
                >
                    <SectionCard>
                        <SectionHeader>
                            <div>
                                <SectionTitle>Status do evento</SectionTitle>
                                <SectionHint>Badge visual do estado de auditoria.</SectionHint>
                            </div>
                            <Badge $tone={getStatusMeta(selectedLog.status).tone}>
                                {getStatusMeta(selectedLog.status).label}
                            </Badge>
                        </SectionHeader>
                        <InfoGrid>
                            <InfoTile>
                                <InfoLabel>ID do evento</InfoLabel>
                                <InfoValue>{selectedLog.id}</InfoValue>
                            </InfoTile>
                            <InfoTile>
                                <InfoLabel>Timestamp completo</InfoLabel>
                                <InfoValue>{formatDateTimeDMY(selectedLog.timestamp, "-")}</InfoValue>
                            </InfoTile>
                            <InfoTile>
                                <InfoLabel>Data/hora relativa</InfoLabel>
                                <InfoValue>{selectedRelative || formatRelative(selectedLog.timestamp)}</InfoValue>
                            </InfoTile>
                            <InfoTile>
                                <InfoLabel>Código do evento</InfoLabel>
                                <InfoValue>{selectedLog.eventCode}</InfoValue>
                            </InfoTile>
                        </InfoGrid>
                    </SectionCard>

                    <SectionCard>
                        <SectionHeader>
                            <div>
                                <SectionTitle>Informações gerais</SectionTitle>
                                <SectionHint>Autoria da ação e entidade de domínio afetada.</SectionHint>
                            </div>
                        </SectionHeader>
                        <InfoGrid>
                            <InfoTile>
                                <InfoLabel>Usuário responsável</InfoLabel>
                                <InfoValue>{getActorName(selectedLog)}</InfoValue>
                            </InfoTile>
                            <InfoTile>
                                <InfoLabel>Origem da identificação</InfoLabel>
                                <InfoValue>{getActorSourceLabel(selectedLog)}</InfoValue>
                            </InfoTile>
                            <InfoTile>
                                <InfoLabel>Identificador do usuário</InfoLabel>
                                <InfoValue>
                                    {selectedLog.user?.isKnown
                                        ? selectedLog.user.id || selectedLog.user.username || "Não informado"
                                        : "Não disponível"}
                                </InfoValue>
                            </InfoTile>
                            <InfoTile>
                                <InfoLabel>Perfil de acesso</InfoLabel>
                                <InfoValue>
                                    {selectedLog.user?.isKnown
                                        ? selectedLog.user.role || "Não informado"
                                        : "Não disponível"}
                                </InfoValue>
                            </InfoTile>
                            <InfoTile>
                                <InfoLabel>Módulo</InfoLabel>
                                <InfoValue>{selectedLog.module || "-"}</InfoValue>
                            </InfoTile>
                            <InfoTile>
                                <InfoLabel>Ação realizada</InfoLabel>
                                <InfoValue>{getActionMeta(selectedLog.action).label}</InfoValue>
                            </InfoTile>
                            {/* <InfoTile>
                                        <InfoLabel>Coleção de origem</InfoLabel>
                                        <InfoValue>{selectedLog.sourceCollection || "-"}</InfoValue>
                                    </InfoTile> */}
                            {/* <InfoTile>
                                        <InfoLabel>Registro de origem</InfoLabel>
                                        <InfoValue>{selectedLog.sourceRecordId || selectedLog.entity?.id || "-"}</InfoValue>
                                    </InfoTile> */}
                            <InfoTile>
                                <InfoLabel>Tipo de entidade</InfoLabel>
                                <InfoValue>{selectedLog.entity?.label || "-"}</InfoValue>
                            </InfoTile>
                            {/* <InfoTile>
                                        <InfoLabel>Rota de visualização</InfoLabel>
                                        <InfoValue>{selectedLog.entity?.route || "-"}</InfoValue>
                                    </InfoTile> */}
                            <InfoTile>
                                <InfoLabel>Status rastreado</InfoLabel>
                                <InfoValue>{selectedLog.statusLabel || "-"}</InfoValue>
                            </InfoTile>
                        </InfoGrid>
                    </SectionCard>

                    <SectionCard>
                        <SectionHeader>
                            <div>
                                <SectionTitle>Descrição</SectionTitle>
                                <SectionHint>Resumo textual da ação registrada.</SectionHint>
                            </div>
                        </SectionHeader>
                        <InfoTile>
                            <InfoLabel>Resumo</InfoLabel>
                            <InfoValue>{selectedLog.description || "-"}</InfoValue>
                        </InfoTile>
                    </SectionCard>

                    {/* <SectionCard>
                                <SectionHeader>
                                    <div>
                                        <SectionTitle>Entidade afetada</SectionTitle>
                                        <SectionHint>Objeto de domínio atingido pela operação.</SectionHint>
                                    </div>
                                </SectionHeader>
                                <InfoGrid>
                                    <InfoTile>
                                        <InfoLabel>Tipo</InfoLabel>
                                        <InfoValue>{selectedLog.entity?.label || "-"}</InfoValue>
                                    </InfoTile>
                                    <InfoTile>
                                        <InfoLabel>ID da entidade</InfoLabel>
                                        <InfoValue>{selectedLog.entity?.id || "-"}</InfoValue>
                                    </InfoTile>
                                </InfoGrid>
                                <DrawerActionRow style={{ marginTop: 12 }}>
                                    <SystemButton type="button" onClick={viewEntity} disabled={!selectedLog.entity?.route}>
                                        <FaExternalLinkAlt size={14} />
                                        Visualizar entidade
                                    </SystemButton>
                                </DrawerActionRow>
                            </SectionCard> */}

                    {/* <SectionCard>
                                <SectionHeader>
                                    <div>
                                        <SectionTitle>Detalhes da alteração</SectionTitle>
                                        <SectionHint>Comparativo before/after com diff visual para compliance.</SectionHint>
                                    </div>
                                </SectionHeader>

                                {selectedLog.changes?.length ? (
                                    <ChangesList>
                                        {selectedLog.changes.map((change) => (
                                            <ChangeCard key={`${change.field}-${change.label}`}>
                                                <SectionHeader style={{ padding: "12px 14px 0", marginBottom: 0 }}>
                                                    <ChangeField>{change.label}</ChangeField>
                                                    <Badge $tone="access">{change.field}</Badge>
                                                </SectionHeader>
                                                <DiffGrid>
                                                    <DiffCell>
                                                        <DiffLabel>Valor anterior</DiffLabel>
                                                        <DiffValue $tone="before">{formatListValue(change.before)}</DiffValue>
                                                    </DiffCell>
                                                    <DiffCell>
                                                        <DiffLabel>Novo valor</DiffLabel>
                                                        <DiffValue $tone="after">{formatListValue(change.after)}</DiffValue>
                                                    </DiffCell>
                                                </DiffGrid>
                                            </ChangeCard>
                                        ))}
                                    </ChangesList>
                                ) : (
                                    <InfoTile>
                                        <InfoLabel>Alteração</InfoLabel>
                                        <InfoValue>Sem diferenças estruturais registradas para este evento.</InfoValue>
                                    </InfoTile>
                                )}
                            </SectionCard> */}

                    <SectionCard>
                        <SectionHeader>
                            <div>
                                <SectionTitle>Informações adicionais</SectionTitle>
                                <SectionHint>Dados relacionados à entidade ou ao processo auditado.</SectionHint>
                            </div>
                        </SectionHeader>
                        <InfoGrid>
                            {Object.entries(selectedLog.additionalInfo || {}).map(([key, value]) => (
                                <InfoTile key={key}>
                                    <InfoLabel>{formatFieldLabel(key)}</InfoLabel>
                                    <InfoValue>{formatListValue(value)}</InfoValue>
                                </InfoTile>
                            ))}
                        </InfoGrid>
                    </SectionCard>

                    <SectionCard>
                        <SectionHeader>
                            <div>
                                <SectionTitle>Timeline do evento</SectionTitle>
                                <SectionHint>Sequência resumida da captura, persistência e resultado.</SectionHint>
                            </div>
                        </SectionHeader>

                        <EventTimeline
                            items={selectedTimelineItems}
                            emptyText="Nenhum evento registrado para este log."
                        />
                    </SectionCard>

                    <SectionCard>
                        <SectionHeader>
                            <div>
                                <SectionTitle>Ações</SectionTitle>
                                <SectionHint>Operações rápidas sobre o log atual.</SectionHint>
                            </div>
                        </SectionHeader>

                        <DrawerActionRow>
                            <SystemButton type="button" onClick={exportEvent}>
                                <FaDownload size={14} />
                                Exportar evento
                            </SystemButton>
                            <SystemButton type="button" onClick={copyEventId}>
                                <FaCopy size={14} />
                                Copiar ID
                            </SystemButton>
                            <SystemButton type="button" onClick={viewEntity} disabled={!selectedLog.entity?.route}>
                                <FaExternalLinkAlt size={14} />
                                Visualizar entidade
                            </SystemButton>
                        </DrawerActionRow>
                    </SectionCard>
                </DrawerComponent>
            ) : null}
        </Container>
    );
}
