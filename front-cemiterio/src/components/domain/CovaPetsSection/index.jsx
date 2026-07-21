import React, { useEffect, useMemo, useState } from "react";
import { createPet, deletePet, updatePet } from "../../../services/petService.js";
import { useToastFeedback } from "../../../hooks";
import ConfirmationDialog from "../../common/ConfirmationDialog";
import DrawerComponent from "../../common/DrawerComponent";
import SystemButton from "../../common/SystemButton";
import SystemSelect from "../../common/SystemSelect";
import {
    BtnDelete,
    BtnUpdate,
    EmptyText,
    Field,
    Input,
    Label,
    PetActionsRow,
    PetCard,
    PetDetailsGrid,
    PetDetailItem,
    PetDetailLabel,
    PetDetailValue,
    PetDrawerActions,
    PetFormGrid,
    PetIncludeButtonWrapper,
    PetList,
    PetMeta,
    PetName,
    TabButton,
    TabsBar,
    Textarea,
    VisuallyHidden,
} from "./styles";
import { MdPets } from "react-icons/md";
import { RxUpdate } from "react-icons/rx";
import { TiDelete } from "react-icons/ti";
import { formatDateTimeKey, formatDateDMY, formatDateTimeDMY } from "../../../utils/date";
import { getFalecidoIdFromRecord, getFalecidoName } from "../../../utils/falecido";
import { isSepultamentoVigente } from "../../../utils/sepultamento";
import { getSepulturaNumber, getSepulturaQuadraRef } from "../../../utils/sepultura";

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
    falecido_id: getFalecidoIdFromRecord(sep),
});

const PET_INCLUSION_DISABLED_MESSAGE = "É necessário ter ao menos um sepultamento vigente nesta sepultura.";

export default function CovaPetsSection({
    selectedCova,
    sepultamentos = [],
    petsAll = [],
    onPetCreated,
    onPetDeleted,
    children,
}) {
    const [activeTab, setActiveTab] = useState("sepultamentos");
    const [petDrawerOpen, setPetDrawerOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [formPet, setFormPet] = useState(() =>
        makeInitialForm((Array.isArray(sepultamentos) ? sepultamentos : []).find(isSepultamentoVigente) ?? null)
    );
    const [editingPetId, setEditingPetId] = useState(null);
    const [isEditingPet, setIsEditingPet] = useState(false);
    const [pendingDeletePet, setPendingDeletePet] = useState(null);
    const { showSuccess, showError, ToastElement } = useToastFeedback();

    const quadraKey = useMemo(() => getSepulturaQuadraRef(selectedCova), [selectedCova]);

    const numero = useMemo(() => getSepulturaNumber(selectedCova), [selectedCova]);

    const sepultamentosVigentes = useMemo(
        () => (Array.isArray(sepultamentos) ? sepultamentos : []).filter(isSepultamentoVigente),
        [sepultamentos]
    );
    const canIncludePet = sepultamentosVigentes.length > 0;

    const resetPetForm = () => {
        setFormPet(makeInitialForm(sepultamentosVigentes[0] ?? null));
        setEditingPetId(null);
    };

    const modalPetList = useMemo(() => {
        if (!quadraKey || !numero) return [];
        return (Array.isArray(petsAll) ? petsAll : []).filter((p) => {
            if (p.foi_exumado) return false;
            const pQuadra = getSepulturaQuadraRef(p);
            const pNum = getSepulturaNumber(p);
            return pQuadra === quadraKey && pNum === numero;
        });
    }, [petsAll, quadraKey, numero]);

    useEffect(() => {
        setActiveTab("sepultamentos");
    }, [quadraKey, numero]);

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
                next.falecido_id = getFalecidoIdFromRecord(sep);
            }
            return next;
        });
    };

    const openPetDrawer = () => {
        if (!canIncludePet) {
            showError(PET_INCLUSION_DISABLED_MESSAGE);
            return;
        }

        resetPetForm();
        setIsEditingPet(true);
        setPetDrawerOpen(true);
    };

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
        setPetDrawerOpen(true);
    };

    const handleClosePetDrawer = () => {
        if (saving) return;
        setPetDrawerOpen(false);
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
            await deletePet(pet.id);
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

        const sep = (sepultamentos || []).find((s) => String(s.id) === String(formPet.sepultamento_id));

        if (!sep) return showError("Sepultamento selecionado é inválido.");
        if (!editingPetId && !isSepultamentoVigente(sep)) {
            return showError("O sepultamento selecionado não está vigente.");
        }

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
            falecido_id: getFalecidoIdFromRecord(sep) || formPet.falecido_id || "",
            quadra_sep: sep.quadra_sep ?? quadraKey,
            num_sepultura_sep: getSepulturaNumber(sep) || numero,
            nome_sep: sep.nome_sep ?? "",
        };

        try {
            setSaving(true);

            if (editingPetId) {
                const response = await updatePet(editingPetId, {
                    ...payload,
                    id: editingPetId,
                });

                const updated = response ?? { ...payload, id: editingPetId };
                if (typeof onPetCreated === "function") onPetCreated(updated);
                showSuccess("Dados do pet atualizados com sucesso");
            } else {
                const response = await createPet(payload);
                const created = response ?? payload;

                if (typeof onPetCreated === "function") onPetCreated(created);
                showSuccess("Pet cadastrado com sucesso");
            }

            setActiveTab("pets");
            if (editingPetId) {
                setIsEditingPet(false);
            } else {
                setPetDrawerOpen(false);
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
            getFalecidoName(selectedPetSepultamento) ||
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
                description={
                    pendingDeletePet
                        ? `Deseja excluir o pet ${pendingDeletePet.nome_pet || "sem nome"}?`
                        : "Confirme a exclusão do pet."
                }
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
                    <TabButton type="button" $active={activeTab === "pets"} onClick={() => setActiveTab("pets")}>
                        <MdPets />
                        Pets ({modalPetList.length})
                    </TabButton>
                )}

                <PetIncludeButtonWrapper
                    title={canIncludePet ? undefined : PET_INCLUSION_DISABLED_MESSAGE}
                    tabIndex={canIncludePet ? undefined : 0}
                    role={canIncludePet ? undefined : "group"}
                    aria-disabled={canIncludePet ? undefined : true}
                    aria-describedby={canIncludePet ? undefined : "pet-inclusion-disabled-message"}
                >
                    <SystemButton
                        type="button"
                        disabled={!canIncludePet}
                        aria-describedby={canIncludePet ? undefined : "pet-inclusion-disabled-message"}
                        onClick={openPetDrawer}
                    >
                        Incluir pet
                    </SystemButton>
                    {!canIncludePet ? (
                        <VisuallyHidden id="pet-inclusion-disabled-message">
                            {PET_INCLUSION_DISABLED_MESSAGE}
                        </VisuallyHidden>
                    ) : null}
                </PetIncludeButtonWrapper>
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
                                        <BtnUpdate
                                            type="button"
                                            aria-label={`Visualizar ou editar ${pet.nome_pet || "pet"}`}
                                            title="Visualizar ou editar pet"
                                            onClick={() => handleEditPetId(pet)}
                                        >
                                            <RxUpdate />
                                        </BtnUpdate>
                                        <BtnDelete
                                            type="button"
                                            aria-label={`Excluir ${pet.nome_pet || "pet"}`}
                                            title="Excluir pet"
                                            onClick={() => handleDeletePet(pet)}
                                        >
                                            <TiDelete />
                                        </BtnDelete>
                                    </PetActionsRow>

                                    <PetName>{pet.nome_pet || "Pet sem nome"}</PetName>
                                    <PetMeta>Espécie: {pet.especie || "-"}</PetMeta>
                                    <PetMeta>Raça: {pet.raca || "-"}</PetMeta>
                                    <PetMeta>
                                        Data do óbito: {pet.data_obito_pet ? formatDateDMY(pet.data_obito_pet) : "-"}
                                    </PetMeta>
                                    <PetMeta>
                                        Data/Hora do sepultamento:{" "}
                                        {pet.dh_sep_pet ? formatDateTimeDMY(pet.dh_sep_pet) : "-"}
                                    </PetMeta>
                                    <PetMeta>Observações: {pet.obs_pet || "-"}</PetMeta>
                                    <PetMeta>Falecido(a)/família vinculado(a): {pet.nome_sep || "-"}</PetMeta>
                                </PetCard>
                            ))}
                        </PetList>
                    )}
                </>
            )}

            <DrawerComponent
                open={petDrawerOpen}
                title={editingPetId ? (isEditingPet ? "Atualizar pet" : "Detalhes do pet") : "Cadastrar Pet"}
                subtitle={
                    editingPetId
                        ? "Consulte ou atualize os dados do pet vinculado."
                        : "Cadastre um pet e vincule-o a um sepultamento desta sepultura."
                }
                width="560px"
                zIndex={2700}
                closeOnOverlayClick={!saving}
                closeDisabled={saving}
                onClose={handleClosePetDrawer}
                bodyAs="form"
                bodyProps={{ onSubmit: submitPet, noValidate: true, "aria-busy": saving }}
            >
                {!isViewingExistingPet ? (
                    <PetFormGrid>
                        <Field>
                            <Label htmlFor="pet-name">Nome do pet</Label>
                            <Input
                                id="pet-name"
                                value={formPet.nome_pet}
                                disabled={saving}
                                autoFocus
                                required
                                onChange={(ev) => handleFormPetChange("nome_pet", ev.target.value)}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="pet-species">Espécie</Label>
                            <Input
                                id="pet-species"
                                value={formPet.especie}
                                disabled={saving}
                                required
                                onChange={(ev) => handleFormPetChange("especie", ev.target.value)}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="pet-breed">Raça</Label>
                            <Input
                                id="pet-breed"
                                value={formPet.raca}
                                disabled={saving}
                                onChange={(ev) => handleFormPetChange("raca", ev.target.value)}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="pet-death-date">Data do óbito</Label>
                            <Input
                                id="pet-death-date"
                                type="date"
                                value={formPet.data_obito_pet}
                                disabled={saving}
                                onChange={(ev) => handleFormPetChange("data_obito_pet", ev.target.value)}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="pet-burial-date">Data/Hora do sepultamento</Label>
                            <Input
                                id="pet-burial-date"
                                type="datetime-local"
                                value={formPet.dh_sep_pet}
                                disabled={saving}
                                onChange={(ev) => handleFormPetChange("dh_sep_pet", ev.target.value)}
                            />
                        </Field>

                        <Field>
                            <Label htmlFor="pet-burial-link">Vincular ao sepultamento</Label>
                            <SystemSelect
                                id="pet-burial-link"
                                value={formPet.sepultamento_id}
                                disabled={saving}
                                required
                                onChange={(ev) => handleFormPetChange("sepultamento_id", ev.target.value)}
                            >
                                <option value="">Selecione</option>
                                {(editingPetId ? sepultamentos || [] : sepultamentosVigentes).map((s) => (
                                    <option key={s.id} value={String(s.id)}>
                                        {getFalecidoName(s) || `Sepultamento ${s.id}`}
                                    </option>
                                ))}
                            </SystemSelect>
                        </Field>

                        <Field $fullWidth>
                            <Label htmlFor="pet-notes">Observações</Label>
                            <Textarea
                                id="pet-notes"
                                value={formPet.obs_pet}
                                disabled={saving}
                                onChange={(ev) => handleFormPetChange("obs_pet", ev.target.value)}
                            />
                        </Field>
                    </PetFormGrid>
                ) : (
                    <PetDetailsGrid>
                        {petViewFields.map(([label, value]) => (
                            <PetDetailItem key={label}>
                                <PetDetailLabel>{label}</PetDetailLabel>
                                <PetDetailValue>{value || "-"}</PetDetailValue>
                            </PetDetailItem>
                        ))}
                    </PetDetailsGrid>
                )}

                <PetDrawerActions>
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
                    <SystemButton type="button" tone="cancel" disabled={saving} onClick={handleClosePetDrawer}>
                        {editingPetId ? "Fechar" : "Cancelar"}
                    </SystemButton>
                </PetDrawerActions>
            </DrawerComponent>
        </>
    );
}
