import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../layout/AppShell";
import Home from "../pages/Home";
import Cadastros from "../pages/Cadastros";
import Registros from "../pages/Registros";
import VerMapa from "../pages/VerMapa";
import Calendario from "../pages/Calendario";
import Relatorios from "../pages/Relatorios";
import Contratos from "../pages/Contratos";
import Cemiterios from "../pages/Cemiterios";
import Ossarios from "../pages/Ossarios";
import Taxas from "../pages/Taxas";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import Protocolos from "../pages/Protocolos";
import { useAuthStore } from "../stores/authStore";

function PrivateRoute({ children }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const hydrated = useAuthStore((s) => s.hydrated);

    if (!hydrated) return <div style={{ padding: 24 }}>Carregando sessão...</div>;
    return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ children }) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    return isAuthenticated ? <Navigate to="/home" replace /> : children;
}

export default function AppRoutes() {
    return (
        <Routes>
            <Route
                path="/login"
                element={
                    <PublicOnlyRoute>
                        <Login />
                    </PublicOnlyRoute>
                }
            />
            <Route
                element={
                    <PrivateRoute>
                        <AppShell />
                    </PrivateRoute>
                }
            >
                <Route path="/" element={<Navigate to="/home" />} />
                <Route path="/home" element={<Home />} />
                <Route path="/calendario" element={<Calendario />} />
                <Route path="/cadastros" element={<Navigate to="/cadastros/falecido" replace />} />
                <Route path="/cadastros/falecido" element={<Cadastros />} />
                <Route path="/cadastros/sepultamento" element={<Cadastros />} />
                <Route path="/taxas" element={<Taxas />} />
                <Route path="/sepulturas" element={<Navigate to="/sepulturas/cemiterio" replace />} />
                <Route path="/sepulturas/cemiterio" element={<Cemiterios />} />
                <Route path="/sepulturas/ossario" element={<Ossarios />} />
                <Route path="/registros" element={<Registros />} />
                <Route path="/vermapa" element={<VerMapa />} />
                <Route path="/relatorios" element={<Relatorios />} />
                <Route path="/contratos" element={<Contratos />} />
                <Route path="/protocolos" element={<Protocolos />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}
