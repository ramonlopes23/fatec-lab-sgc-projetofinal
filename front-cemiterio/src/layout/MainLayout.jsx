import Dashboard from "../components/Dashboard";
import Header from "../components/Header";
import SidebarMenu from "../components/SidebarMenu";
import {Content,LayoutContainer,PageContent, SidebarContainer,GlobalStyle} from "./styles"
import React, {useState} from "react";

export default function MainLayout ({children}){
    const [isSidebarOpen, setiIsSidebarOpen] = useState (true);

    const toggleSidebarMenu = () => {
        setiIsSidebarOpen((prev) => !prev);
    };

    return(

        <LayoutContainer>
            <SidebarContainer isOpen={isSidebarOpen}>
                <SidebarMenu isCollapsed={!isSidebarOpen} onToggleSidebar={toggleSidebarMenu} />
            </SidebarContainer>
            <Content isSidebarOpen={isSidebarOpen}>
                <Header onMenuClick={toggleSidebarMenu} />
                <PageContent>{children}</PageContent>
            </Content>
      
        </LayoutContainer>
    );
}

