import Dashboard from "../components/Dashboard";
import Header from "../components/Header";
import SidebarMenu from "../components/SidebarMenu";
import {Content,LayoutContainer,PageContent, SidebarContainer,SidebarExternalToggle,GlobalStyle} from "./styles"
import React, {useState} from "react";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function MainLayout ({children}){
    const [isSidebarOpen, setiIsSidebarOpen] = useState (true);

    const toggleSidebarMenu = () => {
        setiIsSidebarOpen((prev) => !prev);
    };

    return(

        <LayoutContainer>
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
                <Header onMenuClick={toggleSidebarMenu} />
                <PageContent>{children}</PageContent>
            </Content>
      
        </LayoutContainer>
    );
}

