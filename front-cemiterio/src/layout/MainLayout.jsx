import Header from "../components/common/Header";
import SidebarMenu from "../components/common/SidebarMenu";
import {
    Content,
    LayoutContainer,
    PageContent,
    SidebarBackdrop,
    SidebarContainer,
    SidebarExternalToggle,
} from "./styles";
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import LoadingOverlay from "../components/common/LoadingOverlay";
import Footer from "../components/common/Footer";

const MOBILE_LAYOUT_QUERY = "(max-width: 900px)";

const getIsMobileViewport = () => typeof window !== "undefined" && window.matchMedia(MOBILE_LAYOUT_QUERY).matches;

export default function MainLayout({ children }) {
    const [isMobileViewport, setIsMobileViewport] = useState(getIsMobileViewport);
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => !getIsMobileViewport());
    const [routeLoading, setRouteLoading] = useState(false);
    const location = useLocation();

    const toggleSidebarMenu = () => {
        setIsSidebarOpen((prev) => !prev);
    };

    useEffect(() => {
        const mediaQuery = window.matchMedia(MOBILE_LAYOUT_QUERY);
        const handleViewportChange = (event) => {
            setIsMobileViewport(event.matches);
            setIsSidebarOpen(!event.matches);
        };

        handleViewportChange(mediaQuery);
        mediaQuery.addEventListener("change", handleViewportChange);
        return () => mediaQuery.removeEventListener("change", handleViewportChange);
    }, []);

    useEffect(() => {
        setRouteLoading(true);
        const timer = window.setTimeout(() => setRouteLoading(false), 300);
        return () => window.clearTimeout(timer);
    }, [location.pathname]);

    useEffect(() => {
        if (isMobileViewport) setIsSidebarOpen(false);
    }, [isMobileViewport, location.pathname]);

    useEffect(() => {
        if (!isMobileViewport || !isSidebarOpen) return undefined;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") setIsSidebarOpen(false);
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isMobileViewport, isSidebarOpen]);

    return (
        <LayoutContainer>
            <LoadingOverlay open={routeLoading} label="Carregando página..." />
            <SidebarContainer
                $isOpen={isSidebarOpen}
                aria-hidden={isMobileViewport && !isSidebarOpen}
                inert={isMobileViewport && !isSidebarOpen ? true : undefined}
            >
                <SidebarMenu isCollapsed={!isSidebarOpen} />
            </SidebarContainer>
            {isSidebarOpen ? (
                <SidebarBackdrop
                    type="button"
                    aria-label="Fechar menu lateral"
                    onClick={() => setIsSidebarOpen(false)}
                />
            ) : null}
            <SidebarExternalToggle
                type="button"
                $isOpen={isSidebarOpen}
                onClick={toggleSidebarMenu}
                aria-label={isSidebarOpen ? "Recolher menu lateral" : "Expandir menu lateral"}
            >
                {isSidebarOpen ? <LuChevronLeft size={16} /> : <LuChevronRight size={16} />}
            </SidebarExternalToggle>
            <Content $isSidebarOpen={isSidebarOpen}>
                <Header onMenuClick={toggleSidebarMenu} isSidebarOpen={isSidebarOpen} />
                <PageContent>{children}</PageContent>
                <Footer />
            </Content>
        </LayoutContainer>
    );
}
