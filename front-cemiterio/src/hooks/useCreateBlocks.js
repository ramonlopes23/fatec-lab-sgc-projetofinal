import { useState } from "react";
import { createBlock, getBlocks } from "../services/blockService";

export function useCreateBlocks({ onSuccess }={}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateBlock = async ({ number, description, cemeteryId }) => {
    setLoading(true);
    setError("");

    try {

      const parsedNumber = Number(number);
      const parsedCemeteryId = Number(cemeteryId);

      if(!Number.isInteger(parsedNumber) || parsedNumber <=0){
        throw new Error("Número de quadra inválido")
      }

      if(!Number.isInteger(parsedCemeteryId) || parsedCemeteryId <=0){
        throw new Error("Cemitério inválido")
      }

      const existingBlocks = await getBlocks();

      const alreadyExists = Array.isArray(existingBlocks) && existingBlocks.some((block)=> Number(block.number) === parsedNumber && Number(block.cemeteryId) === parsedCemeteryId);

      if(alreadyExists){
        throw new Error("Já existe quadra com esse número neste cemitério.")
      }

      const payload = {
        number: parsedNumber,
        description: String(description || "").trim(),
        active: true,
        cemeteryId: parsedCemeteryId,
        
      };

      const created = await createBlock(payload)

      if (onSuccess) {
        await onSuccess(created);
      }

      return created;
    } catch (err) {
      const backendMessage = err?.response?.data?.message;
      const message = backendMessage || err?.message || "Erro ao criar quadra.";

      console.error("Erro ao criar quadra:", err);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    handleCreateBlock,
    loading,
    error,
  };
}