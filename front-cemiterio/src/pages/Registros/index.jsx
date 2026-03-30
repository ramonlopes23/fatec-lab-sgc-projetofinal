import RegistrosComponent from "../../components/RegistrosComponent";
import MainLayout from "../../layout/MainLayout";
import Footer from "../../components/Footer";
import React from "react";

export default function Registros() {
  return (
    <>
      <MainLayout>
        <RegistrosComponent />
      </MainLayout>
      <Footer />
    </>
  )
}
