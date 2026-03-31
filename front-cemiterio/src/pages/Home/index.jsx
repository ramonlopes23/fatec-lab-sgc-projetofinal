import React from "react";
import Dashboard from "../../components/Dashboard";
import SepultadosMedia from "../../components/SepultadosMedia";
import Calendar from "../../components/Calendar";
import SepultadosTotal from "../../components/SepultadosTotal";
import SepultadosMes from "../../components/SepultadosMes";
import { Row } from "../../components/DashboardRow/styles";


export default function Home() {
    return (
        <div>
            <Dashboard />
            <Row>
                <SepultadosMes />
                <SepultadosMedia />
                <SepultadosTotal />

            </Row>
        </div>

    );
}