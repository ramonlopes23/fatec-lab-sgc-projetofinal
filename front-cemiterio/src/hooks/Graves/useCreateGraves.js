import { useState } from "react";
import { createGrave, getGrave } from "../../services/graveService";

export function useCreateGraves({ onSuccess } = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleCreateGrave = async ({
        number,
        graveType,
        bodyCapacity,
        areaType,
        blockId,
        status,
        blocked = false,
    }) => {
        setLoading(true);
        setError("");

        try {
            const parsedNumber = Number(number);
            const parsedBodyCapacity = Number(bodyCapacity);
            const parsedBlockId = Number(blockId);

            if (!Number.isInteger(parsedNumber) || parsedNumber <= 0) {
                throw new Error("Número da sepultura inválido.");
            }

            if (!Number.isInteger(parsedBodyCapacity) || parsedBodyCapacity <= 0) {
                throw new Error("Capacidade de corpos inválida.");
            }

            if (!graveType || typeof graveType !== "string") {
                throw new Error("Tipo de sepultura inválido.");
            }

            if (!areaType || typeof areaType !== "string") {
                throw new Error("Tipo de área inválido.");
            }

            if (!Number.isInteger(parsedBlockId) || parsedBlockId <= 0) {
                throw new Error("Quadra inválida.");
            }

            if (typeof blocked !== "boolean") {
                throw new Error("Estado de bloqueio inválido")
            }

            const existingGraves = await getGrave();

            const alreadyExists = Array.isArray(existingGraves) && existingGraves.some((grave) => Number(grave.number) === parsedNumber && Number(grave.blockId) === parsedBlockId);

            if (alreadyExists) {
                throw new Error("Já existe uma sepultura com esse número nesta quadra. ");
            }

            const normalizedStatus = String(status || "AVAILABLE").toUpperCase();
            const normalizedBlocked =
                typeof blocked === "boolean"
                    ? blocked
                    : normalizedStatus === "MAINTENANCE";


            const payload = {
                number: parsedNumber,
                graveType: String(graveType).toUpperCase(),
                bodyCapacity: parsedBodyCapacity,
                areaType: String(areaType).toUpperCase(),
                blockId: parsedBlockId,
                status: normalizedStatus,
                blocked: normalizedBlocked,
            };

            const created = await createGrave(payload);

            if (onSuccess) {
                await onSuccess(created)
            }
            return created;
        } catch (err) {
            const backendMessage = err?.response?.data?.message;
            const message = backendMessage || err?.message || "Erro ao criar sepultura.";

            console.error("Erro ao criar sepultura:", err);
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    return {
        handleCreateGrave,
        loading,
        error,
    }
}
