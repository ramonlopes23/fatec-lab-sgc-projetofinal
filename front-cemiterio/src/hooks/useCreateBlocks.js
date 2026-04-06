import { useState } from "react";
import { createBlock, getBlocks } from "../services/blockService";

export function useCreateBlocks({ onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateBlock = async ({ number, description, cemeteryId }) => {
    setLoading(true);
    setError("");

    try {
      const blocks = await getBlocks();

      const exists = Array.isArray(blocks) && blocks.some(
        (block) =>
          String(block.number) === String(number) &&
          Number(block.cemeteryId) === Number(cemeteryId)
      );

      if (exists) {
        throw new Error("Já existe uma quadra com esse número neste cemitério.");
      }

      const created = await createBlock({
        number,
        description,
        cemeteryId,
        active: true,
      });

      if (onSuccess) {
        onSuccess(created);
      }

      return created;
    } catch (err) {
      console.error("Erro ao criar quadra:", err);
      setError(err.message || "Erro ao criar quadra.");
      throw err;
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