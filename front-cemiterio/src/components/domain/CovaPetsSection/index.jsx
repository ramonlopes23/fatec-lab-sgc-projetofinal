import React, { useEffect, useMemo, useState } from "react";
import api from "../../../services/index.js";
import { useToastFeedback } from "../../../hooks";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import SystemButton from "../../common/SystemButton";
import DefaultModal, {
    DefaultModalActions,
    DefaultModalGrid,
    DefaultModalInfoField,
    DefaultModalViewGrid,
} from "../../common/DefaultModal";
import {
    BtnDelete,
    BtnUpdate,
    EmptyText,
    Field,
    Input,
    Label,
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
import { formatDateTimeKey, formatDateDMY, formatDateTimeDMY } from "../../../utils/date";

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
    const [isEditingPet, setIsEditingPet] = useState(false);
    const [pendingDeletePet, setPendingDeletePet] = useState(null);
    const { showSuccess, showError, ToastElement } = useToastFeedback();

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
        setIsEditingPet(true);
        setModalAddPetOpen(true);
    }

    const handleEditPetId = (pet) => {
        if (!pet) return;

        setIsEditingPet(false);
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

    const handleClosePetModal = () => {
        setModalAddPetOpen(false);
        setIsEditingPet(false);
    };

    const handleDeletePet = async (pet) => {
        if (!pet?.id) return showError("Não foi possivel excluir. Pet sem ID");
        setPendingDeletePet(pet);
    };

    const closeDeletePetDialog = () => {
        setPendingDeletePet(null);
    };

    const confirmDeletePet = async () => {
        const pet = pendingDeletePet;
        if (!pet?.id) return;

        try {
            await api.delete(`/pets/${pet.id}`);
            if (typeof onPetDeleted === "function") onPetDeleted(pet.id);
            showSuccess("Pet excluído com sucesso.");
            closeDeletePetDialog();
        } catch (err) {
            console.error("Erro ao excluir pet", err);
            showError("Erro ao excluir pet");
        }
    };

    const submitPet = async (ev) => {
        ev.preventDefault();
        if (saving) return;
        if (!formPet.nome_pet?.trim()) return showError("Informe o nome do pet.");
        if (!formPet.especie?.trim()) return showError("Informe a espécie do pet.");
        if (!formPet.sepultamento_id) return showError("Selecione o sepultamento para vincular o pet.");

        const sep = (sepultamentos || []).find(
            (s) => String(s.id) === String(formPet.sepultamento_id)
        );

        if (!sep) return showError("Sepultamento selecionado é inválido.");

        const payload = {
            nome_pet: formPet.nome_pet.trim(),
            especie: formPet.especie.trim(),
            raca: formPet.raca?.trim() || "",
            data_obito_pet: formPet.data_obito_pet || "",
            dh_sep_pet: formPet.dh_sep_pet || formatDateTimeKey(new Date()),
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
                showSuccess("Dados do pet atualizados com sucesso");
            } else {
                const res = await api.post("/pets", payload);
                const created = res?.data ?? payload;

                if (typeof onPetCreated === "function") onPetCreated(created);
                showSuccess("Pet cadastrado com sucesso");
            }

            setActiveTab("pets");
            if (editingPetId) {
                setIsEditingPet(false);
            } else {
                setModalAddPetOpen(false);
                resetPetForm();
            }
        } catch (err) {
            console.error("Erro ao cadastrar pet", err);
            showError("Erro ao cadastrar pet.");
        } finally {
            setSaving(false);
        }
    };

    const isViewingExistingPet = Boolean(editingPetId) && !isEditingPet;
    const selectedPetSepultamento = (sepultamentos || []).find(
        (sepultamento) => String(sepultamento.id) === String(formPet.sepultamento_id)
    );
    const petViewFields = [
        ["Nome do pet", formPet.nome_pet],
        ["Espécie", formPet.especie],
        ["Raça", formPet.raca],
        ["Data do óbito", formPet.data_obito_pet ? formatDateDMY(formPet.data_obito_pet) : ""],
        ["Data/Hora do sepultamento", formPet.dh_sep_pet ? formatDateTimeDMY(formPet.dh_sep_pet) : ""],
        [
            "Sepultamento vinculado",
            selectedPetSepultamento?.nome_sep ||
                selectedPetSepultamento?.falecido?.nome_fal ||
                (formPet.sepultamento_id ? `Sepultamento ${formPet.sepultamento_id}` : ""),
        ],
        ["Observações", formPet.obs_pet],
    ];

    return (
        <>
            {ToastElement}
            <ConfirmationDialog
                open={Boolean(pendingDeletePet)}
                onClose={closeDeletePetDialog}
                onConfirm={confirmDeletePet}
                title="Excluir pet"
                alertSeverity="error"
                alertMessage="Esta ação removerá o pet do sistema."
                description={pendingDeletePet ? `Deseja excluir o pet ${pendingDeletePet.nome_pet || "sem nome"}?` : "Confirme a exclusão do pet."}
                confirmLabel="Excluir"
                confirmTone="delete"
                confirmDisabled={!pendingDeletePet}
                ariaDescriptionId="pet-delete-dialog-description"
            />
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

                <SystemButton type="button" onClick={openPetModal}>
                    Incluir pet
                </SystemButton>
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
                                    <PetMeta>Data do óbito: {pet.data_obito_pet ? formatDateDMY(pet.data_obito_pet) : "-"}</PetMeta>
                                    <PetMeta>Data/Hora do sepultamento: {pet.dh_sep_pet ? formatDateTimeDMY(pet.dh_sep_pet) : "-"}</PetMeta>
                                    <PetMeta>Observações: {pet.obs_pet || "-"}</PetMeta>
                                    <PetMeta>Falecido(a)/família vinculado(a): {pet.nome_sep || "-"}</PetMeta>

                                </PetCard>
                            ))}
                        </PetList>
                    )}
                </>
            )}

            <DefaultModal
                open={modalAddPetOpen}
                title={editingPetId ? (isEditingPet ? "Atualizar pet" : "Detalhes do pet") : "Cadastrar Pet"}
                width="520px"
                onClose={handleClosePetModal}
            >
                    <form onSubmit={submitPet}>
                        {isViewingExistingPet ? (
                            <DefaultModalViewGrid>
                                {petViewFields.map(([label, value]) => (
                                    <DefaultModalInfoField key={label} label={label} value={value} />
                                ))}
                            </DefaultModalViewGrid>
                        ) : (
                        <DefaultModalGrid>
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
                                    disabled={saving}
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
                        </DefaultModalGrid>
                        )}

                        <DefaultModalActions>
                            {isViewingExistingPet ? (
                                <SystemButton
                                    type="button"
                                    onClick={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        setIsEditingPet(true);
                                    }}
                                    disabled={saving}
                                >
                                    Editar
                                </SystemButton>
                            ) : (
                                <SystemButton type="submit" disabled={saving}>
                                    {saving ? "Salvando..." : "Salvar"}
                                </SystemButton>
                            )}
                            <SystemButton type="button" tone="cancel" onClick={handleClosePetModal}>
                                {editingPetId ? "Fechar" : "Cancelar"}
                            </SystemButton>
                        </DefaultModalActions>
                    </form>
            </DefaultModal>
        </>
    );
}

