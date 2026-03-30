import RelatoriosComponent from "../../components/RelatoriosComponent";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import React from "react";

export default function Relatorios() {
    return (
        <>
            <MainLayout>
                <RelatoriosComponent />
            </MainLayout>
            <Footer />
        </>
    )
}