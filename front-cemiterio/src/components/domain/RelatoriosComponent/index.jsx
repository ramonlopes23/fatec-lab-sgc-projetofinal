import React, { useEffect, useMemo, useState } from "react";
import { FaChartBar, FaExchangeAlt, FaEye, FaFilter, FaSearch } from "react-icons/fa";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import api from "../../../services/index.js";
import { useAuthStore } from "../../../stores/authStore";
import sgcLogo from "../../../assets/SGC.png";
import { formatDateDMY, parseDateValue } from "../../../utils/date";
import { formatCurrencyBRL } from "../../../utils/taxas";
import DefaultModal from "../../common/DefaultModal";
import RelatoriosExportActions from "./RelatoriosExportActions";
import RelatoriosArrecadacaoMensalChart from "../../../charts/RelatoriosArrecadacaoMensalChart.jsx";
import RelatoriosSepultadosMesChart from "../../../charts/RelatoriosSepultadosMesChart.jsx";
import RelatoriosTipoSepultamentoPie from "../../../charts/RelatoriosTipoSepultamentoPie.jsx";
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
    StatCard,
    StatCopy,
    StatHint,
    StatIcon,
    StatLabel,
    StatValue,
    StatsGrid,
    Subtitle,
    Title,
} from "./styles";
import {
    StatusBadge,
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
    Tr,
} from "../../common/DefaultTable";
import { FaCross, FaSkullCrossbones, FaUserGroup } from "react-icons/fa6";
import { LuFlower2 } from "react-icons/lu";
import { RiContractFill, RiMoneyDollarBoxFill } from "react-icons/ri";
import { useToastFeedback } from "../../../hooks/ToastFeedback/useToastFeedback.jsx";
import SystemButton from "../../common/SystemButton";
import { normalizeText, sortNumericText } from "../../../utils/text";

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

const getTypeText = (item) => {
    const typeLabel = classifyTaxa(item);
    if (typeLabel === "crianca") return "Crianca";
    if (typeLabel === "adulto") return "Adulto";
    if (typeLabel === "indigente") return "Indigente";
    return "Outro";
};

const getUserName = (user) => user?.name || user?.nome || user?.username || user?.email || "Administrador";

const formatDateTimeBR = (value) => {
    const date = value instanceof Date ? value : parseDateValue(value);
    if (!date) return "--";
    return `${formatDateDMY(date, "--")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const buildReportHash = (payload) => {
    const raw = JSON.stringify({
        reportType: payload.reportType,
        filters: payload.filters,
        generatedAt: payload.metadata.generatedAt,
        total: payload.summary?.[0]?.value,
    });
    let hash = 0;
    for (let index = 0; index < raw.length; index += 1) {
        hash = ((hash << 5) - hash + raw.charCodeAt(index)) | 0;
    }
    return `SGC-${Math.abs(hash).toString(16).toUpperCase().padStart(8, "0")}`;
};

const getFileExtension = (format) => (format === "xlsx" ? "xls" : format);

const getMimeType = (format) => ({
    pdf: "text/html;charset=utf-8",
    xlsx: "application/vnd.ms-excel;charset=utf-8",
    csv: "text/csv;charset=utf-8",
}[format] || "application/octet-stream");

const downloadBlob = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

const escapeHtml = (value) => String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const escapeCsv = (value) => {
    const raw = String(value ?? "");
    return `"${raw.replace(/"/g, '""')}"`;
};

const buildCsvContent = (payload) => {
    const header = payload.table.columns.map((column) => escapeCsv(column.label)).join(";");
    const rows = payload.table.rows.map((row) => (
        payload.table.columns.map((column) => escapeCsv(row[column.key])).join(";")
    ));
    return `\uFEFF${[header, ...rows].join("\n")}`;
};

const buildExcelContent = (payload) => {
    const summaryRows = payload.summary.map((item) => `
        <tr>
            <td>${escapeHtml(item.label)}</td>
            <td>${escapeHtml(item.value)}</td>
            <td>${escapeHtml(item.hint)}</td>
        </tr>
    `).join("");

    const filterRows = payload.appliedFilters.map((item) => `
        <tr>
            <td>${escapeHtml(item.label)}</td>
            <td>${escapeHtml(item.value || "-")}</td>
        </tr>
    `).join("");

    const detailHeader = payload.table.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("");
    const detailRows = payload.table.rows.map((row, index) => `
        <tr class="${index % 2 === 0 ? "even" : "odd"}">
            ${payload.table.columns.map((column) => `<td>${escapeHtml(row[column.key])}</td>`).join("")}
        </tr>
    `).join("");

    return `<!doctype html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head>
  <meta charset="utf-8" />
  <style>
    table { border-collapse: collapse; font-family: Arial, sans-serif; }
    th { background: #191970; color: #fff; font-weight: 700; border: 1px solid #dbe1f2; padding: 8px; }
    td { border: 1px solid #dbe1f2; padding: 8px; }
    .title { background: #f4f6ff; color: #191970; font-size: 18px; font-weight: 700; }
    .section { background: #eef3ff; color: #191970; font-weight: 700; }
    .even td { background: #fafbff; }
    .odd td { background: #ffffff; }
  </style>
</head>
<body>
  <table>
    <tr><td class="title" colspan="8">${escapeHtml(payload.reportTitle)}</td></tr>
    <tr><td>Gerado em</td><td>${escapeHtml(payload.metadata.generatedAtLabel)}</td></tr>
    <tr><td>Usuario</td><td>${escapeHtml(payload.metadata.userName)}</td></tr>
    <tr><td>Codigo</td><td>${escapeHtml(payload.metadata.reportHash)}</td></tr>
    <tr><td class="section" colspan="8">Resumo executivo</td></tr>
    <tr><th>KPI</th><th>Valor</th><th>Descricao</th></tr>
    ${summaryRows}
    <tr><td class="section" colspan="8">Filtros aplicados</td></tr>
    <tr><th>Filtro</th><th>Valor</th></tr>
    ${filterRows}
    <tr><td class="section" colspan="8">Dados completos</td></tr>
    <tr>${detailHeader}</tr>
    ${detailRows}
  </table>
</body>
</html>`;
};

const renderPrintHtml = (payload) => {
    const filters = payload.appliedFilters.filter((item) => item.value && item.value !== "Todos" && item.value !== "Todas");
    const chartBlocks = payload.charts.map((chart) => `
        <section class="panel">
            <h3>${escapeHtml(chart.title)}</h3>
            <div class="bars">
                ${(chart.data || []).map((item) => `
                    <div class="bar-row">
                        <span>${escapeHtml(item.label)}</span>
                        <strong>${escapeHtml(item.value)}</strong>
                    </div>
                `).join("") || "<p class='muted'>Sem dados</p>"}
            </div>
        </section>
    `).join("");

    return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(payload.reportTitle)}</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 28px; font-family: "Satoshi", sans-serif; color: #1f2652; background: #f6f7fb; }
    .page { background: #fff; border: 1px solid #e6e9f5; border-radius: 18px; padding: 28px; }
    header { display: flex; justify-content: space-between; gap: 24px; border-bottom: 3px solid #191970; padding-bottom: 18px; }
    .brand { display: flex; gap: 14px; align-items: center; }
    .brand img { width: 58px; height: 58px; object-fit: contain; }
    h1 { margin: 0; color: #191970; font-size: 24px; }
    h2 { margin: 22px 0 12px; color: #191970; font-size: 16px; }
    h3 { margin: 0 0 10px; color: #191970; font-size: 14px; }
    .muted { color: #6b7280; margin: 4px 0; font-size: 12px; }
    .meta { text-align: right; font-size: 12px; color: #4b5563; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 18px; }
    .kpi, .panel { border: 1px solid #e6e9f5; border-radius: 14px; padding: 14px; background: linear-gradient(180deg, #fff 0%, #fafbff 100%); }
    .kpi span { color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .kpi strong { display: block; color: #191970; font-size: 20px; margin-top: 5px; }
    .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
    .filters { width: 100%; border-collapse: collapse; }
    .filters td { border: 1px solid #e6e9f5; padding: 8px; font-size: 12px; }
    .filters td:first-child { color: #6b7280; font-weight: 700; width: 28%; }
    .bars { display: grid; gap: 7px; }
    .bar-row { display: flex; justify-content: space-between; border-bottom: 1px solid #edf0f8; padding-bottom: 5px; font-size: 12px; }
    table.detail { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11px; }
    table.detail th { text-align: left; color: #191970; background: #f4f6ff; padding: 9px; border-bottom: 1px solid #dfe4f4; }
    table.detail td { padding: 8px; border-bottom: 1px solid #edf0f8; }
    table.detail tr:nth-child(even) td { background: #fafbff; }
    footer { margin-top: 20px; padding-top: 12px; border-top: 1px solid #e6e9f5; display: flex; justify-content: space-between; color: #6b7280; font-size: 11px; }
    @media print { body { background: #fff; padding: 0; } .page { border: 0; border-radius: 0; } }
  </style>
</head>
<body>
  <main class="page">
    <header>
      <div class="brand">
        <img src="${payload.metadata.logo}" alt="SGC" />
        <div>
          <h1>${escapeHtml(payload.reportTitle)}</h1>
          <p class="muted">${escapeHtml(payload.metadata.cemeteryName)}</p>
          <p class="muted">Sistema de Gerenciamento de Cemiterios</p>
        </div>
      </div>
      <div class="meta">
        <strong>${escapeHtml(payload.metadata.generatedAtLabel)}</strong><br />
        Usuario: ${escapeHtml(payload.metadata.userName)}<br />
        Codigo: ${escapeHtml(payload.metadata.reportHash)}
      </div>
    </header>

    <section class="kpis">
      ${payload.summary.map((item) => `<article class="kpi"><span>${escapeHtml(item.label)}</span><strong>${escapeHtml(item.value)}</strong><p class="muted">${escapeHtml(item.hint)}</p></article>`).join("")}
    </section>

    <h2>Filtros aplicados</h2>
    <table class="filters">
      <tbody>
        ${(filters.length ? filters : [{ label: "Filtros", value: "Nenhum filtro adicional aplicado" }]).map((item) => `<tr><td>${escapeHtml(item.label)}</td><td>${escapeHtml(item.value)}</td></tr>`).join("")}
      </tbody>
    </table>

    <h2>Graficos e distribuicoes</h2>
    <section class="grid">${chartBlocks}</section>

    <h2>Tabela detalhada</h2>
    <table class="detail">
      <thead><tr>${payload.table.columns.map((column) => `<th>${escapeHtml(column.label)}</th>`).join("")}</tr></thead>
      <tbody>
        ${payload.table.rows.map((row) => `<tr>${payload.table.columns.map((column) => `<td>${escapeHtml(row[column.key])}</td>`).join("")}</tr>`).join("")}
      </tbody>
    </table>

    <footer>
      <span>${escapeHtml(payload.metadata.generatedAtLabel)} - ${escapeHtml(payload.metadata.userName)}</span>
      <span>Pagina 1 - ${escapeHtml(payload.metadata.reportHash)}</span>
    </footer>
  </main>
</body>
</html>`;
};

export default function RelatoriosComponent() {
    const user = useAuthStore((state) => state.user);
    const [sepultamentos, setSepultamentos] = useState([]);
    const [exumacoes, setExumacoes] = useState([]);
    const [activeReport, setActiveReport] = useState("sepultamentos");
    const [isLoading, setIsLoading] = useState(false);
    const [exportLoading, setExportLoading] = useState("");
    const [exportError, setExportError] = useState("");
    const [page, setPage] = useState(1);
    const [selectedItem, setSelectedItem] = useState(null);
    const [filters, setFilters] = useState(initialFilters);
    const { showError, showWarning, ToastElement } = useToastFeedback();

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
                showError("Erro ao carregar relatórios");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [showError]);

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
                    label: "Total de exumações",
                    value: total.toLocaleString("pt-BR"),
                    hint: "Registros filtrados",
                    icon: <LuFlower2 />,
                    tone: "success",
                },
                {
                    label: "Transferências",
                    value: transferencias.toLocaleString("pt-BR"),
                    hint: "Destinos transferidos",
                    icon: <FaExchangeAlt />,
                    tone: "success",
                },
                {
                    label: "Média mensal",
                    value: mediaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
                    hint: "Exumações por mês",
                    icon: <FaChartBar />,
                    tone: "success",
                },
                {
                    label: "Arrecadação",
                    value: formatCurrencyBRL(arrecadacao),
                    hint: "Total no período",
                    icon: <RiMoneyDollarBoxFill />,
                    tone: "success",
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
                tone: "success",
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
                tone: "success",
            },
            {
                label: "Arrecadação",
                value: formatCurrencyBRL(arrecadacao),
                hint: "Total no periodo",
                icon: <RiMoneyDollarBoxFill />,
                tone: "success",
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

    const exportSnapshot = useMemo(() => {
        const generatedAt = new Date();
        const reportTitle = isExumacoesReport ? "Relatorio de Exumacoes" : "Relatorio de Sepultamentos";
        const appliedFilters = [
            { key: "search", label: "Busca textual", value: filters.search || "" },
            { key: "periodo", label: "Periodo", value: periodLabel },
            { key: "dataInicio", label: "Periodo inicial", value: filters.dataInicio ? formatDateDMY(filters.dataInicio, filters.dataInicio) : "" },
            { key: "dataFim", label: "Periodo final", value: filters.dataFim ? formatDateDMY(filters.dataFim, filters.dataFim) : "" },
            { key: "quadra", label: "Quadra", value: filters.quadra ? `Quadra ${filters.quadra}` : "Todas" },
            { key: "sepultura", label: "Sepultura", value: filters.sepultura || "Todas" },
            { key: "tipoSepultamento", label: "Tipo de sepultamento", value: !isExumacoesReport ? (filters.tipo === "all" ? "Todos" : filters.tipo) : "" },
            { key: "situacaoFinanceira", label: "Situacao financeira", value: filters.situacaoFinanceira || "" },
            { key: "faixaValor", label: "Faixa de valor", value: filters.faixaValor || "" },
            { key: "cemiterio", label: "Cemiterio", value: filters.cemiterio || "" },
            { key: "responsavel", label: "Responsavel", value: filters.responsavel || "" },
            { key: "destinoExumacao", label: "Destino da exumacao", value: isExumacoesReport ? (filters.destino ? getDestinoLabel(filters.destino) : "Todos") : "" },
            { key: "tipoExumacao", label: "Tipo de exumacao", value: isExumacoesReport ? (filters.tipo === "all" ? "Todos" : getTypeText({ tipo: filters.tipo })) : "" },
        ];

        const table = isExumacoesReport
            ? {
                columns: [
                    { key: "data", label: "Data" },
                    { key: "falecido", label: "Falecido" },
                    { key: "destino", label: "Destino" },
                    { key: "ossario", label: "Ossario" },
                    { key: "responsavel", label: "Responsavel" },
                    { key: "taxa", label: "Taxa" },
                    { key: "situacao", label: "Situacao" },
                ],
                rows: filteredItems.map((item) => ({
                    data: formatDateDMY(getExumacaoDate(item), "--"),
                    falecido: getExumacaoName(item),
                    destino: getDestinoLabel(classifyDestino(item)),
                    ossario: classifyDestino(item) === "ossario" ? getExumacaoDestino(item) : "--",
                    responsavel: item?.responsavel || item?.coveiro || item?.usuario || "--",
                    taxa: formatCurrencyBRL(item?.taxa_valor),
                    situacao: getStatusLabel(item),
                })),
            }
            : {
                columns: [
                    { key: "data", label: "Data" },
                    { key: "falecido", label: "Falecido" },
                    { key: "documento", label: "CPF/documento" },
                    { key: "quadra", label: "Quadra" },
                    { key: "sepultura", label: "Sepultura" },
                    { key: "tipo", label: "Tipo" },
                    { key: "taxa", label: "Taxa" },
                    { key: "situacaoFinanceira", label: "Situacao financeira" },
                    { key: "responsavel", label: "Responsavel" },
                ],
                rows: filteredItems.map((item) => ({
                    data: formatDateDMY(item?.dh_sep, "--"),
                    falecido: item?.nome_sep || item?.nome || "--",
                    documento: item?.cpf || item?.documento || item?.doc_falecido || "--",
                    quadra: item?.quadra_sep || "--",
                    sepultura: item?.num_sepultura_sep || "--",
                    tipo: getTypeText(item),
                    taxa: formatCurrencyBRL(item?.taxa_valor),
                    situacaoFinanceira: getStatusLabel(item),
                    responsavel: item?.responsavel || item?.nome_resp || item?.coveiro_sep || "--",
                })),
            };

        const charts = isExumacoesReport
            ? [
                { key: "exumacoesMes", title: "Exumacoes por mes", data: monthlyExumacoes },
                { key: "destinos", title: "Destino da exumacao", data: destinoSeries },
                { key: "tipos", title: "Tipo de exumacao", data: exumacaoTypeSeries },
            ]
            : [
                { key: "sepultamentosMes", title: "Sepultamentos por mes", data: monthlySepultamentos },
                { key: "tipos", title: "Tipo de sepultamento", data: sepultamentoTypeSeries },
                { key: "arrecadacaoMensal", title: "Arrecadacao mensal", data: monthlyRevenue },
            ];

        const snapshot = {
            reportType: isExumacoesReport ? "exumacoes" : "sepultamentos",
            reportTitle,
            filters: {
                buscaTextual: filters.search || "",
                periodo: filters.periodo,
                periodoInicial: filters.dataInicio || "",
                periodoFinal: filters.dataFim || "",
                quadra: filters.quadra || "",
                sepultura: filters.sepultura || "",
                tipoSepultamento: !isExumacoesReport && filters.tipo !== "all" ? filters.tipo : "",
                situacaoFinanceira: filters.situacaoFinanceira || "",
                faixaValor: filters.faixaValor || "",
                cemiterio: filters.cemiterio || "",
                responsavel: filters.responsavel || "",
                destinoExumacao: isExumacoesReport ? filters.destino || "" : "",
                tipoExumacao: isExumacoesReport && filters.tipo !== "all" ? filters.tipo : "",
            },
            appliedFilters,
            summary: stats.map(({ label, value, hint, tone }) => ({ label, value, hint, tone })),
            charts,
            table,
            workbook: {
                sheets: [
                    { name: "Resumo executivo", summary: stats.map(({ label, value, hint }) => ({ label, value, hint })), charts },
                    { name: "Dados completos", columns: table.columns, rows: table.rows },
                ],
                options: {
                    autoFilter: true,
                    freezeHeader: true,
                    autoWidth: true,
                    alternatingRows: true,
                    conditionalColors: true,
                },
            },
            csv: {
                encoding: "UTF-8",
                delimiter: ";",
                columns: table.columns,
            },
            metadata: {
                logo: sgcLogo,
                cemeteryName: filters.cemiterio || "Cemiterio do Cambiri",
                generatedAt: generatedAt.toISOString(),
                generatedAtLabel: formatDateTimeBR(generatedAt),
                userName: getUserName(user),
                systemName: "SGC - Sistema de Gerenciamento de Cemiterios",
            },
        };

        return {
            ...snapshot,
            metadata: {
                ...snapshot.metadata,
                reportHash: buildReportHash(snapshot),
            },
        };
    }, [
        destinoSeries,
        exumacaoTypeSeries,
        filteredItems,
        filters,
        isExumacoesReport,
        monthlyExumacoes,
        monthlyRevenue,
        monthlySepultamentos,
        periodLabel,
        sepultamentoTypeSeries,
        stats,
        user,
    ]);

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

    const handleExport = async (format) => {
        setExportError("");
        setExportLoading(format);

        try {
            if (format === "pdf") {
                handlePrint();
                return;
            }

            let content = "";

            if (format === "csv") {
                content = buildCsvContent(exportSnapshot);
            } else if (format === "xlsx") {
                content = buildExcelContent(exportSnapshot);
            }

            const blob = new Blob([content], { type: getMimeType(format) });
            const filename = `${exportSnapshot.reportType}-${exportSnapshot.metadata.reportHash}.${getFileExtension(format)}`;
            downloadBlob(blob, filename);
        } catch (error) {
            console.error("Erro ao exportar relatorio", error);
            setExportError("Nao foi possivel gerar o arquivo localmente com os dados atuais.");
            showError("Nao foi possivel gerar o arquivo localmente com os dados atuais.");
        } finally {
            setExportLoading("");
        }
    };

    const handlePrint = () => {
        setExportError("");
        const printWindow = window.open("", "_blank", "noopener,noreferrer,width=1200,height=800");
        if (!printWindow) {
            setExportError("Permita pop-ups para imprimir o relatorio.");
            showWarning("Permita pop-ups para imprimir o relatório.");
            return;
        }

        printWindow.document.open();
        printWindow.document.write(renderPrintHtml(exportSnapshot));
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
            printWindow.print();
        }, 350);
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
        <>
            {ToastElement}
        <Container>
            <PageHeader>
                <HeaderCopy>
                    <Title>Relatórios Operacionais</Title>
                    <Subtitle>Visualize a movimentação de sepultamentos e exumações com filtros, indicadores e gráficos consolidados.</Subtitle>
                </HeaderCopy>
                <PeriodChip>
                    <PeriodChipLabel>Período ativo</PeriodChipLabel>
                    <PeriodChipValue>{periodLabel}</PeriodChipValue>
                    <PeriodChipValue>{filteredItems.length.toLocaleString("pt-BR")} registros filtrados</PeriodChipValue>
                </PeriodChip>
            </PageHeader>

            <ReportModeTabs>
                <ReportModeButton type="button" $active={!isExumacoesReport} onClick={() => handleReportMode("sepultamentos")}>
                    <FaCross /> Sepultamentos
                </ReportModeButton>
                <ReportModeButton type="button" $active={isExumacoesReport} onClick={() => handleReportMode("exumacoes")}>
                    <LuFlower2 /> Exumações
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
                                        <MenuItem key="crianca" value="crianca">Criança</MenuItem>,
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
                                <InputLabel sx={filterLabelSx}>Período</InputLabel>
                                <Select value={filters.periodo} label="Periodo" onChange={handleFilterChange("periodo")} sx={filterSelectSx}>
                                    {PERIOD_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <SystemButton type="button" tone="cancel" onClick={clearFilters} sx={{ minHeight: 50 }}>
                                <FaFilter /> Limpar filtros
                            </SystemButton>
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
                            <SystemButton type="button" tone="cancel" onClick={clearFilters} sx={{ minHeight: 50 }}>
                                <FaFilter /> Limpar filtros
                            </SystemButton>
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
                                        <FaChartBar /> {isExumacoesReport ? "Exumações por mês" : "Sepultamentos por mês"}
                                    </ChartTitle>
                                    <ChartSubtitle>Distribuição temporal dos registros filtrados.</ChartSubtitle>
                                </div>
                            </ChartHeader>
                            <ChartBody>
                                <RelatoriosSepultadosMesChart data={isExumacoesReport ? monthlyExumacoes : monthlySepultamentos} loading={isLoading} label={isExumacoesReport ? "Exumacoes" : "Sepultamentos"} />
                            </ChartBody>
                        </ChartCard>

                        <ChartCard>
                            <ChartHeader>
                                <div>
                                    <ChartTitle>{isExumacoesReport ? "Destino da exumação" : "Tipo de sepultamento"}</ChartTitle>
                                    <ChartSubtitle>{isExumacoesReport ? "Ossário, crematório, transladado e outros." : "Adulto, criança e indigente."}</ChartSubtitle>
                                </div>
                            </ChartHeader>
                            <ChartBody>
                                <RelatoriosTipoSepultamentoPie data={isExumacoesReport ? destinoSeries : sepultamentoTypeSeries} loading={isLoading} />
                            </ChartBody>
                        </ChartCard>

                        <ChartCard>
                            <ChartHeader>
                                <div>
                                    <ChartTitle>{isExumacoesReport ? "Tipo de exumação" : "Arrecadação mensal"}</ChartTitle>
                                    <ChartSubtitle>{isExumacoesReport ? "Adulto, crianca, indigente e outros." : "Somatório de taxa aplicada por competência."}</ChartSubtitle>
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
                            <Table $minWidth="900px">
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
                                                <Th>Ações</Th>
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
                                                <Th>Ações</Th>
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
                                    Próxima
                                </PageButton>
                            </Pagination>
                        )}
                    </TableCard>

                    <RelatoriosExportActions
                        loadingFormat={exportLoading}
                        error={exportError}
                        onExport={handleExport}
                        onPrint={handlePrint}
                    />
                </MainColumn>
            </LayoutGrid>

            <DefaultModal
                open={Boolean(selectedItem)}
                title={isExumacoesReport ? getExumacaoName(selectedItem) : selectedItem?.nome_sep || selectedItem?.nome || "Detalhes do registro"}
                subtitle={
                    isExumacoesReport
                        ? `Exumacao registrada em ${formatDateDMY(getExumacaoDate(selectedItem), "--")}.`
                        : `Sepultamento registrado em ${formatDateDMY(selectedItem?.dh_sep, "--")}.`
                }
                fields={selectedItem ? renderModalFields() : []}
                onClose={() => setSelectedItem(null)}
            />
        </Container>
        </>
    );
}
