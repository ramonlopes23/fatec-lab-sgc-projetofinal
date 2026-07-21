import React, { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { useAuthStore } from "../stores/authStore";

const AppShell = lazy(() => import("../layout/AppShell"));
const Home = lazy(() => import("../pages/Home"));
const Cadastros = lazy(() => import("../pages/Cadastros"));
const Registros = lazy(() => import("../pages/Registros"));
const VerMapa = lazy(() => import("../pages/VerMapa"));
const Calendario = lazy(() => import("../pages/Calendario"));
const Relatorios = lazy(() => import("../pages/Relatorios"));
const Contratos = lazy(() => import("../pages/Contratos"));
const Cemiterios = lazy(() => import("../pages/Cemiterios"));
const Ossarios = lazy(() => import("../pages/Ossarios"));
const Taxas = lazy(() => import("../pages/Taxas"));
const NotFound = lazy(() => import("../pages/NotFound"));
const Login = lazy(() => import("../pages/Login"));
const Protocolos = lazy(() => import("../pages/Protocolos"));

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
        <Suspense fallback={<LoadingOverlay label="Carregando página..." />}>
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
        </Suspense>
    );
}
