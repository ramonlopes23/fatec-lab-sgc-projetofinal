import { useState } from "react";
import api from "../../services/index.js";
import { findTaxaByCodigo, formatDateKey, formatDateTimeKey } from "../../utils";

export default function useCadastrosSubmit({
    form,
    processType,
    taxas,
    resetToSepultamento,
    showSuccess,
    showWarning,
    showError,
    clearSaved,
    setCepResp,
    setEnderecoResp,
    setBusca,
    setIsIndigente,
    setFalecidos,
    setRegistros,
    clearSepultamento,
}) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);

        try {
            if (processType === "falecido") {
                const payload = {
                    ...form,
                    data_nasc: form.data_nasc ? formatDateKey(form.data_nasc) : "",
                    dh_falec: form.dh_falec ? formatDateTimeKey(form.dh_falec) : "",
                };
                const response = await api.post("/falecidos", payload);
                showSuccess("Falecido cadastrado. Continue com o sepultamento.");
                clearSaved();
                setCepResp("");
                setEnderecoResp("");
                setBusca("");
                setIsIndigente(false);
                setFalecidos((prev) => [...prev, response?.data].filter(Boolean));
                resetToSepultamento(response?.data, payload.nome_fal);
                return;
            }

            const selectedTaxa = findTaxaByCodigo(taxas, form.taxa);
            const sepultamentoPayload = {
                ...form,
                nome: form.nome_sep || form.nome_fal || "",
                nome_sep: form.nome_sep || form.nome_fal || "",
                taxa_id: selectedTaxa?.id ?? form.taxa_id ?? "",
                taxa_valor: Number(selectedTaxa?.valor ?? form.taxa_valor ?? 0),
                taxa_label: selectedTaxa?.label ?? "",
                foi_exumado: false,
                status: form.com_velorio ? "Aguardando velorio" : "Pendente",
                confirmado: false,
            };

            const rCheck = await api.get("/covas", { params: { blockId: sepultamentoPayload.quadra_sep, number: sepultamentoPayload.num_sepultura_sep } }).catch(() => null);
            const foundCheck = rCheck && Array.isArray(rCheck.data) && rCheck.data.length ? rCheck.data[0] : null;

            if (!foundCheck?.id) {
                showWarning("Sepultura nao encontrada para a quadra selecionada.");
                return;
            }

            const cap = Number(foundCheck.bodyCapacity ?? foundCheck.capacidade ?? 0);
            if (cap <= 0) {
                await api.patch(`/covas/${foundCheck.id}`, { status: "OCCUPIED", bodyCapacity: 0 }).catch(() => { });
                showError("A sepultura selecionada esta lotada. Escolha outra sepultura.");
                return;
            }

            let createdVelorio = null;
            if (form.com_velorio) {
                const velorioPayload = {
                    nome_vel: sepultamentoPayload.nome_sep,
                    nome_fal: sepultamentoPayload.nome_sep,
                    falecido_id: sepultamentoPayload.falecido_id,
                    data_velorio: sepultamentoPayload.dh_inicio_velorio,
                    dh_inicio_velorio: sepultamentoPayload.dh_inicio_velorio,
                    dh_fim_velorio: sepultamentoPayload.dh_fim_velorio,
                    local: sepultamentoPayload.local_velorio,
                    local_velorio: sepultamentoPayload.local_velorio,
                    tipo_velorio: sepultamentoPayload.tipo_velorio,
                    responsavel_velorio: sepultamentoPayload.responsavel_velorio,
                    obs_velorio: sepultamentoPayload.obs_velorio,
                    status: "Pendente",
                    confirmado: false,
                    sepultamento_id: "",
                };

                const velorioResponse = await api.post("/velorios", velorioPayload);
                createdVelorio = velorioResponse?.data ?? null;
                if (createdVelorio?.id) {
                    sepultamentoPayload.velorio_id = createdVelorio.id;
                }
            }

            const res = await api.post("/sepultamentos", sepultamentoPayload);
            const created = res?.data ?? null;

            if (createdVelorio?.id && created?.id) {
                await api.patch(`/velorios/${createdVelorio.id}`, { sepultamento_id: created.id }).catch(() => { });
                createdVelorio = { ...createdVelorio, sepultamento_id: created.id };
            }

            if (createdVelorio) window.dispatchEvent(new CustomEvent("processoCriado", { detail: { ...createdVelorio, _type: "Velório" } }));
            if (created) window.dispatchEvent(new CustomEvent("processoCriado", { detail: { ...created, _type: "Sepultamento" } }));

            setRegistros((prev) => ([...prev, { processType, data: sepultamentoPayload }]));
            showSuccess(form.com_velorio ? "Velório e sepultamento cadastrados. Confirme o velório na Dashboard para liberar o sepultamento." : "Sepultamento cadastrado (pendente). Confirme na Dashboard para concluir.");
            clearSaved();
            clearSepultamento();
        } catch (err) {
            console.error(err);
            showError(`Erro ao cadastrar processo ${processType}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return { handleConfirmSubmit, isSubmitting };
}
