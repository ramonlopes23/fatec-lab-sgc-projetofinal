import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { loginRequest } from "../services/authService";

export const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
            hydrated: false,

            markHydrated: () => set({ hydrated: true }),

            login: async ({ username, password }) => {
                set({ isLoading: true, error: null });
                try {
                    const result = await loginRequest({ username, password });
                    set({
                        user: result.user,
                        accessToken: result.accessToken,
                        isAuthenticated: true,
                        isLoading: false,
                        error: null,
                    });
                    return result;
                } catch (err) {
                    const message = err?.message || "Erro ao autenticar. ";
                    set({ isLoading: false, error: message, isAuthenticated: false });
                    throw new Error(message);
                }
            },

            logout: () =>
                set({
                    user: null,
                    accessToken: null,
                    isAuthenticated: false,
                    isLoading: false,
                    error: null,
                }),
        }),
        {
            name: "sgc-auth",
            storage: createJSONStorage(() => localStorage),
            onRehydrateStorage: () => (state) => {
                if (state) state.markHydrated();
            },
            partialize: (state) => ({
                user: state.user,
                accessToken: state.accessToken,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
