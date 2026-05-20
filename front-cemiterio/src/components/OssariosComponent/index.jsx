import { useEffect, useMemo, useState } from "react";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { FaSearch, FaRegEdit, FaTrash } from "react-icons/fa";
import api from "../../services/index.js";
import { IconBtn, StatusBadge, Actions, BtnPrimaryClose, BtnPrimarySave, Container, FormStyled, SearchBar, SearchIcon, SearchWrapper, TableWrapper, Title, Card, TableScroller, TBody, THead, Table, Td, TdStatus, Th, Tr, ModalOverlay, ModalContent, ModalGrid, Input, TdNumContrato } from "./styles.js";

const TYPE_OPTIONS = [
    { value: "individual", label: "Individual" },
    { value: "coletivo", label: "Coletivo" },
    { value: "familiar", label: "Familiar" },
    { value: "temporario", label: "Temporário" },
];

const STATUS_OPTIONS = [
    { value: "disponivel", label: "Disponível" },
    { value: "ocupado", label: "Ocupado" },
    { value: "interditado", label: "Interditado" },
    { value: "manutencao", label: "Manutenção" },
];

const INITIAL_FORM = {
    numero: "",
    tipo: "individual",
    status: "disponivel",
    obs: "",
};

const statusLabel = (status) => {
    const normalized = String(status || "").trim().toLowerCase();
    const found = STATUS_OPTIONS.find((s) => s.value === normalized);
    return found ? found.label : (status || "-");
};

const typeLabel = (type) => {
    const normalized = String(type || "").trim().toLowerCase();
    const found = TYPE_OPTIONS.find((s) => s.value === normalized);
    return found ? found.label : (type || "-");
};

export default function OssariosComponent() {
    const [query, setQuery] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [form, setForm] = useState(INITIAL_FORM);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const filteredItems = useMemo(() => {
        const q = String(query || "").trim().toLowerCase();
        if (!q) return items;

        return items.filter((item) => {
            return String(item.numero || "").toLowerCase().includes(q)
                || String(item.tipo || "").toLowerCase().includes(q)
                || String(item.status || "").toLowerCase().includes(q)
                || String(item.obs || "").toLowerCase().includes(q);
        });
    }, [query, items]);

    const updateField = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setErrors((prev) => ({ ...prev, [key]: "" }));
    };

    const loadItems = async () => {
        setIsLoading(true);
        try {
            const { data } = await api.get("/ossarios");
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Erro ao carregar ossários", error);
            setItems([]);
            alert("Erro ao carregar ossários");
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
        if (!form.numero.trim()) nextErrors.numero = "Informe o número do ossário";
        if (!form.tipo.trim()) nextErrors.tipo = "Informe o tipo do ossário";
        if (!form.status.trim()) nextErrors.status = "Informe o status do ossário";

        const numeroNormalizado = form.numero.trim().toLowerCase();
        const isDuplicated = items.some(
            (item) => item.id !== editingId && String(item.numero || "").trim().toLowerCase() === numeroNormalizado
        );
        if (isDuplicated) {
            nextErrors.numero = "Já existe um ossário com esse número";
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
                numero: form.numero.trim(),
                tipo: form.tipo,
                status: form.status,
                obs: form.obs.trim(),
            };

            if (editingId) {
                await api.put(`/ossarios/${editingId}`, {
                    ...payload,
                    id: editingId,
                });
            } else {
                await api.post("/ossarios", payload);
                alert("Ossário cadastrado com sucesso.");
            }

            await loadItems();
            closeModal();
            setEditingId(null);
        } catch (error) {
            console.error("Erro ao salvar ossário", error);
            alert("Não foi possível salvar o ossário");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            numero: item.numero || "",
            tipo: item.tipo || "individual",
            status: item.status || "disponivel",
            obs: item.obs || "",
        });
        setErrors({});
        setModalOpen(true);
    };

    const handleDelete = async (id) => {
        const ok = window.confirm("Deseja realmente excluir este ossário?");
        if (!ok) return;

        setIsSubmitting(true);
        try {
            await api.delete(`/ossarios/${id}`);
            alert("Ossário excluído com sucesso");
            await loadItems();
        } catch (error) {
            console.error("Erro ao excluir ossário", error);
            alert("Não foi possível excluir o ossário");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <Container>
                <FormStyled>
                    <Title>OSSÁRIOS</Title>
                    <SearchWrapper>
                        <TextField
                            fullWidth
                            size="small"
                            label="Pesquisar"
                            placeholder="Pesquisar por número, tipo, status ou observações..."
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
                        <FaRegEdit />Adicionar ossário
                    </BtnPrimarySave>
                </div>

                <Card>
                    <h3 style={{ marginTop: 0, color: "#191970" }}>Ossários cadastrados</h3>
                    {isLoading ? (
                        <p style={{ textAlign: "center", color: "#666" }}>Carregando...</p>
                    ) : (
                        <TableWrapper>
                            <TableScroller>
                                <Table>
                                    <THead>
                                        <tr>
                                            <Th>Número</Th>
                                            <Th>Tipo</Th>
                                            <Th>Status</Th>
                                            <Th>Observações</Th>
                                            <Th>Ações</Th>
                                        </tr>
                                    </THead>
                                    <TBody>
                                        {filteredItems.length > 0 ? (
                                            filteredItems.map((item, index) => (
                                                <Tr key={item.id} index={index}>
                                                    <TdNumContrato>{item.numero}</TdNumContrato>
                                                    <Td>{typeLabel(item.tipo)}</Td>
                                                    <TdStatus><StatusBadge $status={item.status}>{statusLabel(item.status)}</StatusBadge></TdStatus>
                                                    <Td>{item.obs || "-"}</Td>
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
                                                <Td colSpan={5}>Nenhum ossário encontrado.</Td>
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
                            {editingId ? "Editar ossário" : "Novo ossário"}
                        </h3>

                        <form onSubmit={handleSave}>
                            <ModalGrid>
                                <div>
                                    <label>Número do ossário</label>
                                    <Input
                                        value={form.numero}
                                        onChange={(e) => updateField("numero", e.target.value)}
                                        placeholder="Ex: 01"
                                        disabled={isSubmitting}
                                    />
                                    {errors.numero ? <p style={errorStyle}>{errors.numero}</p> : null}
                                </div>

                                <div>
                                    <label>Tipo</label>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={form.tipo}
                                        onChange={(e) => updateField("tipo", e.target.value)}
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
                                        {TYPE_OPTIONS.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                    {errors.tipo ? <p style={errorStyle}>{errors.tipo}</p> : null}
                                </div>

                                <div>
                                    <label>Status</label>
                                    <TextField
                                        select
                                        fullWidth
                                        size="small"
                                        value={form.status}
                                        onChange={(e) => updateField("status", e.target.value)}
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
                                    {errors.status ? <p style={errorStyle}>{errors.status}</p> : null}
                                </div>

                                <div style={{ gridColumn: "1 / -1" }}>
                                    <label>Observações</label>
                                    <Input
                                        value={form.obs}
                                        onChange={(e) => updateField("obs", e.target.value)}
                                        placeholder="Observações gerais"
                                        disabled={isSubmitting}
                                    />
                                </div>
                            </ModalGrid>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                                <BtnPrimaryClose type="button" onClick={closeModal}>
                                    Cancelar
                                </BtnPrimaryClose>
                                <BtnPrimarySave type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar ossário"}</BtnPrimarySave>
                            </div>
                        </form>
                    </ModalContent>
                </ModalOverlay>
            )}
        </>
    );
}
