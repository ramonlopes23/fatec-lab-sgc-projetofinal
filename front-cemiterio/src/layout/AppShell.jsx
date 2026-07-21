import React from "react";
import { Outlet } from "react-router-dom";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale/pt-BR";
import MainLayout from "./MainLayout";

export default function AppShell() {
    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
            <MainLayout>
                <Outlet />
            </MainLayout>
        </LocalizationProvider>
    );
}
