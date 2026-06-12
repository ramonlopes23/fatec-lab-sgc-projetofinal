import React from "react";
import Dashboard from "../../components/domain/Dashboard";
import SepultadosMedia from "../../charts/SepultadosMedia";
import Calendar from "../../components/common/Calendar";
import SepultadosTotal from "../../components/domain/SepultadosTotal";
import SepultadosMes from "../../components/domain/SepultadosMes";
import { Row } from "../../components/domain/DashboardRow/styles";


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