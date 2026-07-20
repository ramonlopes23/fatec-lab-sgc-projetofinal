import React from "react";
import { useDashboardData } from "../../../hooks";
import DashboardMovement from "./DashboardMovement";
import GraveSituation from "./GraveSituation";
import OperationalAgenda from "./OperationalAgenda";
import OperationalInbox from "./OperationalInbox";
import { DashboardGrid, DashboardWrapper } from "./styles";

export default function Dashboard() {
    const dashboardData = useDashboardData();

    return (
        <DashboardWrapper>
            <DashboardGrid>
                <OperationalInbox dashboardData={dashboardData} />
                <OperationalAgenda dashboardData={dashboardData} />
                <DashboardMovement dashboardData={dashboardData} />
                <GraveSituation dashboardData={dashboardData} />
            </DashboardGrid>
        </DashboardWrapper>
    );
}
