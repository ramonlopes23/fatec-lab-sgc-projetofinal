import { useState } from "react";
import { createCemeteries, getCemeteries } from "../../services/cemeteryService";

export function useCreateCemetery({ onSuccess } = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateCemetery = async ({ name, foundation, active = true }) => {
        setLoading(true);
        setError("");

        try {
            const normalizedName = String(name || "").trim();
            const normalizedFoundation = String(foundation || "").trim();
            const normalizedActive = Boolean(active);

            if (!normalizedName) {
                throw new Error("Nome do cemitério é obrigatório.");
            }

            if (!normalizedFoundation) {
                throw new Error("Data de fundação é obrigatória.");
            }

            const date = new Date(`${normalizedFoundation}T00:00:00`);
            if (Number.isNaN(date.getTime())) {
                throw new Error("Data de fundação inválida.");
            }

            const today = new Date();
            const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            if (date > todayNoTime) {
                throw new Error("A data de fundação não pode estar no futuro.");
            }

            const existing = await getCemeteries();
            const alreadyExists =
                Array.isArray(existing) &&
                existing.some(
                    (c) =>
                        String(c?.name || "")
                            .trim()
                            .toLowerCase() === normalizedName.toLowerCase() &&
                        String(c?.foundation || "") === normalizedFoundation
                );

            if (alreadyExists) {
                throw new Error("Já existe um cemitério com esse nome e data de fundação.");
            }

            const payload = {
                name: normalizedName,
                foundation: normalizedFoundation,
                active: normalizedActive,
            };

            const created = await createCemeteries(payload);

            if (onSuccess) {
                await onSuccess(created);
            }

            return created;
        } catch (err) {
            const backendMessage = err?.response?.data?.message;
            const message = backendMessage || err?.message || "Erro ao criar cemitério.";
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return {
        handleCreateCemetery,
        loading,
        error,
    };
}
