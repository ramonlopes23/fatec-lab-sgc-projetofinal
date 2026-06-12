import Dashboard from "../components/domain/Dashboard";
import Header from "../components/common/Header";
import SidebarMenu from "../components/common/SidebarMenu";
import {Content,LayoutContainer,PageContent, SidebarContainer,SidebarExternalToggle,GlobalStyle} from "./styles"
import React, {useEffect, useState} from "react";
import { useLocation } from "react-router-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import LoadingOverlay from "../components/common/LoadingOverlay";
import Footer from "../components/common/Footer";

export default function MainLayout ({children}){
    const [isSidebarOpen, setiIsSidebarOpen] = useState (true);
    const [routeLoading, setRouteLoading] = useState(false);
    const location = useLocation();

    const toggleSidebarMenu = () => {
        setiIsSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        setRouteLoading(true);
        const timer = window.setTimeout(() => setRouteLoading(false), 300);
        return () => window.clearTimeout(timer);
    }, [location.pathname]);

    return(

        <LayoutContainer>
            <LoadingOverlay open={routeLoading} label="Carregando página..." />
            <SidebarContainer isOpen={isSidebarOpen}>
                <SidebarMenu isCollapsed={!isSidebarOpen} />
            </SidebarContainer>
            <SidebarExternalToggle
                type="button"
                isOpen={isSidebarOpen}
                onClick={toggleSidebarMenu}
                aria-label={isSidebarOpen ? "Recolher menu lateral" : "Expandir menu lateral"}
            >
                {isSidebarOpen ? <LuChevronLeft size={16} /> : <LuChevronRight size={16} />}
            </SidebarExternalToggle>
            <Content isSidebarOpen={isSidebarOpen}>
                <Header onMenuClick={toggleSidebarMenu} isSidebarOpen={isSidebarOpen} />
                <PageContent>{children}</PageContent>
                <Footer />
            </Content>
      
        </LayoutContainer>
    );
}

