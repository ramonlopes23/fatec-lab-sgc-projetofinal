import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { FaArchive, FaEdit, FaEye, FaFilter, FaSearch, FaUserClock, FaUsers } from "react-icons/fa";
import { FaPerson, FaPersonDress } from "react-icons/fa6";
import FormControl from "@mui/material/FormControl";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import api from "../../../services/index.js";
import { useFormModal, useToastFeedback } from "../../../hooks";
import { formatDateDMY, getFalecidoCpf, getFalecidoDeathDate, getFalecidoId, getFalecidoIdFromRecord, getFalecidoMotherName, getFalecidoName, getSepulturaNumber, normalizeCemiterio, normalizeFalecido, normalizeQuadra, normalizeText, parseDateValue, resolveCemiterioName, resolveQuadraDisplay, sortNumericText } from "../../../utils";
import {
  Actions,
  ChartStatBody,
  ChartStatCard,
  ChartLegend,
  ChartLegendDot,
  ChartLegendItem,
  ChartTitle,
  Container,
  EmptyState,
  Field,
  FilterCard,
  FilterGrid,
  FilterRow,
  HeaderCopy,
  IconBtn,
  Input,
  PageButton,
  PageHeader,
  Pagination,
  PeriodChip,
  PeriodChipLabel,
  PeriodChipValue,
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
  Th,
  THead,
  Tr,
} from "../../common/DefaultTable";
import SystemButton from "../../common/SystemButton";
import DefaultModal, {
  DefaultModalActions,
  DefaultModalGrid,
} from "../../common/DefaultModal";

const PAGE_SIZE = 8;

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

const initialFilters = {
  search: "",
  faixaEtaria: "",
  cemiterio: "",
  quadra: "",
  sepultura: "",
  situacao: "",
};

const normalizeId = (value) => (value === undefined || value === null ? "" : String(value));

const getFalecidoIdFromSepultamento = (sepultamento) => getFalecidoIdFromRecord(sepultamento);

const getSepultamentoIdFromExumacao = (exumacao) => normalizeId(
  exumacao?.sepultamentoId ?? exumacao?.sepultamento_id ?? exumacao?.sepultamento
);

const getFalecidoNome = (falecido) => getFalecidoName(falecido) || "-";
const getCpf = (falecido) => getFalecidoCpf(falecido) || "-";
const getMae = (falecido) => getFalecidoMotherName(falecido) || "-";
const getObitoDate = (record) => getFalecidoDeathDate(record);

const getCadastroDate = (record) => (
  record?.created_at || record?.createdAt || record?.data_cadastro || record?.dh_falec || record?.data_obito || record?.sepultamento?.dh_sep
);

const getAgeNumber = (record) => {
  const age = Number(String(record?.idade ?? "").replace(/\D/g, ""));
  return Number.isFinite(age) ? age : null;
};

const getAgeRange = (record) => {
  const age = getAgeNumber(record);
  if (age === null) return "sem";
  if (age <= 12) return "INF";
  if (age <= 17) return "ADO";
  if (age <= 29) return "JOV";
  if (age <= 59) return "ADU";
  return "IDO";
};

const ageRangeLabel = (key) => ({
  INF: "Infantil (0-12)",
  ADO: "Adolescente (13-17)",
  JOV: "Jovem adulto (18-29)",
  ADU: "Adulto (30-59)",
  IDO: "Idoso (60+)",
  sem: "Sem idade",
}[key] || "Sem idade");

const AGE_RANGE_ORDER = ["INF", "ADO", "JOV", "ADU", "IDO", "sem"];

const AGE_RANGE_COLORS = {
  INF: "#3b82f6",
  ADO: "#5ec58f",
  JOV: "#6f63ff",
  ADU: "#ffb05e",
  IDO: "#ef4444",
  sem: "#94a3b8",
};

const getSituacao = (record) => {
  if (record?.exumacao || record?.sepultamento?.foi_exumado) return "exumado";
  if (record?.sepultamento) return "sepultado";
  return "aguardando";
};

const situacaoLabel = (key) => ({
  exumado: "Exumado",
  sepultado: "Sepultado",
  aguardando: "Aguardando",
}[key] || "Aguardando");

const situacaoTone = (key) => {
  if (key === "exumado") return "danger";
  if (key === "aguardando") return "warning";
  return "success";
};

const getCemiterio = (record) => (
  record?.cemiterio_nome || record?.cemiterio || record?.sepultamento?.cemiterio_nome || record?.sepultamento?.cemiterio || record?.sepultamento?.cemetery || "-"
);

const getQuadra = (record) => String(record?.quadra_num || record?.sepultamento?.quadra_num || "").trim();

const getSepultura = (record) => getSepulturaNumber(record) || getSepulturaNumber(record?.sepultamento) || "";

const isCurrentMonth = (value) => {
  const date = parseDateValue(value);
  if (!date) return false;
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
};

function AgePieChart({ data = [], loading = false, compact = false }) {
  if (loading) return <EmptyState>Carregando grafico...</EmptyState>;
  if (!data.length) return <EmptyState>Sem dados para os filtros atuais.</EmptyState>;

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={compact ? 24 : 58}
          outerRadius={compact ? 46 : 90}
          paddingAngle={3}
          stroke="none"
        >
          {data.map((entry) => (
            <Cell key={entry.key} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => [`${value} (${total ? ((Number(value) / total) * 100).toFixed(1) : 0}%)`, name]}
          contentStyle={{ borderRadius: 12, border: "1px solid #dbe1f2", boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)" }}
        />
        {!compact && <Legend verticalAlign="bottom" height={42} iconType="circle" />}
      </PieChart>
    </ResponsiveContainer>
  );
}

export default function RegistrosComponent() {
  const [records, setRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [page, setPage] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const {
    form: modalForm,
    setForm: setModalForm,
    editingId,
    modalOpen,
    isSubmitting,
    setIsSubmitting,
    openEdit,
    closeModal: hookCloseModal,
  } = useFormModal({ initialForm: {} });
  const { showSuccess, showError, ToastElement } = useToastFeedback();

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resFalecidos, resExumacoes, resSepultamentos, resQuadras, resCemiterios] = await Promise.all([
        api.get("/falecidos").catch(() => ({ data: [] })),
        api.get("/exumacoes").catch(() => ({ data: [] })),
        api.get("/sepultamentos").catch(() => ({ data: [] })),
        api.get("/quadras").catch(() => ({ data: [] })),
        api.get("/cemiterios").catch(() => ({ data: [] })),
      ]);

      const falecidosData = Array.isArray(resFalecidos.data) ? resFalecidos.data.map(normalizeFalecido) : [];
      const exumacoesData = Array.isArray(resExumacoes.data) ? resExumacoes.data : [];
      const sepultamentosData = Array.isArray(resSepultamentos.data) ? resSepultamentos.data : [];
      const quadrasData = Array.isArray(resQuadras.data) ? resQuadras.data.map(normalizeQuadra) : [];
      const cemiteriosData = Array.isArray(resCemiterios.data) ? resCemiterios.data.map(normalizeCemiterio) : [];

      const sepultamentosByFalecido = new Map();
      sepultamentosData.forEach((sepultamento) => {
        if (sepultamento?.arquivado) return;
        const falecidoId = getFalecidoIdFromSepultamento(sepultamento);
        if (falecidoId && !sepultamentosByFalecido.has(falecidoId)) sepultamentosByFalecido.set(falecidoId, sepultamento);
      });

      const exumacoesBySepultamento = new Map();
      exumacoesData.forEach((exumacao) => {
        const sepultamentoId = getSepultamentoIdFromExumacao(exumacao);
        if (sepultamentoId && !exumacoesBySepultamento.has(sepultamentoId)) exumacoesBySepultamento.set(sepultamentoId, exumacao);
      });

      const enriched = falecidosData
        .filter((falecido) => !falecido?.arquivado)
        .map((falecido) => {
          const falecidoId = getFalecidoId(falecido);
          const sepultamento = sepultamentosByFalecido.get(falecidoId) || null;
          const exumacao = sepultamento ? exumacoesBySepultamento.get(normalizeId(sepultamento?.id)) || null : null;
          const cemiterio = resolveCemiterioName(sepultamento?.cemiterio ?? sepultamento?.cemiterio_nome ?? sepultamento?.cemetery ?? "", cemiteriosData, "");

          return {
            ...falecido,
            sepultamento,
            exumacao,
            quadra_num: resolveQuadraDisplay(sepultamento?.quadra_sep ?? sepultamento?.quadra ?? "", quadrasData, ""),
            sepultura: getSepulturaNumber(sepultamento),
            cemiterio: cemiterio || sepultamento?.cemiterio_nome || sepultamento?.cemiterio || "",
            data_obito_sep: sepultamento?.data_obito_sep || "",
          };
        });

      setRecords(enriched);
      return enriched;
    } catch (error) {
      console.error("Erro ao carregar registros", error);
      setRecords([]);
      showError("Erro ao carregar registros");
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredRecords = useMemo(() => {
    const search = normalizeText(filters.search);

    return records.filter((record) => {
      const name = normalizeText(getFalecidoNome(record));
      const cpf = normalizeText(getCpf(record));
      if (search && !name.includes(search) && !cpf.includes(search)) return false;

      if (filters.faixaEtaria && getAgeRange(record) !== filters.faixaEtaria) return false;
      if (filters.cemiterio && String(getCemiterio(record)) !== String(filters.cemiterio)) return false;
      if (filters.quadra && String(getQuadra(record)) !== String(filters.quadra)) return false;
      if (filters.sepultura && String(getSepultura(record)) !== String(filters.sepultura)) return false;
      if (filters.situacao && getSituacao(record) !== filters.situacao) return false;

      return true;
    });
  }, [filters, records]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageRecords = filteredRecords.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page !== currentPage) setPage(currentPage);
  }, [currentPage, page]);

  const stats = useMemo(() => {
    const total = filteredRecords.length;
    const semSepultamento = filteredRecords.filter((item) => !item.sepultamento).length;
    const esteMes = filteredRecords.filter((item) => isCurrentMonth(getCadastroDate(item))).length;
    const masculino = filteredRecords.filter((item) => normalizeText(item?.sexo).startsWith("m")).length;
    const feminino = filteredRecords.filter((item) => normalizeText(item?.sexo).startsWith("f")).length;
    const proporcao = masculino || feminino ? `${masculino}/${feminino}` : "-";

    return [
      {
        label: "Total de registros",
        value: total.toLocaleString("pt-BR"),
        hint: "Falecidos no recorte",
        icon: <FaUsers />,
        tone: "success",
      },
      {
        label: "Sem sepultamento",
        value: semSepultamento.toLocaleString("pt-BR"),
        hint: "Aguardando processo",
        icon: <FaUserClock />,
        tone: "success",
      },
      {
        label: "Registros este mês",
        value: esteMes.toLocaleString("pt-BR"),
        hint: "Entradas recentes",
        icon: <FaArchive />,
        tone: "success",
      },
      {
        label: "Masculino/Feminino",
        value: proporcao,
        hint: "Proporção informada",
        icon: masculino >= feminino ? <FaPerson /> : <FaPersonDress />,
        tone: "success",
      },
    ];
  }, [filteredRecords]);

  const ageSeries = useMemo(() => {
    const totals = filteredRecords.reduce((acc, record) => {
      const range = getAgeRange(record);
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    return AGE_RANGE_ORDER
      .map((key) => ({ key, label: ageRangeLabel(key), value: totals[key] || 0, color: AGE_RANGE_COLORS[key] }))
      .filter((item) => item.value > 0);
  }, [filteredRecords]);

  const cemeteryOptions = useMemo(() => {
    const values = Array.from(new Set(records.map((item) => String(getCemiterio(item)).trim()).filter((value) => value && value !== "-")));
    return values.sort((left, right) => left.localeCompare(right, "pt-BR", { sensitivity: "base" }));
  }, [records]);

  const quadraOptions = useMemo(() => {
    const base = filters.cemiterio ? records.filter((item) => String(getCemiterio(item)) === String(filters.cemiterio)) : records;
    const values = Array.from(new Set(base.map((item) => String(getQuadra(item)).trim()).filter(Boolean)));
    return values.sort(sortNumericText);
  }, [filters.cemiterio, records]);

  const sepulturaOptions = useMemo(() => {
    const base = records.filter((item) => {
      if (filters.cemiterio && String(getCemiterio(item)) !== String(filters.cemiterio)) return false;
      if (filters.quadra && String(getQuadra(item)) !== String(filters.quadra)) return false;
      return true;
    });
    const values = Array.from(new Set(base.map((item) => String(getSepultura(item)).trim()).filter(Boolean)));
    return values.sort(sortNumericText);
  }, [filters.cemiterio, filters.quadra, records]);

  const updateFilter = (field) => (event) => {
    const value = event.target.value;
    setFilters((previous) => ({
      ...previous,
      [field]: value,
      ...(field === "cemiterio" ? { quadra: "", sepultura: "" } : {}),
      ...(field === "quadra" ? { sepultura: "" } : {}),
    }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setIsEditing(false);
  };

  const openModal = (record, editing = false) => {
    openEdit(record?.id, {
      ...record,
      nome_fal: getFalecidoNome(record),
      data_obito: getObitoDate(record),
      cemiterio: getCemiterio(record),
      quadra_num: getQuadra(record),
      sepultura: getSepultura(record),
    });
    setIsEditing(editing);
  };

  const closeModal = () => {
    hookCloseModal();
    setIsEditing(false);
  };

  const handleChangeModal = (key, value) => {
    setModalForm((previous) => ({ ...previous, [key]: value }));
  };

  const handleSave = async (event) => {
    event?.preventDefault();
    if (isSubmitting) return;
    if (!editingId) return;

    const selectedRecord = records.find((r) => String(r.id) === String(editingId));
    if (!selectedRecord?.id) {
      showError("Registro selecionado não foi encontrado");
      return;
    }

    const falPayload = {
      nome_fal: modalForm.nome_fal,
      idade: modalForm.idade,
      sexo: modalForm.sexo,
      cpf: modalForm.cpf,
      data_nasc: modalForm.data_nasc,
      dh_falec: modalForm.data_obito,
      filiacao_pai: modalForm.filiacao_pai,
      filiacao_mae: modalForm.filiacao_mae,
      profissao: modalForm.profissao,
      estado_civil: modalForm.estado_civil,
      nacionalidade: modalForm.nacionalidade,
      causa_mortis: modalForm.causa_mortis,
      nome_resp: modalForm.nome_resp,
      tel_resp: modalForm.tel_resp,
      endereco_resp: modalForm.endereco_resp,
      doc_resp: modalForm.doc_resp,
    };

    try {
      setIsSubmitting(true);
      await api.patch(`/falecidos/${selectedRecord.id}`, falPayload);

      if (selectedRecord?.sepultamento?.id) {
        await api.patch(`/sepultamentos/${selectedRecord.sepultamento.id}`, {
          nome_sep: modalForm.nome_fal,
          quadra_sep: modalForm.quadra_num,
          num_sepultura_sep: modalForm.sepultura,
          data_obito_sep: modalForm.data_obito,
          cemiterio: modalForm.cemiterio,
        }).catch(() => { });
      }

      const updated = await loadAll();
      const nextSelected = updated.find((item) => String(item.id) === String(editingId));
      if (nextSelected) {
        setModalForm({
          ...nextSelected,
          nome_fal: getFalecidoNome(nextSelected),
          data_obito: getObitoDate(nextSelected),
          cemiterio: getCemiterio(nextSelected),
          quadra_num: getQuadra(nextSelected),
          sepultura: getSepultura(nextSelected),
        });
      }
      setIsEditing(false);
      showSuccess("Registro salvo com sucesso");
    } catch (error) {
      console.error("Erro ao salvar registro", error);
      showError(error?.response?.data?.message || error?.message || "Não foi possível salvar o registro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleArchive = async (record) => {
    if (!record) return;

    try {
      if (record.sepultamento?.id) {
        await api.patch(`/sepultamentos/${record.sepultamento.id}`, { arquivado: true });
      } else if (record.id) {
        await api.patch(`/falecidos/${record.id}`, { arquivado: true });
      }
      await loadAll();
      showSuccess("Registro arquivado com sucesso");
    } catch (error) {
      console.error("Erro ao arquivar registro", error);
      showError(error?.response?.data?.message || error?.message || "Não foi possível arquivar o registro");
    }
  };

  const modalFields = [
    ["Nome", "nome_fal"],
    ["CPF", "cpf"],
    ["Data do obito", "data_obito", "date"],
    ["Idade", "idade"],
    ["Sexo", "sexo"],
    ["Filiacao pai", "filiacao_pai"],
    ["Filiacao mae", "filiacao_mae"],
    ["Profissao", "profissao"],
    ["Estado civil", "estado_civil"],
    ["Nacionalidade", "nacionalidade"],
    ["Causa mortis", "causa_mortis"],
    ["Cemiterio", "cemiterio"],
    ["Quadra", "quadra_num"],
    ["Sepultura", "sepultura"],
    ["Responsavel", "nome_resp"],
    ["Contato do responsavel", "tel_resp"],
  ];

  const getModalFieldValue = (key, type) => {
    const value = modalForm?.[key];
    if (!value) return "";
    return type === "date" ? formatDateDMY(value) : value;
  };

  const modalViewFields = modalFields.map(([label, key, type]) => [
    label,
    getModalFieldValue(key, type),
  ]);

  return (
    <>
      {ToastElement}
      <Container>
        <PageHeader>
          <HeaderCopy>
            <Title>Registros de Falecidos</Title>
            <Subtitle>Acompanhe os dados cadastrais dos falecidos, sua situação e localização nos cemitérios.</Subtitle>
          </HeaderCopy>
          <PeriodChip>
            <PeriodChipLabel>Base ativa</PeriodChipLabel>
            <PeriodChipValue>{records.length.toLocaleString("pt-BR")} falecidos cadastrados</PeriodChipValue>
            <PeriodChipValue>{filteredRecords.length.toLocaleString("pt-BR")} registros filtrados</PeriodChipValue>
          </PeriodChip>
        </PageHeader>

        <FilterCard>
          <FilterGrid>
            <SearchWrapper>
              <TextField
                fullWidth
                size="medium"
                value={filters.search}
                onChange={updateFilter("search")}
                placeholder="Buscar por nome ou CPF"
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

            <FilterRow>
              <FormControl fullWidth size="medium">
                <InputLabel sx={filterLabelSx}>Faixa etária</InputLabel>
                <Select value={filters.faixaEtaria} label="Faixa etária" onChange={updateFilter("faixaEtaria")} sx={filterSelectSx}>
                  <MenuItem value="">Todas</MenuItem>
                  {AGE_RANGE_ORDER.map((range) => (
                    <MenuItem key={range} value={range}>{ageRangeLabel(range)}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel sx={filterLabelSx}>Situação</InputLabel>
                <Select value={filters.situacao} label="Situacao" onChange={updateFilter("situacao")} sx={filterSelectSx}>
                  <MenuItem value="">Todas</MenuItem>
                  <MenuItem value="aguardando">Aguardando</MenuItem>
                  <MenuItem value="sepultado">Sepultado</MenuItem>
                  <MenuItem value="exumado">Exumado</MenuItem>
                </Select>
              </FormControl>
            </FilterRow>

            <FilterRow>
              <FormControl fullWidth size="medium">
                <InputLabel sx={filterLabelSx}>Cemitério</InputLabel>
                <Select value={filters.cemiterio} label="Cemiterio" onChange={updateFilter("cemiterio")} sx={filterSelectSx}>
                  <MenuItem value="">Todos</MenuItem>
                  {cemeteryOptions.map((cemiterio) => (
                    <MenuItem key={cemiterio} value={cemiterio}>{cemiterio}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="medium">
                <InputLabel sx={filterLabelSx}>Quadra</InputLabel>
                <Select value={filters.quadra} label="Quadra" onChange={updateFilter("quadra")} sx={filterSelectSx}>
                  <MenuItem value="">Todas</MenuItem>
                  {quadraOptions.map((quadra) => (
                    <MenuItem key={quadra} value={quadra}>Quadra {quadra}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </FilterRow>

            <FilterRow>
              <FormControl fullWidth size="medium">
                <InputLabel sx={filterLabelSx}>Sepultura</InputLabel>
                <Select value={filters.sepultura} label="Sepultura" onChange={updateFilter("sepultura")} sx={filterSelectSx}>
                  <MenuItem value="">Todas</MenuItem>
                  {sepulturaOptions.map((sepultura) => (
                    <MenuItem key={sepultura} value={sepultura}>{sepultura}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <SystemButton type="button" tone="cancel" onClick={clearFilters} sx={{ minHeight: 50 }}>
                <FaFilter /> Limpar filtros
              </SystemButton>
            </FilterRow>
          </FilterGrid>
        </FilterCard>

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
          <ChartStatCard>
            <ChartTitle>Faixa etária</ChartTitle>
            <ChartStatBody>
              <AgePieChart data={ageSeries} loading={isLoading} compact />
            </ChartStatBody>
            <ChartLegend>
              {AGE_RANGE_ORDER.filter((range) => range !== "sem").map((range) => (
                <ChartLegendItem key={range} title={ageRangeLabel(range)}>
                  <ChartLegendDot $color={AGE_RANGE_COLORS[range]} />
                  {range}
                </ChartLegendItem>
              ))}
            </ChartLegend>
          </ChartStatCard>
        </StatsGrid>

        <TableCard>
          <TableHeader>
            <div>
              <TableTitle>Falecidos cadastrados</TableTitle>
              {/*               <TableNote>{filteredRecords.length.toLocaleString("pt-BR")} registros encontrados.</TableNote>
 */}            </div>
          </TableHeader>

          <TableScroller>
            <Table>
              <THead>
                <tr>
                  <Th>Nome</Th>
                  <Th>Documento</Th>
                  <Th>Data do óbito</Th>
                  <Th>Idade</Th>
                  <Th>Filiacao mãe</Th>
                  <Th>Cemitério</Th>
                  <Th>Status</Th>
                  <Th>Ações</Th>
                </tr>
              </THead>
              <TBody>
                {pageRecords.length ? pageRecords.map((record, index) => {
                  const situacao = getSituacao(record);
                  return (
                    <Tr key={record.id || `${getFalecidoNome(record)}-${index}`} $index={index}>
                      <Td>{getFalecidoNome(record)}</Td>
                      <Td>{getCpf(record)}</Td>
                      <Td>{formatDateDMY(getObitoDate(record), "-")}</Td>
                      <Td>{record?.idade || "-"}</Td>
                      <Td>{getMae(record)}</Td>
                      <Td>{getCemiterio(record)}</Td>
                      <Td>
                        <StatusBadge $tone={situacaoTone(situacao)}>{situacaoLabel(situacao)}</StatusBadge>
                      </Td>
                      <Td>
                        <Actions>
                          <IconBtn type="button" onClick={() => openModal(record, false)} aria-label="Visualizar">
                            <FaEye />
                          </IconBtn>
                          <IconBtn type="button" $danger onClick={() => handleArchive(record)} aria-label="Arquivar">
                            <FaArchive />
                          </IconBtn>
                        </Actions>
                      </Td>
                    </Tr>
                  );
                }) : (
                  <tr>
                    <Td colSpan={8}>
                      <EmptyState>Nenhum registro encontrado com os filtros atuais.</EmptyState>
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

        <DefaultModal
          open={modalOpen}
          title={modalForm?.nome_fal || "Informacoes do falecido"}
          subtitle={isEditing ? "Edite os dados principais do registro." : "Visualização completa do registro cadastral."}
          fields={!isEditing ? modalViewFields : []}
          onClose={closeModal}
        >
          <form onSubmit={handleSave}>
            {isEditing ? (
              <DefaultModalGrid>
                {modalFields.map(([label, key, type]) => (
                  <Field key={key}>
                    {label}
                    <Input
                      type={type || "text"}
                      value={modalForm?.[key] || ""}
                      onChange={(event) => handleChangeModal(key, event.target.value)}
                      disabled={isSubmitting}
                    />
                  </Field>
                ))}
              </DefaultModalGrid>
            ) : null}

            <DefaultModalActions>
              {!isEditing && (
                <SystemButton
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    setIsEditing(true);
                  }}
                  disabled={isSubmitting}
                >
                  <FaEdit /> Editar
                </SystemButton>
              )}
              {isEditing && (
                <SystemButton type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar"}
                </SystemButton>
              )}
              <SystemButton type="button" tone="cancel" onClick={closeModal} disabled={isSubmitting}>
                Fechar
              </SystemButton>
            </DefaultModalActions>
          </form>
        </DefaultModal>
      </Container>
    </>
  );
}
