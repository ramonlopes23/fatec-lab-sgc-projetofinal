import React, { useState, useEffect, useMemo } from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { BtnPrimary, BtnPrimaryClose, BtnPrimarySave, ColumnLeft, ColumnRight, Container, Field, FormStyled, Label, ModalContent, ModalGrid, ModalOverlay, SearchBar, SearchIcon, SearchInput, SearchWrapper, SmallInput, SmallSelect, Title, TwoCols, IconBtn, TableWrapper, Table, Tr, THead, Td, TBody, Th } from "./styles"
import { FaFileCsv, FaFileExcel, FaFilePdf, FaSearch, FaEye } from "react-icons/fa";
import api from "../../services/api";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select"

export default function Relatorios() {

    const [search, setSearch] = useState("");
    const [tipoLista, setTipoLista] = useState("exumacoes");
    const [filters, setFilters] = useState({
        quadra: "",
        sepultura: "",
        tipo_sep: "",
        data_inicio: "",
        data_fim: "",
        status_taxa: ""
    });
    const [exumacoes, setExumacoes] = useState([]);
    const [sepultamentos, setSepultamentos] = useState([]);
    const [page, setPage] = useState(1);
    const [covas, setCovas] = useState([]);
    const [quadras, setQuadras] = useState([])
    const PAGE_SIZE = 10;
    const [isLoading, setIsLoading] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalForm, setModalForm] = useState(null);

    const formatCurrency = (v) => {
        const n = Number(v);
        return new Intl.NumberFormat('pt-br', { style: 'currency', currency: 'BRL' }).format(isNaN(n) ? 0 : n);
    };

    const taxaSomaTotal = useMemo(() => {
        return (sepultamentos || []).reduce((acc, it) => acc + (Number(it?.taxa_valor) || 0), 0);

    }, [sepultamentos]);

    const taxaSomaPeriodo = useMemo(() => {
        const start = filters.data_inicio ? new Date(filters.data_inicio) : null;
        const end = filters.data_fim ? new Date(filters.data_fim) : null;
        if (end) end.setHours(23, 59, 59, 999);
        if (!start && !end) return taxaSomaTotal;

        return (sepultamentos || []).reduce((acc, it) => {
            if (!it?.dh_sep) return acc;
            const d = new Date(it.dh_sep);
            if (start && d < start) return acc;
            if (end && d > end) return acc;
            return acc + (Number(it?.taxa_valor) || 0);
        }, 0)
    }, [sepultamentos, filters.data_inicio, filters.data_fim, taxaSomaTotal])

    const sepCountTotal = useMemo(() => (sepultamentos || []).length, [sepultamentos]);

    const sepCountPeriodo = useMemo(() => {
        const start = filters.data_inicio ? new Date(filters.data_inicio) : null;
        const end = filters.data_fim ? new Date(filters.data_fim) : null;
        if (end) end.setHours(23, 59, 59, 999);
        if (!start && !end) return sepCountTotal;

        return (sepultamentos || []).reduce((acc, it) => {
            if (!it?.dh_sep) return acc;
            const d = new Date(it.dh_sep);
            if (start && d < start) return acc;
            if (end && d > end) return acc;
            return acc + 1;
        }, 0);
    }, [sepultamentos, filters.data_inicio, filters.data_fim, sepCountTotal])

    useEffect(() => {
        loadData();
    }, []);

    const getStatusTaxa = (item) => {
        if (!item) return null;
        if (item.status_taxa) return String(item.status_taxa).toLowerCase();
        const val = Number(item.taxa_valor ?? 0);
        return val > 0 ? "pago" : "gratuito";
    }

    const matchesStatusFilter = (item) => {
        const want = String(filters.status_taxa || "").trim().toLowerCase();
        if (!want) return true;
        const s = getStatusTaxa(item);
        return s === want;
    }

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [rExu, rSep, rQuadras, rCovas] = await Promise.all([
                api.get("/exumacoes").catch(() => ({ data: [] })),
                api.get("/sepultamentos").catch(() => ({ data: [] })),
                api.get("/quadras").catch(() => ({ data: [] })),
                api.get("/covas").catch(() => ({ data: [] })),
            ]);
            setExumacoes(Array.isArray(rExu.data) ? rExu.data : []);
            setSepultamentos(Array.isArray(rSep.data) ? rSep.data : []);
            setQuadras(Array.isArray(rQuadras.data) ? rQuadras.data : []);
            setCovas(Array.isArray(rCovas.data) ? rCovas.data : []);
            setPage(1);
        } catch (err) {
            console.error("Erro ao carregar exumações/quadras/covas", err);

        } finally {
            setIsLoading(false);
        }
    };

    const sepulturasForQuadra = useMemo(() => {
        if (!filters.quadra) return [];
        return covas
            .filter(c => String(c.quadra_cova) === String(filters.quadra))
            .sort((a, b) => (String(a.num_cova || a.num_cova) > String(b.num_cova || b.num_cova) ? 1 : -1));

    }, [covas, filters.quadra]);

    const filtered = useMemo(() => {
        const s = String(search || "").trim().toLowerCase();
        const start = filters.data_inicio ? (() => {
            const [y, m, d] = String(filters.data_inicio).split("-").map(Number);
            return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
        })() : null;

        const end = filters.data_fim ? (() => {
            const [y, m, d] = String(filters.data_fim).split("-").map(Number);
            return new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
        })() : null;

        return exumacoes.filter(item => {
            const nome = String(item.nome_fal || "").toLowerCase();
            if (s && !nome.includes(s)) return false;

            if (filters.quadra) {
                const q = String(item.quadra_sep ?? "");
                if (q !== String(filters.quadra)) return false;
            }

            if (filters.sepultura) {
                const n = String(item.num_sepultura_sep ?? "");
                if (n !== String(filters.sepultura)) return false;
            }

            if (filters.tipo_sep) {
                const t = String(item.tipo_sep).toLowerCase();
                if (t && !t.includes(String(filters.tipo_sep).toLowerCase())) return false;
            }

            if ((start || end) && item.dh_exu) {
                const d = new Date(item.dh_exu);
/*              const itemDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
 */             if (start && d < start) return false;
                if (end && d > end) return false;
            }

            return true;
        });
    }, [exumacoes, search, filters]);

    const sepFiltered = useMemo(() => {
        const s = String(search || "").trim().toLowerCase();
        const start = filters.data_inicio ? (() => {
            const [y, m, d] = String(filters.data_inicio).split("-").map(Number);
            return new Date(y, (m || 1) - 1, d || 1, 0, 0, 0, 0);
        })() : null;

        const end = filters.data_fim ? (() => {
            const [y, m, d] = String(filters.data_fim).split("-").map(Number);
            return new Date(y, (m || 1) - 1, d || 1, 23, 59, 59, 999);
        })() : null;

        return sepultamentos.filter(item => {
            const nome = String(item.nome_sep || "").toLowerCase();
            if (s && !nome.includes(s)) return false;
            if ((start || end) && item.dh_sep) {
                const d = new Date(item.dh_sep);
                if (start && d < start) return false;
                if (end && d > end) return false;
            }

            if (filters.quadra) {
                const q = String(item.quadra_sep ?? "");
                if (q !== String(filters.quadra)) return false;
            }

            if (filters.sepultura) {
                const n = String(item.num_sepultura_sep ?? "");
                if (n !== String(filters.sepultura)) return false;
            }

            if (filters.status_taxa && !matchesStatusFilter(item)) return false;


            return true;
        })

    }, [sepultamentos, search, filters]);


    const totalPages = Math.max(1, Math.ceil((tipoLista === "exumacoes" ? filtered.length : sepFiltered.length) / PAGE_SIZE));
    const currentPage = Math.min(Math.max(1, Number(page || 1)), totalPages);
    const paginated = (tipoLista === "exumacoes" ? filtered : sepFiltered).slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

    useEffect(() => {
        if (page > totalPages) setPage(totalPages);
    }, [totalPages, page]);

    const applyFilters = () => setPage(1);

    const handleView = (item) => {
        setModalForm(item);
        setModalOpen(true);
    }

    const closeModal = () => {
        setModalOpen(false);
        setModalForm(null);
    }

    const exportCSV = () => {
        const rows = filtered.map(e => ({
            Nome: e.nome_fal || "",
            "Data exumação": e.dh_exu || "",
            "Quadra": e.quadra_sep ?? "",
            "Sepultura": e.num_sepultura_sep ?? "",
            "Destinação": e.destino || "",
            "Responsável": e.coveiro || ""

        }))

        const keys = Object.keys(rows[0] || { Nome: "" });
        const csv = [
            keys.join(","),
            ...rows.map(r => keys.map(k => `"${String(r[k] ?? "").replace(/"/g, '""')}"`).join(","))
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `exumacoes_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const exportPDF = () => {
        const newWin = window.open("", "_blank", "width=900, height=700");
        if (!newWin) return;
        const html = `
        <html><head><title>Exumações</title>
        <style>table{width:100%;border-collapse:collapse}th,td{border:1px solid #ccc;padding:8px}</style>
        </head><body>
        <h2>Exumações</h2>        
        <p>A Secretaria de Serviços Urbanos, por meio da Administração do Cemitério Municipal, informa que foram realizadas exumações no período de [data/período], em conformidade com as normas sanitárias e regulamentações vigentes.
As exumações têm como objetivo garantir a adequada gestão dos espaços do cemitério, atender solicitações de familiares e cumprir prazos legais para renovação ou liberação de sepulturas.</p>
        <table>
        <thead>
          <tr>
            <th>Nome</th><th>Data exumação</th><th>Quadra</th><th>Sepultura</th><th>Destinação</th>
          </tr>
        </thead>
        <tbody>
        ${filtered.map(e => `<tr>
            <td>${e.nome_sep || ""}</td>
            <td>${e.dh_exu || ""}</td>
            <td>${e.quadra_sep ?? ""}</td>
            <td>${e.num_sepultura_sep ?? ""}</td>
            <td>${e.destino || ""}</td>
            </tr>`).join("")}
        </tbody>
        </table>
        </body><html>
    `;
        newWin.document.write(html);
        newWin.document.close();
        newWin.focus();
        setTimeout(() => newWin.print(), 500);

    }


    return (
        <div>
            <MainLayout>

                <SmallSelect value={tipoLista} onChange={(e) => { setTipoLista(e.target.value); setPage(1) }} style={{ position: "relative", left: 940, borderRadius: 8 }}>
                    <option value="sepultamentos">LISTA DE SEPULTAMENTOS</option>
                    <option value="exumacoes">LISTA DE EXUMAÇÕES </option>
                </SmallSelect>

                <Container>

                    <FormStyled>
                        <Title>BUSCAR RELATÓRIOS</Title>

                        <SearchBar>
                            <SearchWrapper>
                                <TextField
                                    fullWidth
                                    size="small"
                                    label="Pesquisar"
                                    placeholder="Pesquisar por nome do falecido..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            applyFilters();
                                        }
                                    }}
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '18px',
                                            paddingRight: '44px'
                                        },
                                        '& .MuiOutlinedInput-input': {
                                            fontSize: '14px'
                                        }
                                    }}
                                />
                                <SearchIcon>
                                    <FaSearch />
                                </SearchIcon>
                            </SearchWrapper>
                        </SearchBar>

                        <TwoCols style={{ marginTop: 12 }}>
                            <ColumnLeft style={{ flex: 1 }}>
                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{
                                        marginRight: '10px',
                                        marginBottom: '10px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '18px'
                                        }
                                    }}
                                >
                                    <InputLabel sx={{ fontSize: '14px' }}>Selecione a quadra</InputLabel>
                                    <Select
                                        value={filters.quadra}
                                        onChange={(e) => setFilters(prev => ({ ...prev, quadra: e.target.value, sepultura: "" }))}
                                        label="Selecione a quadra"
                                        sx={{ fontSize: '14px' }}
                                    >
                                        <MenuItem value="">Selecione a quadra</MenuItem>
                                        {quadras.map(q => (
                                            <MenuItem key={String(q.id)} value={String(q.id)}>
                                                {q.num_quadra ? `Quadra ${q.num_quadra}` : q.nome || `Quadra ${q.id}`}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <FormControl
                                    fullWidth
                                    size="small"
                                    sx={{
                                        marginRight: '10px',
                                        marginBottom: '10px',
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: '18px'
                                        }
                                    }}
                                >
                                    <InputLabel sx={{ fontSize: '14px' }}>Selecione o tipo de sepultura</InputLabel>
                                    <Select
                                        value={filters.tipo_sep}
                                        onChange={(e) => setFilters(prev => ({ ...prev, tipo_sep: e.target.value }))}
                                        label="Selecione o tipo de sepultura"
                                        sx={{ fontSize: '14px' }}
                                    >
                                        <MenuItem value="">Selecione o tipo de sepultura</MenuItem>
                                        <MenuItem value="cova">Cova</MenuItem>
                                        <MenuItem value="gaveta">Gaveta</MenuItem>
                                        <MenuItem value="nicho">Nicho</MenuItem>
                                    </Select>
                                </FormControl>

                                <Field style={{ display: "flex", gap: 8 }}>
                                    <TextField
                                        type="date"
                                        size="small"
                                        value={filters.data_inicio}
                                        onChange={(e) => setFilters(prev => ({ ...prev, data_inicio: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            width: 110,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '18px'
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                fontSize: '14px'
                                            }
                                        }}
                                    />
                                    <TextField
                                        type="date"
                                        size="small"
                                        value={filters.data_fim}
                                        onChange={(e) => setFilters(prev => ({ ...prev, data_fim: e.target.value }))}
                                        InputLabelProps={{ shrink: true }}
                                        sx={{
                                            width: 110,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '18px'
                                            },
                                            '& .MuiOutlinedInput-input': {
                                                fontSize: '14px'
                                            }
                                        }}
                                    />
                                    <FormControl
                                        size="small"
                                        sx={{
                                            width: 93,
                                            '& .MuiOutlinedInput-root': {
                                                borderRadius: '18px'
                                            }
                                        }}
                                    >
                                        <InputLabel sx={{ fontSize: '14px' }}>Taxa</InputLabel>
                                        <Select
                                            value={filters.status_taxa}
                                            onChange={(e) => setFilters(prev => ({ ...prev, status_taxa: e.target.value }))}
                                            label="Taxa"
                                            sx={{ fontSize: '14px' }}
                                        >
                                            <MenuItem value="">Selecione a taxa</MenuItem>
                                            <MenuItem value="pago">Pago</MenuItem>
                                            <MenuItem value="gratuito">Gratuito</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Field>
                            </ColumnLeft>

                            <ColumnRight style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
                                <div style={{ background: "#fafafa", border: "1px solid #e6e6e6", padding: 12, borderRadius: 8, minWidth: 380, textAlign: "left" }}>
                                    <div style={{ fontSize: 14, color: "#666" }}>Valor total das taxas</div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6 }}>
                                        <div style={{ fontSize: 25, fontWeight: 600, marginTop: 6, color: "#191970" }}>
                                            {formatCurrency((filters.data_inicio || filters.data_fim) ? taxaSomaPeriodo : taxaSomaTotal)}
                                        </div>
                                        <div style={{ fontSize: 25, fontWeight: 600, color: "#191970", marginTop: 6 }}>
                                            <div style={{ fontSize: 14, color: "#666", fontWeight: 400 }}>Número de sepultado(s)</div>
                                            {((filters.data_inicio || filters.data_fim) ? sepCountPeriodo : sepCountTotal)} sepultados
                                        </div>
                                    </div>

                                    <div style={{ fontSize: 16, color: "#666" }}>
                                        {filters.data_inicio || filters.data_fim ? `Período: ${filters.data_inicio || "..."}<->${filters.data_fim || "..."}` : "Período: Total"}

                                    </div>
                                </div>
                            </ColumnRight>
                        </TwoCols>


                        <TableWrapper>
                            <Table>
                                <THead>
                                    {tipoLista === "exumacoes" ? (
                                        <>
                                            <Th>Falecido</Th>
                                            <Th>Data da exumação</Th>
                                            <Th>Quadra - Sepultura</Th>
                                            <Th>Destinação</Th>
                                            <Th>Responsável</Th>
                                            <Th>Ações</Th>
                                        </>
                                    ) : (
                                        <>
                                            <Th>Falecido</Th>
                                            <Th>Data do Sepultamento</Th>
                                            <Th>Taxa</Th>
                                            <Th>Ações</Th>
                                        </>
                                    )}
                                </THead>
                                <TBody>
                                    {paginated.length === 0 ? (

                                        <Tr>
                                            <Td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#666" }}>
                                                {isLoading ? "Carregando..." : (tipoLista === "exumacoes" ? "Nenhuma exumação encontrada." : "Nenhum sepultamento encontrado.")}
                                            </Td>
                                        </Tr>
                                    ) : (
                                        paginated.map((e, i) => (
                                            tipoLista === "exumacoes" ? (
                                                <Tr key={e.id ?? `exu-${i}`} index={i}>
                                                    <Td>{e.nome_sep || "-"}</Td>
                                                    <Td style={{ padding: "12px 16px" }}>{e.dh_exu ? new Date(e.dh_exu).toLocaleDateString() : "-"}</Td>
                                                    <Td style={{ padding: "12px 16px" }}>{`${e.quadra_sep ?? e.num_quadra ?? "-"} - ${e.num_sepultura_sep ?? ""}`}</Td>
                                                    <Td style={{ padding: "12px 16px" }}>{e.destino || "-"}</Td>
                                                    <Td style={{ padding: "12px 16px" }}>{e.coveiro || "-"}</Td>
                                                    <Td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                        <IconBtn type="button" onClick={() => handleView(e)}>
                                                            <FaEye />
                                                        </IconBtn>
                                                    </Td>
                                                </Tr>

                                            ) : (
                                                <Tr key={e.id ?? `sep-${i}`} index={i}>
                                                    <Td style={{ padding: "12px 16px" }}>{e.nome_sep || "-"}</Td>
                                                    <Td style={{ padding: "12px 16px" }}>{e.dh_sep ? new Date(e.dh_sep).toLocaleDateString() : "-"}</Td>
                                                    <Td style={{ padding: "12px 16px" }}>{e.taxa_label ?? "-"}</Td>
                                                    <Td style={{ padding: "12px 16px", textAlign: "center" }}>
                                                        <IconBtn type="button" onClick={() => handleView(e)}>
                                                            <FaEye />
                                                        </IconBtn>
                                                    </Td>
                                                </Tr>
                                            ))
                                        )
                                    )}</TBody>
                            </Table>
                        </TableWrapper>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
                            <div style={{ display: "flex", gap: 12 }}>
                                <button title="Exportar como PDF" aria-label="Exportar como PDF" onClick={exportPDF} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#b80000", color: "#fff", border: "none", cursor: "pointer" }}>
                                    <FaFilePdf />
                                </button>
                                <button title="Exportar como Excel" aria-label="Exportar como Excel" type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#1D6f42", color: "#fff", border: "none", cursor: "pointer" }}>
                                    <FaFileExcel />
                                </button>
                                <button title="Exportar como CSV" aria-label="Exportar como CSV" onClick={exportCSV} type="button" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#0b72d2ff", color: "#fff", border: "none", cursor: "pointer" }}>
                                    <FaFileCsv />
                                </button>
                            </div>


                        </div>

                    </FormStyled>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", justifyContent: "center", marginTop: 16 }}>
                        <button type="button" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "pointer" : "not-allowed" }} onClick={() => setPage(1)} disabled={currentPage === 1}>«</button>
                        <button type="button" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "pointer" : "not-allowed" }} onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>‹</button>
                        {(() => {
                            const out = [];
                            const maxButtons = 7;
                            let start = Math.max(1, page - 3);
                            let end = Math.min(totalPages, start + maxButtons - 1);
                            if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

                            for (let p = start; p <= end; p++) {
                                out.push(
                                    <button
                                        key={p}
                                        onClick={() => setPage(p)}
                                        aria-current={p === currentPage ? "page" : undefined}
                                        style={{
                                            padding: "8px 10px",
                                            borderRadius: 8,
                                            border: p === currentPage ? "2px solid #1b1464" : "1px solid #ddd",
                                            background: p === currentPage ? "#1b1464" : "#fff",
                                            color: p === currentPage ? "#fff" : "#222",
                                            cursor: "pointer"
                                        }}
                                    >
                                        {p}
                                    </button>
                                );
                            }
                            return out;
                        })()}
                        <button type="button" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }} onClick={() => setPage(Math.max(1, currentPage + 1))} disabled={currentPage === totalPages}>›</button>
                        <button type="button" style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }} onClick={() => setPage(totalPages)} disabled={currentPage === totalPages}>»</button>
                    </div>
                </Container>

                {modalOpen && modalForm && (
                    <ModalOverlay>
                        <ModalContent>
                            <Title>
                                DETALHES DA EXUMAÇÃO
                            </Title>
                            <ModalGrid>
                                <Label>Nome: <div>{modalForm.nome_sep || "-"}</div></Label>
                                <Label>Data e hora: <div>{modalForm.dh_exu ? new Date(modalForm.dh_exu).toLocaleString() : "-"}</div></Label>
                                <Label>Quadra: <div>{modalForm.quadra_sep ?? "-"}</div></Label>
                                <Label>Sepultura: <div>{modalForm.num_sepultura_sep || "-"}</div></Label>
                                <Label>Destinação: <div>{modalForm.destino || "-"}</div></Label>
                                <Label>Responsável: <div>{modalForm.coveiro || "-"}</div></Label>
                                <Label>Observações: <div>{modalForm.obs_exu || "-"}</div></Label>
                            </ModalGrid>

                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                                <BtnPrimaryClose type="button" onClick={closeModal}>Fechar</BtnPrimaryClose>
                            </div>
                        </ModalContent>
                    </ModalOverlay>
                )}
            </MainLayout >
            <Footer />
        </div >
    )
}