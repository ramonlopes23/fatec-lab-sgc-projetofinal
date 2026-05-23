import React, { useEffect, useMemo, useState } from "react";
import { FaChartBar, FaExchangeAlt, FaEye, FaFilter, FaSearch } from "react-icons/fa";
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
    FilterGrid,
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
    Pagination,
    PeriodChip,
    PeriodChipLabel,
    PeriodChipValue,
    ReportModeButton,
    ReportModeTabs,
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
    Subtitle,
    Table,
    TableCard,
    TableHeader,
    TableScroller,
    TableTitle,
    TBody,
    Td,
    TdValue,
    Th,
    THead,
    Title,
    Tr,
} from "./styles";
import { FaCross, FaSkullCrossbones, FaUserGroup } from "react-icons/fa6";
import { RiContractFill, RiMoneyDollarBoxFill } from "react-icons/ri";

const PAGE_SIZE = 8;
const PERIOD_OPTIONS = [
    { value: "all", label: "Todo o historico" },
    { value: "7d", label: "Ultimos 7 dias" },
    { value: "30d", label: "Ultimos 30 dias" },
    { value: "90d", label: "Ultimos 90 dias" },
    { value: "year", label: "Ano atual" },
    { value: "custom", label: "Periodo personalizado" },
];

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

const initialFilters = {
    search: "",
    quadra: "",
    sepultura: "",
    destino: "",
    tipo: "all",
    periodo: "30d",
    dataInicio: "",
    dataFim: "",
};

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

const normalizeText = (value) => String(value ?? "").trim().toLowerCase();

const isParticularRecord = (item) => {
    const raw = normalizeText(item?.titulo_posse);
    return ["sim", "s", "true", "1", "particular", "proprio", "propria"].some((token) => raw.includes(token));
};

const classifyTaxa = (item) => {
    const code = normalizeText(item?.taxa);
    const label = normalizeText(item?.taxa_label);
    const type = normalizeText(item?.tipo);

    if (code.includes("indig") || label.includes("indig") || type.includes("indig")) return "indigente";
    if (code.includes("crianca") || label.includes("crianca") || label.includes("criança") || type.includes("crianca") || type.includes("criança")) return "crianca";
    if (code.includes("adult") || label.includes("adult") || type.includes("adult")) return "adulto";
    return "outros";
};

const getNestedSepultamento = (item) => item?.sepultamento || item?.sepultamento_data || item?.sepultamentoInfo || {};
const getExumacaoDate = (item) => item?.dh_exu || item?.data_exumacao || item?.data_exu || item?.dh_exumacao;

const getExumacaoName = (item) => {
    const sepultamento = getNestedSepultamento(item);
    return item?.nome_sep || item?.nome || item?.falecido_nome || item?.nome_falecido || sepultamento?.nome_sep || sepultamento?.nome || "--";
};

const getExumacaoQuadra = (item) => {
    const sepultamento = getNestedSepultamento(item);
    return item?.quadra_sep || item?.quadra || item?.quadra_id || sepultamento?.quadra_sep || sepultamento?.quadra || "";
};

const getExumacaoSepultura = (item) => {
    const sepultamento = getNestedSepultamento(item);
    return item?.num_sepultura_sep || item?.sepultura || item?.num_sepultura || sepultamento?.num_sepultura_sep || sepultamento?.sepultura || "";
};

const getExumacaoDestino = (item) => item?.destino || item?.destino_exu || item?.tipo_destino || "Nao informado";

const classifyDestino = (item) => {
    const destino = normalizeText(getExumacaoDestino(item));
    if (destino.includes("oss")) return "ossario";
    if (destino.includes("cremat")) return "crematorio";
    if (destino.includes("translad") || destino.includes("transfer")) return "transladado";
    return "outros";
};

const getDestinoLabel = (key) => ({
    ossario: "Ossario",
    crematorio: "Crematorio",
    transladado: "Transladado",
    outros: "Outros",
}[key] || "Outros");

const isTransferenciaExumacao = (item) => {
    const destino = normalizeText(getExumacaoDestino(item));
    const motivo = normalizeText(item?.motivo);
    return destino.includes("translad") || destino.includes("transfer") || motivo.includes("transfer");
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
    return item?.confirmado ? "Concluido" : "Pendente";
};

const buildMonthlySeries = (items, valueSelector, dateSelector = (item) => item?.dh_sep) => {
    const map = new Map();

    items.forEach((item) => {
        const date = parseDateValue(dateSelector(item));
        const key = getMonthKey(date);
        if (!key) return;
        map.set(key, (map.get(key) || 0) + Number(valueSelector(item) || 0));
    });

    return Array.from(map.entries())
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, value]) => ({ key, label: getMonthLabel(key), value }));
};

const buildTypeSeries = (items, includeOutros = false) => {
    const totals = { crianca: 0, adulto: 0, indigente: 0, outros: 0 };
    items.forEach((item) => {
        totals[classifyTaxa(item)] += 1;
    });

    return [
        { key: "adulto", label: "Adulto", value: totals.adulto, color: "#6f63ff" },
        { key: "crianca", label: "Crianca", value: totals.crianca, color: "#3b82f6" },
        { key: "indigente", label: "Indigente", value: totals.indigente, color: "#ffb05e" },
        ...(includeOutros ? [{ key: "outros", label: "Outros", value: totals.outros, color: "#5ec58f" }] : []),
    ].filter((item) => item.value > 0);
};

const buildDestinoSeries = (items) => {
    const totals = { ossario: 0, crematorio: 0, transladado: 0, outros: 0 };
    items.forEach((item) => {
        totals[classifyDestino(item)] += 1;
    });

    return [
        { key: "ossario", label: getDestinoLabel("ossario"), value: totals.ossario, color: "#6f63ff" },
        { key: "crematorio", label: getDestinoLabel("crematorio"), value: totals.crematorio, color: "#3b82f6" },
        { key: "transladado", label: getDestinoLabel("transladado"), value: totals.transladado, color: "#ffb05e" },
        { key: "outros", label: getDestinoLabel("outros"), value: totals.outros, color: "#5ec58f" },
    ].filter((item) => item.value > 0);
};

const sortNumericText = (left, right) => {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
    return String(left).localeCompare(String(right), "pt-BR", { numeric: true, sensitivity: "base" });
};

const getTypeText = (item) => {
    const typeLabel = classifyTaxa(item);
    if (typeLabel === "crianca") return "Crianca";
    if (typeLabel === "adulto") return "Adulto";
    if (typeLabel === "indigente") return "Indigente";
    return "Outro";
};

export default function RelatoriosComponent() {
    const [sepultamentos, setSepultamentos] = useState([]);
    const [exumacoes, setExumacoes] = useState([]);
    const [activeReport, setActiveReport] = useState("sepultamentos");
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filters, setFilters] = useState(initialFilters);

    const isExumacoesReport = activeReport === "exumacoes";

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                const [sepultamentosResponse, exumacoesResponse] = await Promise.all([
                    api.get("/sepultamentos").catch(() => ({ data: [] })),
                    api.get("/exumacoes").catch(() => ({ data: [] })),
                ]);
                setSepultamentos(Array.isArray(sepultamentosResponse.data) ? sepultamentosResponse.data : []);
                setExumacoes(Array.isArray(exumacoesResponse.data) ? exumacoesResponse.data : []);
            } catch (error) {
                console.error("Erro ao carregar relatorios", error);
                setSepultamentos([]);
                setExumacoes([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const filteredSepultamentos = useMemo(() => {
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

    const filteredExumacoes = useMemo(() => {
        const search = normalizeText(filters.search);
        const { start, end } = resolvePeriodRange(filters);

        return exumacoes.filter((item) => {
            const name = normalizeText(getExumacaoName(item));
            if (search && !name.includes(search)) return false;
            if (filters.quadra && String(getExumacaoQuadra(item)) !== String(filters.quadra)) return false;
            if (filters.sepultura && String(getExumacaoSepultura(item)) !== String(filters.sepultura)) return false;
            if (filters.destino && classifyDestino(item) !== filters.destino) return false;
            if (filters.tipo !== "all" && classifyTaxa(item) !== filters.tipo) return false;

            const date = parseDateValue(getExumacaoDate(item));
            if ((start || end) && !date) return false;
            if (start && date < start) return false;
            if (end && date > end) return false;
            return true;
        });
    }, [exumacoes, filters]);

    const filteredItems = isExumacoesReport ? filteredExumacoes : filteredSepultamentos;

    useEffect(() => {
        setPage(1);
    }, [activeReport, filters.search, filters.quadra, filters.sepultura, filters.destino, filters.tipo, filters.periodo, filters.dataInicio, filters.dataFim]);

    const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const pageItems = filteredItems.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        if (page !== currentPage) setPage(currentPage);
    }, [currentPage, page]);

    const periodLabel = useMemo(() => {
        if (filters.periodo === "custom") {
            const startLabel = filters.dataInicio ? formatDateDMY(filters.dataInicio, filters.dataInicio) : "Inicio livre";
            const endLabel = filters.dataFim ? formatDateDMY(filters.dataFim, filters.dataFim) : "Fim livre";
            return `${startLabel} a ${endLabel}`;
        }

        const selected = PERIOD_OPTIONS.find((option) => option.value === filters.periodo);
        return selected ? selected.label : "Todo o historico";
    }, [filters.dataFim, filters.dataInicio, filters.periodo]);

    const stats = useMemo(() => {
        const total = filteredItems.length;

        if (isExumacoesReport) {
            const transferencias = filteredItems.filter((item) => isTransferenciaExumacao(item)).length;
            const monthCount = new Set(filteredItems.map((item) => getMonthKey(parseDateValue(getExumacaoDate(item)))).filter(Boolean)).size || 1;
            const mediaMensal = total / monthCount;
            const arrecadacao = filteredItems.reduce((sum, item) => sum + (Number(item?.taxa_valor) || 0), 0);

            return [
                {
                    label: "Total de exumacoes",
                    value: total.toLocaleString("pt-BR"),
                    hint: "Registros filtrados",
                    icon: <FaSkullCrossbones />,
                    tone: "primary",
                },
                {
                    label: "Transferencias",
                    value: transferencias.toLocaleString("pt-BR"),
                    hint: "Destinos transferidos",
                    icon: <FaExchangeAlt />,
                    tone: "success",
                },
                {
                    label: "Media mensal",
                    value: mediaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                    hint: "Exumações por mes",
                    icon: <FaChartBar />,
                    tone: "warning",
                },
                {
                    label: "Arrecadacao",
                    value: formatCurrencyBRL(arrecadacao),
                    hint: "Total no periodo",
                    icon: <RiMoneyDollarBoxFill />,
                    tone: "danger",
                },
            ];
        }

        const particulares = filteredItems.filter((item) => isParticularRecord(item)).length;
        const comuns = total - particulares;
        const arrecadacao = filteredItems.reduce((sum, item) => sum + (Number(item?.taxa_valor) || 0), 0);

        return [
            {
                label: "Sepultamentos",
                value: total.toLocaleString("pt-BR"),
                hint: "Registros filtrados",
                icon: <FaCross />,
                tone: "primary",
            },
            {
                label: "Particulares",
                value: particulares.toLocaleString("pt-BR"),
                hint: "Com titulo de posse",
                icon: <RiContractFill />,
                tone: "success",
            },
            {
                label: "Comuns",
                value: comuns.toLocaleString("pt-BR"),
                hint: "Sem titulo de posse",
                icon: <FaUserGroup />,
                tone: "warning",
            },
            {
                label: "Arrecadacao",
                value: formatCurrencyBRL(arrecadacao),
                hint: "Total no periodo",
                icon: <RiMoneyDollarBoxFill />,
                tone: "danger",
            },
        ];
    }, [filteredItems, isExumacoesReport]);

    const monthlySepultamentos = useMemo(() => buildMonthlySeries(filteredSepultamentos, () => 1), [filteredSepultamentos]);
    const monthlyExumacoes = useMemo(() => buildMonthlySeries(filteredExumacoes, () => 1, getExumacaoDate), [filteredExumacoes]);
    const monthlyRevenue = useMemo(() => buildMonthlySeries(filteredSepultamentos, (item) => Number(item?.taxa_valor) || 0), [filteredSepultamentos]);
    const sepultamentoTypeSeries = useMemo(() => buildTypeSeries(filteredSepultamentos), [filteredSepultamentos]);
    const exumacaoTypeSeries = useMemo(() => buildTypeSeries(filteredExumacoes, true), [filteredExumacoes]);
    const destinoSeries = useMemo(() => buildDestinoSeries(filteredExumacoes), [filteredExumacoes]);

    const quadraOptions = useMemo(() => {
        const source = isExumacoesReport ? exumacoes : sepultamentos;
        const values = Array.from(new Set(source.map((item) => String(isExumacoesReport ? getExumacaoQuadra(item) : item?.quadra_sep ?? "").trim()).filter(Boolean)));
        return values.sort(sortNumericText);
    }, [exumacoes, isExumacoesReport, sepultamentos]);

    const sepulturaOptions = useMemo(() => {
        const source = isExumacoesReport ? exumacoes : sepultamentos;
        const base = filters.quadra
            ? source.filter((item) => String(isExumacoesReport ? getExumacaoQuadra(item) : item?.quadra_sep ?? "") === String(filters.quadra))
            : source;
        const values = Array.from(new Set(base.map((item) => String(isExumacoesReport ? getExumacaoSepultura(item) : item?.num_sepultura_sep ?? "").trim()).filter(Boolean)));
        return values.sort(sortNumericText);
    }, [exumacoes, filters.quadra, isExumacoesReport, sepultamentos]);

    const destinoOptions = useMemo(() => {
        const values = Array.from(new Set(exumacoes.map((item) => classifyDestino(item)).filter(Boolean)));
        return values.sort((left, right) => getDestinoLabel(left).localeCompare(getDestinoLabel(right), "pt-BR"));
    }, [exumacoes]);

    const clearFilters = () => {
        setFilters(initialFilters);
        setSelectedItem(null);
    };

    const handleReportMode = (mode) => {
        setActiveReport(mode);
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

    const renderSepultamentoRows = () => pageItems.map((item, index) => {
        const isParticular = isParticularRecord(item);
        return (
            <Tr key={item?.id || `${item?.nome_sep || "sep"}-${index}`} $index={index}>
                <Td>{formatDateDMY(item?.dh_sep, "--")}</Td>
                <Td>{item?.nome_sep || item?.nome || "--"}</Td>
                <Td>{item?.quadra_sep || "--"}</Td>
                <Td>{item?.num_sepultura_sep || "--"}</Td>
                <Td>{getTypeText(item)}</Td>
                <Td>{isParticular ? "Particular" : "Comum"}</Td>
                <TdValue>{formatCurrencyBRL(item?.taxa_valor)}</TdValue>
                <Td>
                    <StatusBadge $tone={getStatusTone(item)}>{getStatusLabel(item)}</StatusBadge>
                </Td>
                <Td>
                    <Actions>
                        <IconBtn type="button" onClick={() => setSelectedItem(item)} aria-label="Ver detalhes">
                            <FaEye />
                        </IconBtn>
                    </Actions>
                </Td>
            </Tr>
        );
    });

    const renderExumacaoRows = () => pageItems.map((item, index) => (
        <Tr key={item?.id || `${getExumacaoName(item)}-${index}`} $index={index}>
            <Td>{formatDateDMY(getExumacaoDate(item), "--")}</Td>
            <Td>{getExumacaoName(item)}</Td>
            <Td>{getExumacaoQuadra(item) || "--"}</Td>
            <Td>{getExumacaoSepultura(item) || "--"}</Td>
            <Td>{getDestinoLabel(classifyDestino(item))}</Td>
            <Td>{getTypeText(item)}</Td>
            <TdValue>{formatCurrencyBRL(item?.taxa_valor)}</TdValue>
            <Td>
                <StatusBadge $tone={getStatusTone(item)}>{getStatusLabel(item)}</StatusBadge>
            </Td>
            <Td>
                <Actions>
                    <IconBtn type="button" onClick={() => setSelectedItem(item)} aria-label="Ver detalhes">
                        <FaEye />
                    </IconBtn>
                </Actions>
            </Td>
        </Tr>
    ));

    const renderModalFields = () => {
        if (isExumacoesReport) {
            return [
                ["Quadra", getExumacaoQuadra(selectedItem) || "--"],
                ["Sepultura", getExumacaoSepultura(selectedItem) || "--"],
                ["Destino", getExumacaoDestino(selectedItem) || "--"],
                ["Tipo", getTypeText(selectedItem)],
                ["Taxa", formatCurrencyBRL(selectedItem?.taxa_valor)],
                ["Status", getStatusLabel(selectedItem)],
                ["Data da exumacao", formatDateDMY(getExumacaoDate(selectedItem), "--")],
                ["Motivo", selectedItem?.motivo || "--"],
                ["Observacao", selectedItem?.obs_exu || selectedItem?.observacao || "--"],
                ["Coveiro", selectedItem?.coveiro || selectedItem?.coveiro_sep || "--"],
            ];
        }

        return [
            ["Quadra", selectedItem?.quadra_sep || "--"],
            ["Sepultura", selectedItem?.num_sepultura_sep || "--"],
            ["Tipo", getTypeText(selectedItem)],
            ["Posse", isParticularRecord(selectedItem) ? "Particular" : "Comum"],
            ["Taxa", formatCurrencyBRL(selectedItem?.taxa_valor)],
            ["Status", getStatusLabel(selectedItem)],
            ["Data do sepultamento", formatDateDMY(selectedItem?.dh_sep, "--")],
            ["Data do obito", formatDateDMY(selectedItem?.data_obito_sep, "--")],
            ["Observacao", selectedItem?.obs_sep || "--"],
            ["Coveiro", selectedItem?.coveiro_sep || "--"],
        ];
    };

    return (
        <Container>
            <PageHeader>
                <HeaderCopy>
                    <Title>Relatorios Operacionais</Title>
                    <Subtitle>Visualize a movimentacao de sepultamentos e exumacoes com filtros, indicadores e graficos consolidados.</Subtitle>
                </HeaderCopy>
                <PeriodChip>
                    <PeriodChipLabel>Periodo ativo</PeriodChipLabel>
                    <PeriodChipValue>{periodLabel}</PeriodChipValue>
                    <PeriodChipValue>{filteredItems.length.toLocaleString("pt-BR")} registros filtrados</PeriodChipValue>
                </PeriodChip>
            </PageHeader>

            <ReportModeTabs>
                <ReportModeButton type="button" $active={!isExumacoesReport} onClick={() => handleReportMode("sepultamentos")}>
                    <FaCross /> Sepultamentos
                </ReportModeButton>
                <ReportModeButton type="button" $active={isExumacoesReport} onClick={() => handleReportMode("exumacoes")}>
                    <FaSkullCrossbones /> Exumações
                </ReportModeButton>
            </ReportModeTabs>

            <FilterCard>
                <FilterGrid>
                    <SearchWrapper>
                        <SearchField
                            value={filters.search}
                            onChange={handleFilterChange("search")}
                            placeholder={isExumacoesReport ? "Nome do falecido/exumado" : "Nome do falecido"}
                        />
                        <SearchIcon>
                            <FaSearch />
                        </SearchIcon>
                    </SearchWrapper>

                    <FilterRow>
                        <FormControl fullWidth size="medium">
                            <InputLabel sx={filterLabelSx}>Quadra</InputLabel>
                            <Select value={filters.quadra} label="Quadra" onChange={handleFilterChange("quadra")} sx={filterSelectSx}>
                                <MenuItem value="">Todas</MenuItem>
                                {quadraOptions.map((quadra) => (
                                    <MenuItem key={quadra} value={quadra}>Quadra {quadra}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="medium">
                            <InputLabel sx={filterLabelSx}>Sepultura</InputLabel>
                            <Select value={filters.sepultura} label="Sepultura" onChange={handleFilterChange("sepultura")} sx={filterSelectSx}>
                                <MenuItem value="">Todas</MenuItem>
                                {sepulturaOptions.map((sepultura) => (
                                    <MenuItem key={sepultura} value={sepultura}>{sepultura}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </FilterRow>

                    <FilterRow>
                        <FormControl fullWidth size="medium">
                            <InputLabel sx={filterLabelSx}>{isExumacoesReport ? "Destino" : "Tipo"}</InputLabel>
                            <Select
                                value={isExumacoesReport ? filters.destino : filters.tipo}
                                label={isExumacoesReport ? "Destino" : "Tipo"}
                                onChange={handleFilterChange(isExumacoesReport ? "destino" : "tipo")}
                                sx={filterSelectSx}
                            >
                                {isExumacoesReport ? (
                                    [
                                        <MenuItem key="all-destinos" value="">Todos</MenuItem>,
                                        ...destinoOptions.map((destino) => (
                                            <MenuItem key={destino} value={destino}>{getDestinoLabel(destino)}</MenuItem>
                                        )),
                                    ]
                                ) : (
                                    [
                                        <MenuItem key="all-tipos" value="all">Todos</MenuItem>,
                                        <MenuItem key="particular" value="particular">Particular</MenuItem>,
                                        <MenuItem key="comum" value="comum">Comum</MenuItem>,
                                    ]
                                )}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="medium">
                            <InputLabel sx={filterLabelSx}>{isExumacoesReport ? "Tipo" : "Periodo"}</InputLabel>
                            <Select
                                value={isExumacoesReport ? filters.tipo : filters.periodo}
                                label={isExumacoesReport ? "Tipo" : "Periodo"}
                                onChange={handleFilterChange(isExumacoesReport ? "tipo" : "periodo")}
                                sx={filterSelectSx}
                            >
                                {isExumacoesReport ? (
                                    [
                                        <MenuItem key="all-exu-tipos" value="all">Todos</MenuItem>,
                                        <MenuItem key="adulto" value="adulto">Adulto</MenuItem>,
                                        <MenuItem key="crianca" value="crianca">Crianca</MenuItem>,
                                        <MenuItem key="indigente" value="indigente">Indigente</MenuItem>,
                                    ]
                                ) : (
                                    PERIOD_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))
                                )}
                            </Select>
                        </FormControl>
                    </FilterRow>

                    {isExumacoesReport && (
                        <FilterRow>
                            <FormControl fullWidth size="medium">
                                <InputLabel sx={filterLabelSx}>Periodo</InputLabel>
                                <Select value={filters.periodo} label="Periodo" onChange={handleFilterChange("periodo")} sx={filterSelectSx}>
                                    {PERIOD_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <SecondaryButton type="button" onClick={clearFilters}>
                                <FaFilter /> Limpar filtros
                            </SecondaryButton>
                        </FilterRow>
                    )}

                    {filters.periodo === "custom" && (
                        <FilterRow>
                            <TextField
                                type="date"
                                fullWidth
                                size="small"
                                label="Inicio"
                                value={filters.dataInicio}
                                onChange={handleFilterChange("dataInicio")}
                                sx={filterTextFieldSx}
                                InputLabelProps={{ shrink: true }}
                            />
                            <TextField
                                type="date"
                                fullWidth
                                size="small"
                                label="Fim"
                                value={filters.dataFim}
                                onChange={handleFilterChange("dataFim")}
                                sx={filterTextFieldSx}
                                InputLabelProps={{ shrink: true }}
                            />
                        </FilterRow>
                    )}

                    {!isExumacoesReport && (
                        <FilterActionRow>
                            <SecondaryButton type="button" onClick={clearFilters}>
                                <FaFilter /> Limpar filtros
                            </SecondaryButton>
                        </FilterActionRow>
                    )}
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
                                        <FaChartBar /> {isExumacoesReport ? "Exumacoes por mes" : "Sepultamentos por mes"}
                                    </ChartTitle>
                                    <ChartSubtitle>Distribuicao temporal dos registros filtrados.</ChartSubtitle>
                                </div>
                            </ChartHeader>
                            <ChartBody>
                                <RelatoriosSepultadosMesChart data={isExumacoesReport ? monthlyExumacoes : monthlySepultamentos} loading={isLoading} label={isExumacoesReport ? "Exumacoes" : "Sepultamentos"} />
                            </ChartBody>
                        </ChartCard>

                        <ChartCard>
                            <ChartHeader>
                                <div>
                                    <ChartTitle>{isExumacoesReport ? "Destino da exumacao" : "Tipo de sepultamento"}</ChartTitle>
                                    <ChartSubtitle>{isExumacoesReport ? "Ossario, crematorio, transladado e outros." : "Adulto, crianca e indigente."}</ChartSubtitle>
                                </div>
                            </ChartHeader>
                            <ChartBody>
                                <RelatoriosTipoSepultamentoPie data={isExumacoesReport ? destinoSeries : sepultamentoTypeSeries} loading={isLoading} />
                            </ChartBody>
                        </ChartCard>

                        <ChartCard>
                            <ChartHeader>
                                <div>
                                    <ChartTitle>{isExumacoesReport ? "Tipo de exumacao" : "Arrecadacao mensal"}</ChartTitle>
                                    <ChartSubtitle>{isExumacoesReport ? "Adulto, crianca, indigente e outros." : "Somatorio de taxa aplicada por competencia."}</ChartSubtitle>
                                </div>
                            </ChartHeader>
                            <ChartBody>
                                {isExumacoesReport ? (
                                    <RelatoriosTipoSepultamentoPie data={exumacaoTypeSeries} loading={isLoading} />
                                ) : (
                                    <RelatoriosArrecadacaoMensalChart data={monthlyRevenue} loading={isLoading} />
                                )}
                            </ChartBody>
                        </ChartCard>
                    </ChartsGrid>

                    <TableCard>
                        <TableHeader>
                            <div>
                                <TableTitle>{isExumacoesReport ? "Lista de exumacoes" : "Lista de sepultamentos"}</TableTitle>
                            </div>
                        </TableHeader>

                        <TableScroller>
                            <Table>
                                <THead>
                                    <tr>
                                        {isExumacoesReport ? (
                                            <>
                                                <Th>Data da exumacao</Th>
                                                <Th>Falecido</Th>
                                                <Th>Quadra</Th>
                                                <Th>Sepultura</Th>
                                                <Th>Destino</Th>
                                                <Th>Tipo</Th>
                                                <Th>Taxa</Th>
                                                <Th>Status</Th>
                                                <Th>Acoes</Th>
                                            </>
                                        ) : (
                                            <>
                                                <Th>Data</Th>
                                                <Th>Falecido</Th>
                                                <Th>Quadra</Th>
                                                <Th>Sepultura</Th>
                                                <Th>Tipo</Th>
                                                <Th>Posse</Th>
                                                <Th>Taxa</Th>
                                                <Th>Status</Th>
                                                <Th>Acoes</Th>
                                            </>
                                        )}
                                    </tr>
                                </THead>
                                <TBody>
                                    {pageItems.length ? (
                                        isExumacoesReport ? renderExumacaoRows() : renderSepultamentoRows()
                                    ) : (
                                        <tr>
                                            <Td colSpan={9}>
                                                <EmptyState>
                                                    Nenhum {isExumacoesReport ? "registro de exumacao" : "sepultamento"} encontrado com os filtros atuais.
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
                                    <PageButton key={number} type="button" $active={number === currentPage} onClick={() => setPage(number)}>
                                        {number}
                                    </PageButton>
                                ))}
                                <PageButton type="button" onClick={() => setPage((value) => Math.min(totalPages, value + 1))} disabled={currentPage === totalPages}>
                                    Proxima
                                </PageButton>
                            </Pagination>
                        )}
                    </TableCard>
                </MainColumn>
            </LayoutGrid>

            {selectedItem && (
                <ModalOverlay onClick={() => setSelectedItem(null)}>
                    <ModalContent onClick={(event) => event.stopPropagation()}>
                        <ModalTitle>{isExumacoesReport ? getExumacaoName(selectedItem) : selectedItem?.nome_sep || selectedItem?.nome || "Detalhes do registro"}</ModalTitle>
                        <ModalSubtitle>
                            {isExumacoesReport
                                ? `Exumacao registrada em ${formatDateDMY(getExumacaoDate(selectedItem), "--")}.`
                                : `Sepultamento registrado em ${formatDateDMY(selectedItem?.dh_sep, "--")}.`}
                        </ModalSubtitle>

                        <ModalGrid>
                            {renderModalFields().map(([label, value]) => (
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
