import React, { useState, useEffect } from "react";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import { FaSearch, FaEye, FaPen, FaTrash } from "react-icons/fa";
import {
  Card, TableWrapper, Table, THead, Th, TBody, Tr, Td, Actions, IconBtn, TableScroller, FormStyled, Container, Title, SearchBar, SearchInput, SmallSelect,
  BtnPrimary, Input, BtnPrimarySave, SmallInput, TwoCols, Field, SearchWrapper, SearchIcon, Label, ModalContent, ModalGrid, ModalOverlay, BtnPrimaryClose
} from "./styles";
import api from "../../services/api";
import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";


export default function RegistrosComponent() {
  const [modalOpen, setModalOpen] = useState(false);
  const [registroSelecionado, setRegistroSelecionado] = useState(null);
  const [modalForm, setModalForm] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [falecidos, setFalecidos] = useState([]);
  const [exumacoes, setExumacoes] = useState([]);
  const [quadras, setQuadras] = useState([]);
  const [registros, setRegistros] = useState([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    tipo: "",
    status: "",
    quadra: "",
    sepultura: ""
  });
  const [pendingFilters, setPendingFilters] = useState(() => ({ ...filters }));

  const loadAll = async () => {
    try {
      const [resFalecidos, resExumacoes, resSepultamentos, resQuadras] = await Promise.all([
        api.get("/falecidos"),
        api.get("/exumacoes"),
        api.get("/sepultamentos"),
        api.get("/quadras"),
      ]);

      const falecidosData = resFalecidos.data || [];
      const exumacoesData = resExumacoes.data || [];
      const sepultamentosData = resSepultamentos.data || [];
      const quadrasData = resQuadras.data || [];

      setQuadras(quadrasData);

      const findFalecidoForSep = (sep) => {
        const fk = sep.falecidoId ?? sep.falecido_id ?? sep.falecido;
        if (fk !== undefined && fk != null) {
          const s = String(fk);
          return falecidosData.find(f => String(f.id) === s)
        }
        return null;
      };

      const findExuForSep = (sep) => {
        const sepId = String(sep.id);
        return exumacoesData.find(e => String(e.sepultamentoId ?? e.sepultamento_id ?? e.sepultamento) === sepId) || null;
      };

      const enriched = sepultamentosData.map(sep => {
        const fal = findFalecidoForSep(sep) || {};
        const exu = findExuForSep(sep) || {};
        const quadraObj = quadrasData.find(q => String(q.id) === String(sep.quadra_sep) || String(q.id) === String(sep.quadra)) || null;
        const quadra_num = quadraObj?.num_quadra ?? sep.quadra_sep ?? sep.quadra ?? "";

        return {
          ...sep,
          falecido: fal || null,
          quadra_obj: quadraObj,
          quadra_num,
          nome_fal: sep.nome_sep || fal.nome_fal || fal.nome || "",
          idade: fal.idade || "",
          cpf: fal.cpf || "",
          rg: fal.rg || "",
          data_nasc: fal.data_nasc || "",
          dh_falec: fal.dh_falec || "",
          filiacao_pai: fal.filiacao_pai || "",
          filiacao_mae: fal.filiacao_mae || "",
          sexo: fal.sexo || "",
          profissao: fal.profissao || "",
          estado_civil: fal.estado_civil || "",
          nacionalidade: fal.nacionalidade || "",
          causa_mortis: fal.causa_mortis || "",
          nome_doutor: fal.nome_doutor || "",
          certidao_obito: fal.certidao_obito || "",
          residenciaPreview: fal.residenciaPreview || fal.residencia_preview || "",
          nome_resp: fal.nome_resp || "",
          tel_resp: fal.tel_resp || "",
          endereco_resp: fal.endereco_resp || "",
          doc_resp: fal.doc_resp || "",
          cor: fal.cor || "",
          exumacao: exu || null,
          dh_exu: exu.dh_exu || "",
          motivo_exu: exu.motivo_exu || "",

        };
      });

      setFalecidos(falecidosData);
      setExumacoes(exumacoesData);
      setRegistros(enriched);

      return enriched;

    } catch (error) {
      console.error("Erro ao carregar registros", error);
      return [];
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const filteredRegistros = registros.filter((item) => {
    const searchNormalized = String(search || "").trim().toLowerCase();
    const nomeField = String(item?.nome_fal || item?.nome_sep || "");
    const searchMatch = !searchNormalized || nomeField.toLowerCase().includes(searchNormalized);

    const itemTipo = String(item?.tipo_cova || item?.tipo || item?.tipo_sep || item?.tipo_sepultura || "").toLowerCase();
    const tipoFilter = String(filters.tipo_cova || "").trim().toLowerCase();
    const tipoMatch = tipoFilter ? itemTipo.includes(tipoFilter) : true;

    const itemQuadra = String(item?.quadra_num ?? item?.quadra_sep ?? item?.quadra ?? "").trim();
    const quadraFilter = String(filters.quadra ?? "").trim();
    const quadraMatch = quadraFilter ? itemQuadra === quadraFilter : true;

    const itemSepultura = String(item?.num_sepultura_sep ?? item?.num_sepultura ?? item?.sepultura ?? "").trim();
    const sepulturaMatch = filters.sepultura ? itemSepultura === String(filters.sepultura).trim() : true;

    return searchMatch && tipoMatch && quadraMatch && sepulturaMatch;
  });

  const handleVisualizar = (registro) => {

    const merged = {
      ...registro,
      falecido: registro.falecido || null,
    };

    setRegistroSelecionado(registro)
    setModalForm(merged);
    setIsEditing(false);
    setModalOpen(true);

  };

  const handleChangeModal = (key, value) => {
    setModalForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!modalForm) return;
    try {
      const sepId = registroSelecionado?.id ?? modalForm.id;
      const falId = registroSelecionado?.falecido?.id ?? modalForm.falecidoId ?? modalForm.falecido_id ?? null;

      const sepPayload = {};
      if (modalForm.tipo_sep !== undefined) sepPayload.tipo_sep = modalForm.tipo_sep;
      if (modalForm.quadra_sep !== undefined) sepPayload.quadra_sep = modalForm.quadra_sep;
      if (modalForm.num_sepultura_sep !== undefined) sepPayload.num_sepultura_sep = modalForm.num_sepultura_sep;
      if (modalForm.dh_sep !== undefined) sepPayload.dh_sep = modalForm.dh_sep;
      if (modalForm.nome_fal !== undefined) sepPayload.nome_sep = modalForm.nome_fal;


      const falPayload = {};
      if (modalForm.nome_fal != undefined) {
        falPayload.nome_fal = modalForm.nome_fal;
      }

      if (modalForm.idade != undefined) falPayload.idade = modalForm.idade;
      if (modalForm.sexo != undefined) falPayload.sexo = modalForm.sexo;
      if (modalForm.cpf != undefined) falPayload.cpf = modalForm.cpf;
      if (modalForm.data_nasc != undefined) falPayload.data_nasc = modalForm.data_nasc;
      if (modalForm.profissao != undefined) falPayload.profissao = modalForm.profissao;
      if (modalForm.dh_falec != undefined) falPayload.dh_falec = modalForm.dh_falec;
      if (modalForm.filiacao_pai != undefined) falPayload.filiacao_pai = modalForm.filiacao_pai;
      if (modalForm.filiacao_mae != undefined) falPayload.filiacao_mae = modalForm.filiacao_mae;
      if (modalForm.cor != undefined) falPayload.cor = modalForm.cor;
      if (modalForm.rg != undefined) falPayload.rg = modalForm.rg;
      if (modalForm.estado_civil != undefined) falPayload.estado_civil = modalForm.estado_civil;
      if (modalForm.nacionalidade != undefined) falPayload.nacionalidade = modalForm.nacionalidade;
      if (modalForm.causa_mortis != undefined) falPayload.causa_mortis = modalForm.causa_mortis;
      if (modalForm.nome_doutor != undefined) falPayload.nome_doutor = modalForm.nome_doutor;
      if (modalForm.certidao_obito != undefined) falPayload.certidao_obito = modalForm.certidao_obito;
      if (modalForm.obs_fal != undefined) falPayload.obs_fal = modalForm.obs_fal;
      if (modalForm.residenciaPreview != undefined) falPayload.residenciaPreview = modalForm.residenciaPreview;
      if (modalForm.nome_resp != undefined) falPayload.nome_resp = modalForm.nome_resp;
      if (modalForm.doc_resp != undefined) falPayload.doc_resp = modalForm.doc_resp;
      if (modalForm.endereco_resp != undefined) falPayload.endereco_resp = modalForm.endereco_resp;


      if (sepId && Object.keys(sepPayload).length) {
        await api.patch(`/sepultamentos/${sepId}`, sepPayload);
      }
      if (falId && Object.keys(falPayload).length) {
        await api.patch(`/falecidos/${falId}`, falPayload);
      }

      const enriched = await loadAll();
      const updated = enriched.find(r => String(r.id) === String(sepId)) || registroSelecionado || {};
      setRegistroSelecionado(updated);
      setModalForm(updated);
      alert("Registro atualizado");
      setIsEditing(false);
    } catch (err) {
      console.error("erro ao salvar", err);
    }

  }

  const handleArquivar = async (id) => {
    try {
      await api.patch(`/sepultamentos/${id}`, { arquivado: true });
      loadAll();
    } catch (error) {
      console.error("Erro ao arquivar", error);
    }
  };

  const handleSearch = async () => {
    setSearch(query);
    await loadAll();
    setPage(1);
  };

  const formatarData = (data) => {
    if (!data) return "-";
    const normalizado = data.length === 16 ? data + ":00" : data;
    return new Date(normalizado).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  };

  const calcularVencimento = (dh_sep) => {
    if (!dh_sep) return "-";
    const data = new Date(dh_sep);
    data.setFullYear(data.getFullYear() + 3);
    return data.toLocaleDateString("pt-BR");
  };

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, filters]);

  const currentPage = Number(page) || 1;
  const totalPages = Math.max(1, Math.ceil(filteredRegistros.length / PAGE_SIZE));
  const paginatedRegistros = filteredRegistros.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);


  /* const goToPrev = () => setPage(prev => {
    const num = Number(prev) || 1;
    return Math.max(1, num - 1);
  });

  const goToNext = () => setPage(prev => {
    const num = Number(prev) || 1;
    return Math.min(totalPages, num + 1);
  }); */

  const goToPage = (n) => {
    const num = Number(n) || 1;
    setPage(Math.min(Math.max(1, num), totalPages));
  };

  return (
    <div>
        <Container>
          <FormStyled>
            <Title>BUSCAR REGISTROS</Title>
            <SearchBar>
              <SearchWrapper>
                <TextField
                  fullWidth
                  size="small"
                  label="Pesquisar"
                  placeholder="Pesquisar por nome do falecido..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
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
                <SearchIcon type="button" onClick={handleSearch}>
                  <FaSearch />
                </SearchIcon>
              </SearchWrapper>
            </SearchBar>

            <TwoCols>
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
                  name="tipo_sep"
                  value={pendingFilters.tipo}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, tipo: e.target.value }))}
                  label="Selecione o tipo de sepultura"
                  sx={{ fontSize: '14px' }}
                >
                  <MenuItem value="">Selecione o tipo de sepultura</MenuItem>
                  <MenuItem value="Cova">Cova</MenuItem>
                  <MenuItem value="Gaveta">Gaveta</MenuItem>
                  <MenuItem value="Nicho">Nicho</MenuItem>
                </Select>
              </FormControl>
            </TwoCols>

            <TwoCols>
              <Field>
                <TextField
                  size="small"
                  label="Nº da quadra"
                  value={pendingFilters.quadra}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, quadra: e.target.value }))}
                  sx={{
                    width: 225,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '18px'
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '14px'
                    }
                  }}
                />

                <TextField
                  size="small"
                  label="Nº da sepultura"
                  value={pendingFilters.sepultura}
                  onChange={(e) => setPendingFilters(prev => ({ ...prev, sepultura: e.target.value }))}
                  sx={{
                    width: 225,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '18px'
                    },
                    '& .MuiOutlinedInput-input': {
                      fontSize: '14px'
                    }
                  }}
                />
              </Field>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 15 }}>
                <BtnPrimary style={{ marginBottom: 10 }} type="button" onClick={() => {
                  setFilters(pendingFilters);
                  setPage(1);
                }}>Aplicar Filtros</BtnPrimary>
              </div>
            </TwoCols>

            <TableWrapper>
              <TableScroller>
                <Table>
                  <THead>
                    <>
                      <Th>Falecido</Th>
                      <Th>Data do sepultamento</Th>
                      <Th>Data de vencimento</Th>
                      <Th style={{ width: 160 }}>Ações</Th>
                    </>
                  </THead>
                  <TBody>
                    {paginatedRegistros.map((registro, index) => (

                      <Tr key={`${registro.id}-${(currentPage - 1) * PAGE_SIZE + index}`} index={index}>
                        <Td style={{ maxWidth: 320 }}>{registro.nome_sep || "-"}</Td>
                        <Td>{registro.dh_sep ? formatarData(registro.dh_sep) : "-"}</Td>
                        <Td>{registro.dh_sep ? calcularVencimento(registro.dh_sep) : "-"}</Td>
                        <Td>
                          <Actions>
                            <IconBtn type="button" onClick={() => handleVisualizar(registro)}>
                              <FaEye />
                            </IconBtn>
                            <IconBtn type="button" onClick={() => handleArquivar(registro.id)}>
                              <FaTrash />
                            </IconBtn>
                          </Actions>
                        </Td>
                      </Tr>
                    ))}
                  </TBody>
                </Table>
              </TableScroller>
            </TableWrapper>

          </FormStyled>

          <div style={{ display: "flex", justifyContent: "center", marginTop: 16, gap: 8, flexWrap: "wrap" }}>
            <button
              onClick={() => goToPage(1)}
              disabled={currentPage === 1}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              aria-label="Primeira página"
            >
              «
            </button>

            <button
              onClick={() => goToPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
              aria-label="Página anterior"
            >
              ‹
            </button>

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
                    onClick={() => goToPage(p)}
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

            <button
              onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
              aria-label="Próxima página"
            >
              ›
            </button>

            <button
              onClick={() => goToPage(totalPages)}
              disabled={currentPage === totalPages}
              style={{ padding: "8px 10px", borderRadius: 8, border: "1px solid #ddd", background: "#fff", cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
              aria-label="Última página"
            >
              »
            </button>

          </div>

          {modalOpen && modalForm && (
            <ModalOverlay>
              <ModalContent>
                <Title>INFORMAÇÕES DO FALECIDO</Title>
                <ModalGrid>
                  <Label>Nome: <Input value={modalForm.nome_fal || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("nome_fal", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Idade: <Input value={modalForm.idade || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("idade", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Sexo: <Input value={modalForm.sexo || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("sexo", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Cor: <Input value={modalForm.cor || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("cor", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Data de nascimento: <Input type="date" value={modalForm.data_nasc || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("data_nasc", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Filiação pai: <Input value={modalForm.filiacao_pai || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("filiacao_pai", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Filiação mãe: <Input value={modalForm.filiacao_mae || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("filiacao_mae", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>CPF: <Input value={modalForm.cpf || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("cpf", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Profissão: <Input value={modalForm.profissao || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("profissao", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Estado civil: <Input value={modalForm.estado_civil || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("estado_civil", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Nacionalidade: <Input value={modalForm.nacionalidade || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("nacionalidade", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Causa mortis: <Input value={modalForm.causa_mortis || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("causa_mortis", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Nome do doutor: <Input value={modalForm.nome_doutor || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("nome_doutor", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Certidão de óbito: <Input value={modalForm.certidao_obito || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("certidao_obito", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Comprovante de residência: <Input value={modalForm.residenciaPreview || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("residenciaPreview", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Responsável: <Input value={modalForm.nome_resp || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("nome_resp", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Contato do responsável: <Input value={modalForm.tel_resp || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("tel_resp", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Endereço do responsável: <Input value={modalForm.endereco_resp || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("endereco_resp", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>CPF do responsável: <Input value={modalForm.doc_resp || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("doc_resp", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Quadra: <Input value={modalForm.quadra_num ?? modalForm.quadra_sep ?? ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("quadra_sep", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Nº da sepultura: <Input value={modalForm.num_sepultura_sep || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("num_sepultura_sep", e.target.value)} style={{ width: "100%" }} /></Label>
                  <Label>Tipo de sepultura: <Input value={modalForm.tipo_sep || ""} readOnly={!isEditing} onChange={(e) => handleChangeModal("tipo_sep", e.target.value)} style={{ width: "100%" }} /></Label>
                </ModalGrid>
                <BtnPrimary type="button" onClick={() => setIsEditing(true)}>Editar</BtnPrimary>
                <BtnPrimarySave type="button" onClick={handleSave} disabled={!isEditing}>Salvar</BtnPrimarySave>
                <BtnPrimaryClose type="button" onClick={() => { setModalOpen(false); setIsEditing(false); }}>Fechar</BtnPrimaryClose>
              </ModalContent>
            </ModalOverlay>
          )}
        </Container>
    </div>

  );
}
