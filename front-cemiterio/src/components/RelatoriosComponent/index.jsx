import React, { useEffect, useMemo, useState } from "react";
import { FaChartBar, FaCoins, FaEye, FaFileAlt, FaRegCalendarAlt, FaSearch, FaUsers } from "react-icons/fa";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import api from "../../services/index.js";
import { formatDateDMY, parseDateValue } from "../../utils/date";
import { formatCurrencyBRL } from "../../utils/taxas";
import RelatoriosArrecadacaoMensalChart from "./charts/RelatoriosArrecadacaoMensalChart";
import RelatoriosSepultadosMesChart from "./charts/RelatoriosSepultadosMesChart";
import RelatoriosTipoSepultamentoPie from "./charts/RelatoriosTipoSepultamentoPie";
import {
    Actions,
    ChartBody,
    ChartCard,
    ChartHeader,
    ChartSubtitle,
    ChartTitle,
    ChartsGrid,
    Container,
    EmptyState,
    FilterActionRow,
    FilterCard,
    FilterCardTitle,
    FilterGrid,
    FilterHint,
    FilterRow,
    HeaderCopy,
    IconBtn,
    LayoutGrid,
    MainColumn,
    ModalContent,
    ModalField,
    ModalFieldLabel,
    ModalFieldValue,
    ModalGrid,
    ModalOverlay,
    ModalSubtitle,
    ModalTitle,
    PageButton,
    PageHeader,
    PeriodChip,
    PeriodChipLabel,
    PeriodChipValue,
    PrimaryButton,
    SearchField,
    SearchIcon,
    SearchWrapper,
    SecondaryButton,
    Subtitle,
    StatCard,
    StatCopy,
    StatHint,
    StatIcon,
    StatLabel,
    StatValue,
    StatsGrid,
    StatusBadge,
    Title,
    Table,
    TableCard,
    TableHeader,
    TableNote,
    TableScroller,
    TableTitle,
    Td,
    TdLocal,
    TdValue,
    TBody,
    Th,
    THead,
    Tr,
} from "./styles";
import { FaCross, FaUserGroup } from "react-icons/fa6";
import { RiContractFill, RiMoneyDollarBoxFill } from "react-icons/ri";

const PAGE_SIZE = 8;
const PERIOD_OPTIONS = [
    { value: "all", label: "Todo o histórico" },
    { value: "7d", label: "Últimos 7 dias" },
    { value: "30d", label: "Últimos 30 dias" },
    { value: "90d", label: "Últimos 90 dias" },
    { value: "year", label: "Ano atual" },
    { value: "custom", label: "Período personalizado" },
];

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const initialFilters = {
    search: "",
    quadra: "",
    sepultura: "",
    tipo: "all",
    periodo: "30d",
    dataInicio: "",
    dataFim: "",
};

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const isParticularRecord = (item) => {
    const raw = normalizeText(item?.titulo_posse);
    return ["sim", "s", "true", "1", "particular", "próprio", "proprio", "própria", "propria"].some((token) => raw.includes(token));
};

const classifyTaxa = (item) => {
    const code = normalizeText(item?.taxa);
    const label = normalizeText(item?.taxa_label);

    if (code.includes("indig") || label.includes("indig")) return "indigente";
    if (code.includes("crianca") || label.includes("criança") || label.includes("crianca")) return "crianca";
    if (code.includes("adult") || label.includes("adult")) return "adulto";
    return "outros";
};

const getMonthKey = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};

const getMonthLabel = (monthKey) => {
    if (!monthKey) return "Sem data";
    const [year, month] = monthKey.split("-").map(Number);
    return `${MONTH_LABELS[(month || 1) - 1]}/${String(year).slice(-2)}`;
};

const resolvePeriodRange = (filters) => {
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    if (filters.periodo === "custom") {
        const start = filters.dataInicio ? new Date(`${filters.dataInicio}T00:00:00`) : null;
        const end = filters.dataFim ? new Date(`${filters.dataFim}T23:59:59.999`) : null;
        return { start, end };
    }

    if (filters.periodo === "7d" || filters.periodo === "30d" || filters.periodo === "90d") {
        const days = Number(filters.periodo.replace("d", ""));
        const start = new Date(now);
        start.setDate(start.getDate() - (days - 1));
        start.setHours(0, 0, 0, 0);
        return { start, end: endOfToday };
    }

    if (filters.periodo === "year") {
        const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
        return { start, end: endOfToday };
    }

    return { start: null, end: null };
};

const getStatusTone = (item) => {
    const status = normalizeText(item?.status);
    if (status.includes("cancel")) return "danger";
    if (status.includes("pend") || status.includes("aguard")) return "warning";
    return "success";
};

const getStatusLabel = (item) => {
    const status = String(item?.status || "").trim();
    if (status) return status;
    return item?.confirmado ? "Concluído" : "Pendente";
};

const buildMonthlySeries = (items, valueSelector) => {
    const map = new Map();

    items.forEach((item) => {
        const date = parseDateValue(item?.dh_sep);
        const key = getMonthKey(date);
        if (!key) return;

        const current = map.get(key) || 0;
        map.set(key, current + Number(valueSelector(item) || 0));
    });

    return Array.from(map.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => ({ key, label: getMonthLabel(key), value }));
};

const buildTypeSeries = (items) => {
    const totals = {
        crianca: 0,
        adulto: 0,
        indigente: 0,
        outros: 0,
    };

    items.forEach((item) => {
        totals[classifyTaxa(item)] += 1;
    });

    return [
        { key: "adulto", label: "Adulto", value: totals.adulto, color: "#6f63ff" },
        { key: "crianca", label: "Criança", value: totals.crianca, color: "#5ec58f" },
        { key: "indigente", label: "Indigente", value: totals.indigente, color: "#f59e0b" },
    ].filter((item) => item.value > 0);
};

const sortNumericText = (left, right) => {
    const leftNumber = Number(left);
    const rightNumber = Number(right);

    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
    return String(left).localeCompare(String(right), "pt-BR", { numeric: true, sensitivity: "base" });
};

export default function RelatoriosComponent() {
    const [sepultamentos, setSepultamentos] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filters, setFilters] = useState(initialFilters);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const response = await api.get("/sepultamentos").catch(() => ({ data: [] }));
                setSepultamentos(Array.isArray(response.data) ? response.data : []);
            } catch (error) {
                console.error("Erro ao carregar sepultamentos", error);
                setSepultamentos([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredItems = useMemo(() => {
        const search = normalizeText(filters.search);
        const { start, end } = resolvePeriodRange(filters);

        return sepultamentos.filter((item) => {
            const name = normalizeText(item?.nome_sep || item?.nome);
            if (search && !name.includes(search)) return false;

            if (filters.quadra && String(item?.quadra_sep ?? "") !== String(filters.quadra)) return false;
            if (filters.sepultura && String(item?.num_sepultura_sep ?? "") !== String(filters.sepultura)) return false;

            const isParticular = isParticularRecord(item);
            if (filters.tipo === "particular" && !isParticular) return false;
            if (filters.tipo === "comum" && isParticular) return false;

            const date = parseDateValue(item?.dh_sep);
            if ((start || end) && !date) return false;
            if (start && date < start) return false;
            if (end && date > end) return false;

            return true;
        });
    }, [filters, sepultamentos]);

    useEffect(() => {
        setPage(1);
    }, [filters.search, filters.quadra, filters.sepultura, filters.tipo, filters.periodo, filters.dataInicio, filters.dataFim]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        if (page !== currentPage) {
            setPage(currentPage);
        }
    }, [currentPage, page]);

    const periodLabel = useMemo(() => {
        if (filters.periodo === "custom") {
            const startLabel = filters.dataInicio ? formatDateDMY(filters.dataInicio, filters.dataInicio) : "Início livre";
            const endLabel = filters.dataFim ? formatDateDMY(filters.dataFim, filters.dataFim) : "Fim livre";
            return `${startLabel} a ${endLabel}`;
        }

        const selected = PERIOD_OPTIONS.find((option) => option.value === filters.periodo);
        return selected ? selected.label : "Todo o histórico";
    }, [filters.dataFim, filters.dataInicio, filters.periodo]);

    const stats = useMemo(() => {
        const total = filteredItems.length;
        const particulares = filteredItems.filter((item) => isParticularRecord(item)).length;
        const comuns = total - particulares;
        const arrecadacao = filteredItems.reduce((sum, item) => sum + (Number(item?.taxa_valor) || 0), 0);

        return [
            {
                label: "Sepultamentos",
                value: total.toLocaleString("pt-BR"),
                hint: "Registros filtrados",
                icon: <FaCross/>,
                tone: "primary",
            },
            {
                label: "Particulares",
                value: particulares.toLocaleString("pt-BR"),
                hint: "Com título de posse",
                icon: <RiContractFill />,
                tone: "success",
            },
            {
                label: "Comuns",
                value: comuns.toLocaleString("pt-BR"),
                hint: "Sem título de posse",
                icon: <FaUserGroup />,
                tone: "warning",
            },
            {
                label: "Arrecadação",
                value: formatCurrencyBRL(arrecadacao),
                hint: "Total no período",
                icon: <RiMoneyDollarBoxFill />,
                tone: "danger",
            },
        ];
    }, [filteredItems]);

    const monthlySepultamentos = useMemo(
        () => buildMonthlySeries(filteredItems, () => 1),
        [filteredItems]
    );

    const monthlyRevenue = useMemo(
        () => buildMonthlySeries(filteredItems, (item) => Number(item?.taxa_valor) || 0),
        [filteredItems]
    );

    const typeSeries = useMemo(
        () => buildTypeSeries(filteredItems),
        [filteredItems]
    );

    const quadraOptions = useMemo(() => {
        const values = Array.from(new Set(sepultamentos.map((item) => String(item?.quadra_sep ?? "").trim()).filter(Boolean)));
        return values.sort(sortNumericText);
    }, [sepultamentos]);

    const sepulturaOptions = useMemo(() => {
        const base = filters.quadra
            ? sepultamentos.filter((item) => String(item?.quadra_sep ?? "") === String(filters.quadra))
            : sepultamentos;
        const values = Array.from(new Set(base.map((item) => String(item?.num_sepultura_sep ?? "").trim()).filter(Boolean)));
        return values.sort(sortNumericText);
    }, [filters.quadra, sepultamentos]);

    const openDetails = (item) => setSelectedItem(item);
    const closeDetails = () => setSelectedItem(null);

    const clearFilters = () => {
        setFilters(initialFilters);
        setSelectedItem(null);
    };

    const handleFilterChange = (field) => (event) => {
        const value = event.target.value;
        setFilters((previous) => ({
            ...previous,
            [field]: value,
            ...(field === "quadra" ? { sepultura: "" } : {}),
        }));
    };

    return (
        <Container>
            <PageHeader>
                <HeaderCopy>
                    <Title>Relatórios</Title>
                    <Subtitle>Visualize a movimentação de sepultamentos com filtros, indicadores e gráficos consolidados.</Subtitle>
                </HeaderCopy>
                <PeriodChip>
                    <PeriodChipLabel>Período ativo</PeriodChipLabel>
                    <PeriodChipValue>{periodLabel}</PeriodChipValue>
                    <PeriodChipValue>{filteredItems.length.toLocaleString("pt-BR")} registros filtrados</PeriodChipValue>
                </PeriodChip>
            </PageHeader>

            <FilterCard>
                <FilterGrid>
                    <SearchWrapper>
                        <SearchField
                            value={filters.search}
                            onChange={handleFilterChange("search")}
                            placeholder="Nome do falecido"
                        />
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                    </SearchWrapper>

                    <FilterRow>
                        <FormControl fullWidth size="small">
                            <InputLabel>Quadra</InputLabel>
                            <Select
                                value={filters.quadra}
                                label="Quadra"
                                onChange={handleFilterChange("quadra")}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {quadraOptions.map((quadra) => (
                                    <MenuItem key={quadra} value={quadra}>
                                        Quadra {quadra}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Sepultura</InputLabel>
                            <Select
                                value={filters.sepultura}
                                label="Sepultura"
                                onChange={handleFilterChange("sepultura")}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {sepulturaOptions.map((sepultura) => (
                                    <MenuItem key={sepultura} value={sepultura}>
                                        {sepultura}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </FilterRow>

                    <FilterRow>
                        <FormControl fullWidth size="small">
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={filters.tipo}
                                label="Tipo"
                                onChange={handleFilterChange("tipo")}
                            >
                                <MenuItem value="all">Todos</MenuItem>
                                <MenuItem value="particular">Particular</MenuItem>
                                <MenuItem value="comum">Comum</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel>Período</InputLabel>
                            <Select
                                value={filters.periodo}
                                label="Período"
                                onChange={handleFilterChange("periodo")}
                            >
                                {PERIOD_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </FilterRow>

                    {filters.periodo === "custom" && (
                        <FilterRow>
                            <TextField
                                type="date"
                                fullWidth
                                size="small"
                                label="Início"
                                value={filters.dataInicio}
                                onChange={handleFilterChange("dataInicio")}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="date"
                                fullWidth
                                size="small"
                                label="Fim"
                                value={filters.dataFim}
                                onChange={handleFilterChange("dataFim")}
                                InputLabelProps={{ shrink: true }}
                            />
                        </FilterRow>
                    )}

                    <FilterActionRow>
                        <PrimaryButton type="button" onClick={() => setFilters((previous) => ({ ...previous }))}>
                            Aplicar
                        </PrimaryButton>
                        <SecondaryButton type="button" onClick={clearFilters}>
                            Limpar
                        </SecondaryButton>
                    </FilterActionRow>
                </FilterGrid>
            </FilterCard>

            <LayoutGrid>
                <MainColumn>
                    <StatsGrid>
                        {stats.map((item) => (
                            <StatCard key={item.label}>
                                <StatIcon $tone={item.tone}>{item.icon}</StatIcon>
                                <StatCopy>
                                    <StatLabel>{item.label}</StatLabel>
                                    <StatValue>{item.value}</StatValue>
                                    <StatHint>{item.hint}</StatHint>
                                </StatCopy>
                            </StatCard>
                        ))}
                    </StatsGrid>

                    <ChartsGrid>
                        <ChartCard>
                            <ChartHeader>
                                <div>
                                    <ChartTitle>
                                        <FaChartBar /> Sepultamentos por mês
                                    </ChartTitle>
                                    <ChartSubtitle>Distribuição temporal dos registros filtrados.</ChartSubtitle>
                                </div>
                            </ChartHeader>
                            <ChartBody>
                                <RelatoriosSepultadosMesChart data={monthlySepultamentos} loading={isLoading} />
                            </ChartBody>
                        </ChartCard>

                        <ChartCard>
                            <ChartHeader>
                                <div>
                                    <ChartTitle>Tipo de sepultamento</ChartTitle>
                                    <ChartSubtitle>Adulto, criança e indigente.</ChartSubtitle>
                                </div>
                            </ChartHeader>
                            <ChartBody>
                                <RelatoriosTipoSepultamentoPie data={typeSeries} loading={isLoading} />
                            </ChartBody>
                        </ChartCard>

                        <ChartCard>
                            <ChartHeader>
                                <div>
                                    <ChartTitle>Arrecadação mensal</ChartTitle>
                                    <ChartSubtitle>Somatório de taxa aplicada por competência.</ChartSubtitle>
                                </div>
                            </ChartHeader>
                            <ChartBody>
                                <RelatoriosArrecadacaoMensalChart data={monthlyRevenue} loading={isLoading} />
                            </ChartBody>
                        </ChartCard>
                    </ChartsGrid>

                    <TableCard>
                        <TableHeader>
                            <div>
                                <TableTitle>Lista de sepultamentos</TableTitle>
                                <TableNote>
                                    {filteredItems.length.toLocaleString("pt-BR")} registros encontrados no recorte atual.
                                </TableNote>
                            </div>
                            <TableNote>
                                Página {currentPage.toLocaleString("pt-BR")} de {totalPages.toLocaleString("pt-BR")}
                            </TableNote>
                        </TableHeader>

                        <TableScroller>
                            <Table>
                                <THead>
                                    <tr>
                                        <Th>Data</Th>
                                        <Th>Falecido</Th>
                                        <Th>Quadra</Th>
                                        <Th>Sepultura</Th>
                                        <Th>Tipo</Th>
                                        <Th>Posse</Th>
                                        <Th>Taxa</Th>
                                        <Th>Status</Th>
                                        <Th>Ações</Th>
                                    </tr>
                                </THead>
                                <TBody>
                                    {pageItems.length ? (
                                        pageItems.map((item, index) => {
                                            const isParticular = isParticularRecord(item);
                                            const typeLabel = classifyTaxa(item);
                                            const typeText = typeLabel === "crianca" ? "Criança" : typeLabel === "adulto" ? "Adulto" : typeLabel === "indigente" ? "Indigente" : "Outro";
                                            return (
                                                <Tr key={item?.id || `${item?.nome_sep || "sep"}-${index}`} $index={index}>
                                                    <Td>{formatDateDMY(item?.dh_sep, "--")}</Td>
                                                    <Td>{item?.nome_sep || item?.nome || "--"}</Td>
                                                    <Td>{item?.quadra_sep || "--"}</Td>
                                                    <Td>{item?.num_sepultura_sep || "--"}</Td>
                                                    <Td>{typeText}</Td>
                                                    <Td>{isParticular ? "Particular" : "Comum"}</Td>
                                                    <TdValue>{formatCurrencyBRL(item?.taxa_valor)}</TdValue>
                                                    <Td>
                                                        <StatusBadge $tone={getStatusTone(item)}>{getStatusLabel(item)}</StatusBadge>
                                                    </Td>
                                                    <Td>
                                                        <Actions>
                                                            <IconBtn type="button" onClick={() => openDetails(item)} aria-label="Ver detalhes">
                                                                <FaEye />
                                                            </IconBtn>
                                                        </Actions>
                                                    </Td>
                                                </Tr>
                                            );
                                        })
                                    ) : (
                                        <tr>
                                            <Td colSpan={9}>
                                                <EmptyState>
                                                    Nenhum sepultamento encontrado com os filtros atuais.
                                                </EmptyState>
                                            </Td>
                                        </tr>
                                    )}
                                </TBody>
                            </Table>
                        </TableScroller>

                        {totalPages > 1 && (
                            <Pagination>
                                <PageButton type="button" onClick={() => setPage((value) => Math.max(1, value - 1))} disabled={currentPage === 1}>
                                    Anterior
                                </PageButton>
                                {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                                    <PageButton
                                        key={number}
                                        type="button"
                                        $active={number === currentPage}
                                        onClick={() => setPage(number)}
                                    >
                                        {number}
                                    </PageButton>
                                ))}
                                <PageButton type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>
                                    Próxima
                                </PageButton>
                            </Pagination>
                        )}
                    </TableCard>
                </MainColumn>
            </LayoutGrid>

            {selectedItem && (
                <ModalOverlay onClick={closeDetails}>
                    <ModalContent onClick={(event) => event.stopPropagation()}>
                        <ModalTitle>{selectedItem?.nome_sep || selectedItem?.nome || "Detalhes do registro"}</ModalTitle>
                        <ModalSubtitle>
                            Sepultamento registrado em {formatDateDMY(selectedItem?.dh_sep, "--")}.
                        </ModalSubtitle>

                        <ModalGrid>
                            {[
                                ["Quadra", selectedItem?.quadra_sep || "--"],
                                ["Sepultura", selectedItem?.num_sepultura_sep || "--"],
                                ["Tipo", classifyTaxa(selectedItem)],
                                ["Posse", isParticularRecord(selectedItem) ? "Particular" : "Comum"],
                                ["Taxa", formatCurrencyBRL(selectedItem?.taxa_valor)],
                                ["Status", getStatusLabel(selectedItem)],
                                ["Data do sepultamento", formatDateDMY(selectedItem?.dh_sep, "--")],
                                ["Data do óbito", formatDateDMY(selectedItem?.data_obito_sep, "--")],
                                ["Observação", selectedItem?.obs_sep || "--"],
                                ["Coveiro", selectedItem?.coveiro_sep || "--"],
                            ].map(([label, value]) => (
                                <ModalField key={label}>
                                    <ModalFieldLabel>{label}</ModalFieldLabel>
                                    <ModalFieldValue>{value}</ModalFieldValue>
                                </ModalField>
                            ))}
                        </ModalGrid>
                    </ModalContent>
                </ModalOverlay>
            )}
        </Container>
    );
}
