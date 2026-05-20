import { IconBtn, StatusBadge, Actions, BtnPrimaryClose, BtnPrimarySave, Container, FormStyled, SearchBar, SearchIcon, SearchWrapper, TableWrapper, Title, Card, TableScroller, TBody, THead, Table, Td, TdStatus, Th, Tr, ModalOverlay, ModalContent, ModalGrid, Input, TdNumContrato } from "./styles.js";
import TextField from "@mui/material/TextField";
import { FaSearch } from "react-icons/fa";
import { FaRegEdit } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import React, { useEffect, useMemo, useState } from "react";
import { formatDateDMY } from "../../utils/date";
import api from "../../services/index.js";

const STATUS_OPTIONS = [
    { value: "ativo", label: "Ativo" },
    { value: "inativo", label: "Inativo" },
];

const INITIAL_FORM = {
    name: "",
    foundation: "",
    active: true,
};

function formatDateBR(value) {
    return formatDateDMY(value, value || "-");
}

function statusLabel(active) {
    return active === false ? "Inativo" : "Ativo";
}

export default function CemiteriosComponent() {
    const [query, setQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [cemiterios, setCemiterios] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const filteredItems = useMemo(() => {
        const q = String(query || "").trim().toLowerCase();
        if (!q) return cemiterios;

        return cemiterios.filter((item) => {
            return String(item.name || "").toLowerCase().includes(q)
                || String(item.foundation || "").toLowerCase().includes(q);
        });
    }, [query, cemiterios]);

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const loadItems = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get("/cemeteries");
            setCemiterios(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar cemitérios", error);
            setCemiterios([]);
            alert("Erro ao carregar cemitérios");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadItems();
    }, []);

    const openModal = () => {
        setEditingId(null);
        setForm(INITIAL_FORM);
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setForm(INITIAL_FORM);
        setErrors({});
    };

    const validateForm = () => {
        const nextErrors = {};
        if (!form.name.trim()) nextErrors.name = "Informe o nome do cemitério";
        if (!form.foundation.trim()) nextErrors.foundation = "Informe a data de fundação";

        if (form.foundation) {
            const date = new Date(`${form.foundation}`);
            if (Number.isNaN(date.getTime())) {
                nextErrors.foundation = "Data de fundação em formato inválido";
            }
        }

        const normalizedName = form.name.trim().toLowerCase();
        const isDuplicated = cemiterios.some(
            (item) => item.id !== editingId && String(item.name || "").trim().toLowerCase() === normalizedName
        );
        if (isDuplicated) {
            nextErrors.name = "Já existe um cemitério com esse nome";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const errorStyle = { margin: "6px 0 0", color: "#b42318", fontSize: 12 };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = {
                name: form.name.trim(),
                foundation: form.foundation,
                active: Boolean(form.active),
            };

            if (editingId) {
                await api.put(`/cemeteries/${editingId}`, {
                    ...payload,
                    id: editingId,
                });
            } else {
                await api.post("/cemeteries", payload);
                alert("Cemitério cadastrado com sucesso.");
            }

            await loadItems();
            closeModal();
            setEditingId(null);
        } catch (error) {
            console.error("Erro ao salvar cemitério", error);
            alert("Não foi possível salvar o cemitério");
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

    const handleDelete = async (id) => {
        const ok = window.confirm("Deseja realmente excluir este cemitério?");
        if (!ok) return;

        setIsSubmitting(true);
        try {
            await api.delete(`/cemeteries/${id}`);
            alert("Cemitério excluído com sucesso");
            await loadItems();
        } catch (error) {
            console.error("Erro ao excluir cemitério", error);
            alert("Não foi possível excluir o cemitério");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Container>
                <FormStyled>
                    <Title>CEMITÉRIOS</Title>
                    <SearchWrapper>
                        <TextField
                            fullWidth
                            size="small"
                            label="Pesquisar"
                            placeholder="Pesquisar por nome ou fundação..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
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
                </FormStyled>

                <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
                    <BtnPrimarySave type="button" onClick={openModal}>
                        <FaRegEdit />Adicionar cemitério
                    </BtnPrimarySave>
                </div>

                <Card>
                    <h3 style={{ marginTop: 0, color: "#191970" }}>Cemitérios cadastrados</h3>
                    {isLoading ? (
                        <p style={{ textAlign: "center", color: "#666" }}>Carregando...</p>
                    ) : (
                        <TableWrapper>
                            <TableScroller>
                                <Table>
                                    <THead>
                                        <tr>
                                            <Th>Nome</Th>
                                            <Th>Fundação</Th>
                                            <Th>Status</Th>
                                            <Th>Ações</Th>
                                        </tr>
                                    </THead>
                                    <TBody>
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item, index) => (
                                                <Tr key={item.id} index={index}>
                                                    <Td>{item.name}</Td>
                                                    <Td>{formatDateBR(item.foundation)}</Td>
                                                    <TdStatus><StatusBadge $status={item.active !== false ? "ativo" : "inativo"}>{statusLabel(item.active)}</StatusBadge></TdStatus>
                                                    <Td>
                                                        <Actions>
                                                            <IconBtn type="button" onClick={() => handleEdit(item)}><FaRegEdit /></IconBtn>
                                                            <IconBtn type="button" onClick={() => handleDelete(item.id)}><FaTrash /></IconBtn>
                                                        </Actions>
                                                    </Td>
                                                </Tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <Td colSpan={4}>Nenhum cemitério encontrado.</Td>
                                            </tr>
                                        )}
                                    </TBody>
                                </Table>
                            </TableScroller>
                        </TableWrapper>
                    )}
                </Card>
            </Container>

            {modalOpen && (
                <ModalOverlay>
                    <ModalContent>
                        <h3 style={{ marginTop: 0, marginBottom: 16, color: "#191970" }}>
                            {editingId ? "Editar cemitério" : "Novo cemitério"}
                        </h3>

                        <form onSubmit={handleSave}>
                            <ModalGrid>
                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label>Nome</label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => updateField("name", e.target.value)}
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
                                        onChange={(e) => updateField("foundation", e.target.value)}
                                        disabled={isSubmitting}
                                    />
                                    {errors.foundation ? <p style={errorStyle}>{errors.foundation}</p> : null}
                                </div>

                                <div>
                                    <label>Status</label>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={form.active ? "ativo" : "inativo"}
                                        onChange={(e) => updateField("active", e.target.value === "ativo")}
                                        disabled={isSubmitting}
                                        sx={{
                                            "& .MuiOutlinedInput-root": {
                                                borderRadius: "18px",
                                            },
                                            "& .MuiOutlinedInput-input": {
                                                fontSize: "14px",
                                            },
                                        }}
                                    >
                                        {STATUS_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </div>
                            </ModalGrid>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                                <BtnPrimaryClose type="button" onClick={closeModal}>
                                    Cancelar
                                </BtnPrimaryClose>
                                <BtnPrimarySave type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</BtnPrimarySave>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
}
