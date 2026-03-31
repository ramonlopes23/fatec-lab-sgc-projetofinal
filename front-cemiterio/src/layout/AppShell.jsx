import React from "react";
import { Outlet } from "react-router-dom";
import MainLayout from "./MainLayout";
import Footer from "../components/Footer";

export default function AppShell() {
    return (
        <>
            <MainLayout>
                <Outlet />
            </MainLayout>
            <Footer />
        </>
    )
}