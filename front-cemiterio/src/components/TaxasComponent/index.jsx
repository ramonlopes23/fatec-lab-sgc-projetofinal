import React, { useEffect, useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { FaPowerOff, FaRegEdit, FaSearch } from "react-icons/fa";
import {
    Actions,
    BtnPrimaryClose,
    BtnPrimarySave,
    Card,
    Container,
    FormStyled,
    IconBtn,
    Input,
    ModalContent,
    ModalGrid,
    ModalOverlay,
    SearchIcon,
    SearchWrapper,
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
} from "./styles";
import useTaxas from "../../hooks/Taxas/useTaxas";
import { createTaxa, patchTaxaStatus, updateTaxa } from "../../services/taxaService";
import { formatCurrencyBRL, formatTaxaLabel, normalizeTaxa } from "../../utils/taxas";

const INITIAL_FORM = {
    codigo: "",
    descricao: "",
    valor: "0",
    tipo: "sepultamento",
    active: true,
    isencao: false,
    vigencia_inicio: "",
    vigencia_fim: "",
};

const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

const normalizeCode = (value) => String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

function TaxasComponent() {
    const { taxas, loading, error, loadTaxas, setTaxas } = useTaxas({ autoLoad: false, onlyActive: false });
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadTaxas();
    }, [loadTaxas]);

    const filteredTaxas = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return taxas;

        return taxas.filter((taxa) => {
            const haystack = `${taxa.codigo} ${taxa.descricao} ${formatTaxaLabel(taxa)}`.toLowerCase();
            return haystack.includes(term);
        });
    }, [taxas, search]);

    const updateField = (key, value) => {
        setForm((prev) => {
            const next = { ...prev, [key]: value };
            if (key === "descricao" && !editingId) {
                next.codigo = normalizeCode(value);
            }
            if (key === "isencao" && value) {
                next.valor = "0";
            }
            return next;
        });
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
        const codigo = normalizeCode(form.codigo);
        const descricao = form.descricao.trim();
        const valor = Number(form.valor);

        if (!codigo) nextErrors.codigo = "Informe o codigo da taxa";
        if (!descricao) nextErrors.descricao = "Informe a descricao da taxa";
        if (!Number.isFinite(valor) || valor < 0) nextErrors.valor = "Informe um valor valido";
        if (form.vigencia_inicio && form.vigencia_fim && new Date(form.vigencia_fim) < new Date(form.vigencia_inicio)) {
            nextErrors.vigencia_fim = "Vigencia final deve ser posterior ao inicio";
        }

        const duplicated = taxas.some((taxa) => taxa.id !== editingId && normalizeCode(taxa.codigo) === codigo);
        if (duplicated) nextErrors.codigo = "Ja existe uma taxa com esse codigo";

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSave = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const now = new Date().toISOString();
            const payload = {
                codigo: normalizeCode(form.codigo),
                descricao: form.descricao.trim().toUpperCase(),
                valor: form.isencao ? 0 : Number(form.valor),
                tipo: form.tipo || "sepultamento",
                active: Boolean(form.active),
                isencao: Boolean(form.isencao),
                vigencia_inicio: form.vigencia_inicio,
                vigencia_fim: form.vigencia_fim,
                updated_at: now,
            };
            payload.label = formatTaxaLabel(payload);

            if (editingId) {
                await updateTaxa(editingId, { ...payload, id: editingId });
                alert("Taxa atualizada com sucesso.");
            } else {
                await createTaxa({ ...payload, created_at: now });
                alert("Taxa cadastrada com sucesso.");
            }

            await loadTaxas();
            closeModal();
        } catch (err) {
            console.error("Erro ao salvar taxa", err);
            alert(err?.response?.data?.message || err?.message || "Erro ao salvar taxa.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (taxa) => {
        const normalized = normalizeTaxa(taxa);
        setEditingId(normalized.id);
        setForm({
            codigo: normalized.codigo,
            descricao: normalized.descricao,
            valor: String(normalized.valor ?? 0),
            tipo: normalized.tipo || "sepultamento",
            active: normalized.active,
            isencao: normalized.isencao,
            vigencia_inicio: normalized.vigencia_inicio || "",
            vigencia_fim: normalized.vigencia_fim || "",
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleToggleStatus = async (taxa) => {
        const normalized = normalizeTaxa(taxa);
        const nextActive = !normalized.active;
        const ok = window.confirm(`${nextActive ? "Ativar" : "Inativar"} a taxa ${normalized.descricao}?`);
        if (!ok) return;

        setIsSubmitting(true);
        try {
            await patchTaxaStatus(normalized.id, nextActive);
            setTaxas((prev) => prev.map((item) => (
                String(item.id) === String(normalized.id)
                    ? { ...item, active: nextActive, status: nextActive ? "active" : "inactive" }
                    : item
            )));
            await loadTaxas();
        } catch (err) {
            console.error("Erro ao alterar status da taxa", err);
            alert(err?.response?.data?.message || err?.message || "Erro ao alterar status da taxa.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Container>
            <FormStyled as="section">
                <Title>CONTROLE DE TAXAS</Title>
                <SearchWrapper>
                    <TextField
                        fullWidth
                        size="small"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Pesquisar por codigo ou descricao..."
                    />
                    <SearchIcon><FaSearch /></SearchIcon>
                </SearchWrapper>
                {error ? <p style={{ ...errorStyle, color: "#8a5a00" }}>{error}</p> : null}
            </FormStyled>

            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                <BtnPrimarySave type="button" onClick={openModal}>
                    Nova taxa
                </BtnPrimarySave>
            </div>

            <Card>
                <TableWrapper>
                    <TableScroller>
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>Codigo</Th>
                                    <Th>Descricao</Th>
                                    <Th>Valor</Th>
                                    <Th>Tipo</Th>
                                    <Th>Status</Th>
                                    <Th>Acoes</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {loading ? (
                                    <Tr><Td colSpan={6}>Carregando taxas...</Td></Tr>
                                ) : filteredTaxas.length === 0 ? (
                                    <Tr><Td colSpan={6}>Nenhuma taxa encontrada.</Td></Tr>
                                ) : filteredTaxas.map((taxa, index) => {
                                    const normalized = normalizeTaxa(taxa);
                                    return (
                                        <Tr key={String(normalized.id || normalized.codigo)} index={index}>
                                            <Td>{normalized.codigo}</Td>
                                            <Td>{normalized.descricao}</Td>
                                            <Td>{formatCurrencyBRL(normalized.valor)}</Td>
                                            <Td>{normalized.tipo}</Td>
                                            <TdStatus>
                                                <StatusBadge $status={normalized.active ? "ativo" : "inativo"}>
                                                    {normalized.active ? "Ativa" : "Inativa"}
                                                </StatusBadge>
                                            </TdStatus>
                                            <Td>
                                                <Actions>
                                                    <IconBtn type="button" onClick={() => handleEdit(normalized)} disabled={isSubmitting}>
                                                        <FaRegEdit />
                                                    </IconBtn>
                                                    <IconBtn type="button" onClick={() => handleToggleStatus(normalized)} disabled={isSubmitting} data-danger={normalized.active ? "true" : undefined}>
                                                        <FaPowerOff />
                                                    </IconBtn>
                                                </Actions>
                                            </Td>
                                        </Tr>
                                    );
                                })}
                            </TBody>
                        </Table>
                    </TableScroller>
                </TableWrapper>
            </Card>

            {modalOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <Title>{editingId ? "EDITAR TAXA" : "NOVA TAXA"}</Title>
                        <form onSubmit={handleSave}>
                            <ModalGrid>
                                <div>
                                    <label>Descricao</label>
                                    <Input
                                        value={form.descricao}
                                        onChange={(event) => updateField("descricao", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.descricao ? <p style={errorStyle}>{errors.descricao}</p> : null}
                                </div>

                                <div>
                                    <label>Codigo</label>
                                    <Input
                                        value={form.codigo}
                                        onChange={(event) => updateField("codigo", normalizeCode(event.target.value))}
                                        disabled={isSubmitting || !!editingId}
                                    />
                                    {errors.codigo ? <p style={errorStyle}>{errors.codigo}</p> : null}
                                </div>

                                <div>
                                    <label>Valor</label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={form.valor}
                                        onChange={(event) => updateField("valor", event.target.value)}
                                        disabled={isSubmitting || form.isencao}
                                    />
                                    {errors.valor ? <p style={errorStyle}>{errors.valor}</p> : null}
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
                                    >
                                        <MenuItem value="sepultamento">Sepultamento</MenuItem>
                                    </TextField>
                                </div>

                                <div>
                                    <label>Vigencia inicio</label>
                                    <Input
                                        type="date"
                                        value={form.vigencia_inicio}
                                        onChange={(event) => updateField("vigencia_inicio", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                </div>

                                <div>
                                    <label>Vigencia fim</label>
                                    <Input
                                        type="date"
                                        value={form.vigencia_fim}
                                        onChange={(event) => updateField("vigencia_fim", event.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.vigencia_fim ? <p style={errorStyle}>{errors.vigencia_fim}</p> : null}
                                </div>

                                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={form.isencao}
                                        onChange={(event) => updateField("isencao", event.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                    Isencao
                                </label>

                                <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        type="checkbox"
                                        checked={form.active}
                                        onChange={(event) => updateField("active", event.target.checked)}
                                        disabled={isSubmitting}
                                    />
                                    Ativa
                                </label>
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
    );
}

export default TaxasComponent;
