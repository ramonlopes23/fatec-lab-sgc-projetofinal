import React, { useEffect, useMemo, useState } from "react";
import api from "../../services/index.js";
import {
    AddPetButton,
    BtnCancel,
    BtnDelete,
    BtnSave,
    BtnUpdate,
    EmptyText,
    Field,
    FormGrid,
    Input,
    Label,
    ModalButtonsRow,
    ModalCard,
    ModalOverlay,
    PetActionsRow,
    PetCard,
    PetList,
    PetMeta,
    PetName,
    Select,
    TabButton,
    TabsBar,
    Textarea,
} from "./styles";
import { MdPets } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import { TiDelete } from "react-icons/ti";

const makeInitialForm = (sep = null) => ({
    nome_pet: "",
    especie: "",
    raca: "",
    data_obito_pet: "",
    dh_sep_pet: "",
    obs_pet: "",
    status: "concluido",
    confirmado: true,
    sepultamento_id: sep?.id ? String(sep.id) : "",
    falecido_id: sep?.falecido ?? sep?.falecido_id ?? sep?.falecidoId ?? "",
});
export default function CovaPetsSection({
    selectedCova,
    sepultamentos = [],
    petsAll = [],
    onPetCreated,
    onPetDeleted,
    children,
}) {
    const [activeTab, setActiveTab] = useState("sepultamentos");
    const [modalAddPetOpen, setModalAddPetOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formPet, setFormPet] = useState(makeInitialForm(sepultamentos[0] ?? null));
    const [editingPetId, setEditingPetId] = useState(null);

    const resetPetForm = () => {
        setFormPet(makeInitialForm(sepultamentos[0] ?? null))
        setEditingPetId(null);
    }

    const quadraKey = useMemo(
        () =>
            String(
                selectedCova?.cova?.quadra_cova ??
                selectedCova?.quadra_cova ??
                selectedCova?.quadra_sep ??
                selectedCova?.sep?.quadra_sep ??
                ""
            ),
        [selectedCova]
    );

    const numero = useMemo(
        () =>
            String(
                selectedCova?.numero ??
                selectedCova?.num_cova ??
                selectedCova?.num_sepultura_sep ??
                ""
            ),
        [selectedCova]
    );

    const modalPetList = useMemo(() => {
        if (!quadraKey || !numero) return [];
        return (Array.isArray(petsAll) ? petsAll : []).filter((p) => {
            if (p.foi_exumado) return false;
            const pQuadra = String(p.quadra_sep ?? "");
            const pNum = String(p.num_sepultura_sep ?? "");
            return pQuadra === quadraKey && pNum === numero;
        });
    }, [petsAll, quadraKey, numero]);

    useEffect(() => {
        setActiveTab("sepultamentos")
    }, [quadraKey, numero])

    useEffect(() => {
        if (activeTab === "pets" && modalPetList.length === 0) {
            setActiveTab("sepultamentos");
        }
    }, [modalPetList.length, activeTab]);

    const handleFormPetChange = (name, value) => {
        setFormPet((prev) => {
            const next = { ...prev, [name]: value };
            if (name === "sepultamento_id") {
                const sep = (sepultamentos || []).find((s) => String(s.id) === String(value));
                next.falecido_id = sep?.falecido ?? sep?.falecido_id ?? ""
            }
            return next;
        });
    };

    const openPetModal = () => {
        resetPetForm();
        setModalAddPetOpen(true);
    }

    const handleEditPetId = (pet) => {
        if (!pet) return;

        setEditingPetId(pet.id ?? null);
        setFormPet({
            nome_pet: pet.nome_pet || "",
            especie: pet.especie || "",
            raca: pet.raca || "",
            data_obito_pet: pet.data_obito_pet || "",
            dh_sep_pet: pet.dh_sep_pet || "",
            obs_pet: pet.obs_pet || "",
            status: pet.status || "concluido",
            confirmado: pet.confirmado ?? true,
            sepultamento_id: pet.sepultamento_id ? String(pet.sepultamento_id) : "",
            falecido_id: pet.falecido_id ?? "",
        });
        setModalAddPetOpen(true);
    }

    const handleDeletePet = async (pet) => {
        if (!pet?.id) return alert("Não foi possivel excluir. Pet sem ID");
        const ok = confirm(`Excluir o pet ${pet.nome_pet || "sem nome"}"?`);
        if (!ok) return;

        try {
            await api.delete(`/pets/${pet.id}`);
            if (typeof onPetDeleted === "function") onPetDeleted(pet.id);
            alert("Pet excluído com sucesso.");
        } catch (err) {
            console.error("Erro ao excluir pet", err);
            alert("Erro ao excluir pet")
        }
    };

    const submitPet = async (ev) => {
        ev.preventDefault();
        if (!formPet.nome_pet?.trim()) return alert("Informe o nome do pet.");
        if (!formPet.especie?.trim()) return alert("Informe a espécie do pet.");
        if (!formPet.sepultamento_id) return alert("Selecione o sepultamento para vincular o pet.");

        const sep = (sepultamentos || []).find(
            (s) => String(s.id) === String(formPet.sepultamento_id)
        );

        if (!sep) return alert("Sepultamento selecionado é inválido.");

        const payload = {
            nome_pet: formPet.nome_pet.trim(),
            especie: formPet.especie.trim(),
            raca: formPet.raca?.trim() || "",
            data_obito_pet: formPet.data_obito_pet || "",
            dh_sep_pet: formPet.dh_sep_pet || new Date().toISOString().slice(0, 16),
            obs_pet: formPet.obs_pet || "",
            status: "concluido",
            confirmado: true,
            foi_exumado: false,
            sepultamento_id: sep.id,
            falecido_id: sep.falecido ?? sep.falecido_id ?? sep.falecidoId ?? formPet.falecido_id ?? "",
            quadra_sep: sep.quadra_sep ?? quadraKey,
            num_sepultura_sep: sep.num_sepultura_sep ?? sep.num_sepultura ?? numero,
            nome_sep: sep.nome_sep ?? "",
        };

        try {
            setSaving(true);

            if (editingPetId) {
                const res = await api.put(`/pets/${editingPetId}`, {
                    ...payload,
                    id: editingPetId,
                });

                const updated = res?.data ?? { ...payload, id: editingPetId };
                if (typeof onPetCreated === "function") onPetCreated(updated);
                alert("Dados do pet atualizados com sucesso");
            } else {
                const res = await api.post("/pets", payload);
                const created = res?.data ?? payload;

                if (typeof onPetCreated === "function") onPetCreated(created);
                alert("Pet cadastrado com sucesso")
            }

            setModalAddPetOpen(false);
            setActiveTab("pets");
            resetPetForm();
        } catch (err) {
            console.error("Erro ao cadastrar pet", err);
            alert("Erro ao cadastrar pet.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <TabsBar>
                <TabButton
                    type="button"
                    $active={activeTab === "sepultamentos"}
                    onClick={() => setActiveTab("sepultamentos")}
                >
                    Sepultamentos ({(sepultamentos || []).length})
                </TabButton>

                {modalPetList.length > 0 && (
                    <TabButton
                        type="button"
                        $active={activeTab === "pets"}
                        onClick={() => setActiveTab("pets")}
                    >
                        <MdPets />Pets ({modalPetList.length})
                    </TabButton>
                )}

                <AddPetButton type="button" onClick={openPetModal}>
                    Incluir pet
                </AddPetButton>
            </TabsBar>

            {activeTab === "sepultamentos" ? (
                children
            ) : (
                <>
                    {modalPetList.length === 0 ? (
                        <EmptyText>Nenhum pet vinculado a esta sepultura.</EmptyText>
                    ) : (
                        <PetList>
                            {modalPetList.map((pet, idx) => (
                                <PetCard key={pet.id ?? `${pet.nome_pet}-${idx}`}>
                                    <PetActionsRow>
                                        <BtnUpdate type="button" onClick={() => handleEditPetId(pet)}>
                                            <RxUpdate />
                                        </BtnUpdate>
                                        <BtnDelete type="button" onClick={() => handleDeletePet(pet)}>
                                            <TiDelete />
                                        </BtnDelete>
                                    </PetActionsRow>

                                    <PetName>{pet.nome_pet || "Pet sem nome"}</PetName>
                                    <PetMeta>Espécie: {pet.especie || "-"}</PetMeta>
                                    <PetMeta>Raça: {pet.raca || "-"}</PetMeta>
                                    <PetMeta>Data do óbito: {pet.data_obito_pet || "-"}</PetMeta>
                                    <PetMeta>Data/Hora do sepultamento: {pet.dh_sep_pet || "-"}</PetMeta>
                                    <PetMeta>Observações: {pet.obs_pet || "-"}</PetMeta>
                                    <PetMeta>Falecido(a)/família vinculado(a): {pet.nome_sep || "-"}</PetMeta>

                                </PetCard>
                            ))}
                        </PetList>
                    )}
                </>
            )}

            {modalAddPetOpen && (
                <ModalOverlay
                    onMouseDown={(e) => {
                        if (e.target === e.currentTarget) setModalAddPetOpen(false);
                    }}
                >
                    <ModalCard onSubmit={submitPet}>
                        <h3 style={{ marginTop: 0 }}>
                            {editingPetId ? "Atualizar pet" : "Cadastrar Pet"}
                        </h3>

                        <FormGrid>
                            <Field>
                                <Label>Nome do pet</Label>
                                <Input
                                    value={formPet.nome_pet}
                                    onChange={(ev) => handleFormPetChange("nome_pet", ev.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label>Espécie</Label>
                                <Input
                                    value={formPet.especie}
                                    onChange={(ev) => handleFormPetChange("especie", ev.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label>Raça</Label>
                                <Input
                                    value={formPet.raca}
                                    onChange={(ev) => handleFormPetChange("raca", ev.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label>Data do óbito</Label>
                                <Input
                                    type="date"
                                    value={formPet.data_obito_pet}
                                    onChange={(ev) => handleFormPetChange("data_obito_pet", ev.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label>Data/Hora do sepultamento</Label>
                                <Input
                                    type="datetime-local"
                                    value={formPet.dh_sep_pet}
                                    onChange={(ev) => handleFormPetChange("dh_sep_pet", ev.target.value)}
                                />
                            </Field>

                            <Field>
                                <Label>Vincular ao sepultamento</Label>
                                <Select
                                    value={formPet.sepultamento_id}
                                    onChange={(ev) => handleFormPetChange("sepultamento_id", ev.target.value)}
                                >
                                    <option value="">Selecione</option>
                                    {(sepultamentos || []).map((s) => (
                                        <option key={s.id} value={String(s.id)}>
                                            {s.nome_sep || s.falecido?.nome_fal || `Sepultamento ${s.id}`}
                                        </option>
                                    ))}
                                </Select>
                            </Field>

                            <Field style={{ gridColumn: "1 / -1" }}>
                                <Label>Observações</Label>
                                <Textarea
                                    value={formPet.obs_pet}
                                    onChange={(ev) => handleFormPetChange("obs_pet", ev.target.value)}
                                />
                            </Field>
                        </FormGrid>

                        <ModalButtonsRow>
                            <BtnCancel type="button" onClick={() => setModalAddPetOpen(false)}>
                                Cancelar
                            </BtnCancel>
                            <BtnSave type="submit" disabled={saving}>
                                {saving ? "Salvando..." : (editingPetId ? "Atualizar" : "Salvar")}
                            </BtnSave>
                        </ModalButtonsRow>
                    </ModalCard>
                </ModalOverlay>
            )}
        </>
    );
}

