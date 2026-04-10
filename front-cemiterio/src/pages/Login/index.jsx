import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";


export default function Login() {

    const navigate = useNavigate();

    const login = useAuthStore((s) => s.login);
    const isLoading = useAuthStore((s) => s.isLoading);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const error = useAuthStore((s) => s.error);

    const [form, setForm] = useState({ username: "", password: "" });

    if (isAuthenticated) return <Navigate to="/home" replace />;

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await login(form);
            navigate("/home", { replace: true });

        } catch {
            //erro ja tratado na store (store.error)
        }
    }

    return (
        <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#f6f8ff" }}>
            <form onSubmit={handleSubmit} style={{ width: 360, padding: 20, borderRadius: 12, background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,.12)" }}>
                <h2 style={{ marginTop: 0, color: "#191970" }}>Login SGC</h2>

                <label>Usuário</label>
                <input
                    value={form.username}
                    onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                    style={{ width: "100%", marginBottom: 10 }}
                />

                <label>Senha</label>
                <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    style={{ width: "100%", marginBottom: 12 }}
                />

                {error ? <p style={{ color: "#aa1818" }}>{error}</p> : null}

                <button type="submit" disabled={isLoading} style={{ width: "100%" }}>
                    {isLoading ? "Entrando..." : "Entrar"}
                </button>
            </form>
        </div>
    )
}