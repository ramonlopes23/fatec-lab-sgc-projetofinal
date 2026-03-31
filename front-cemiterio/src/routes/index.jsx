import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AppShell from "../layout/AppShell";
import Home from "../pages/Home";
import Cadastros from "../pages/Cadastros";
import Configurar from "../pages/Configurar";
import Registros from "../pages/Registros";
import VerMapa from "../pages/VerMapa";
import Calendario from "../pages/Calendario";
import Relatorios from "../pages/Relatorios";
import Contratos from "../pages/Contratos";
import ProcessSelection from "../pages/ProcessSelection";
import NotFound from "../pages/NotFound";


export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<AppShell />}>
                <Route path='/' element={<Navigate to="/home" />} />
                <Route path='/home' element={<Home />} />
                <Route path='/calendario' element={<Calendario />} />
                <Route path='/cadastros' element={<Cadastros />} />
                <Route path='/configurar' element={<Configurar />} />
                <Route path='/registros' element={<Registros />} />
                <Route path='/vermapa' element={<VerMapa />} />
                <Route path='/processselection' element={<ProcessSelection />} />
                <Route path='/relatorios' element={<Relatorios />} />
                <Route path='/contratos' element={<Contratos />} />
                <Route path='*' element={<NotFound />} />
            </Route>
        </Routes>
    );
}

