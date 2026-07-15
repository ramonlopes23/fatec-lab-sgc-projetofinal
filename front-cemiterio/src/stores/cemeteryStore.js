import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCemeteries } from "../services/cemeteryService";
import { getCemiterioId, isCemiterioActive, normalizeCemiterio } from "../utils/cemiterio.js";

export const useCemeteryStore = create(
    persist(
        (set, get) => ({
            cemeteries: [],
            selectedCemeteryId: null,
            loading: false,
            error: null,

            loadCemeteries: async () => {
                set({ loading: true, error: null });

                try {
                    const data = await getCemeteries();
                    const cemeteries = Array.isArray(data) ? data.map(normalizeCemiterio) : [];
                    const currentSelectedId = get().selectedCemeteryId;
                    const selectedExists =
                        currentSelectedId != null &&
                        cemeteries.some((cemetery) => String(getCemiterioId(cemetery)) === String(currentSelectedId));

                    const fallbackCemetery =
                        cemeteries.find((cemetery) => isCemiterioActive(cemetery)) || cemeteries[0] || null;
                    const nextSelectedId = selectedExists
                        ? currentSelectedId
                        : getCemiterioId(fallbackCemetery) || null;

                    set({
                        cemeteries,
                        selectedCemeteryId: nextSelectedId,
                    });

                    return cemeteries;
                } catch (err) {
                    const message = err?.response?.data?.message || err?.message || "Erro ao carregar cemitérios.";
                    set({ error: message });
                    throw new Error(message);
                } finally {
                    set({ loading: false });
                }
            },

            setSelectedCemeteryId: (selectedCemeteryId) => {
                const normalizedId =
                    selectedCemeteryId == null || selectedCemeteryId === "" ? null : selectedCemeteryId;
                set({ selectedCemeteryId: normalizedId });
            },
        }),
        {
            name: "sgc-cemetery-selection",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                selectedCemeteryId: state.selectedCemeteryId,
            }),
        }
    )
);
