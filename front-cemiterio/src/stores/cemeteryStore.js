import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCemeteries } from "../services/cemeteryService";

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
                    const cemeteries = Array.isArray(data) ? data : [];
                    const currentSelectedId = get().selectedCemeteryId;
                    const selectedExists =
                        currentSelectedId != null &&
                        cemeteries.some((cemetery) => String(cemetery?.id) === String(currentSelectedId));

                    const fallbackCemetery =
                        cemeteries.find((cemetery) => cemetery?.active !== false) || cemeteries[0] || null;
                    const nextSelectedId = selectedExists ? currentSelectedId : fallbackCemetery?.id ?? null;

                    set({
                        cemeteries,
                        selectedCemeteryId: nextSelectedId,
                    });

                    return cemeteries;
                } catch (err) {
                    const message =
                        err?.response?.data?.message || err?.message || "Erro ao carregar cemitérios.";
                    set({ error: message });
                    throw new Error(message);
                } finally {
                    set({ loading: false });
                }
            },

            setSelectedCemeteryId: (selectedCemeteryId) => {
                const normalizedId =
                    selectedCemeteryId == null || selectedCemeteryId === ""
                        ? null
                        : Number(selectedCemeteryId);

                set({ selectedCemeteryId: Number.isNaN(normalizedId) ? null : normalizedId });
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