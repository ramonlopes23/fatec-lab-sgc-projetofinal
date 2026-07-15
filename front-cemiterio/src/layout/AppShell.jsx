import React from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "./MainLayout";

export default function AppShell() {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
}
