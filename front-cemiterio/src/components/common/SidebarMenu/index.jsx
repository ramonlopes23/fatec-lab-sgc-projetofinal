import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { GiArchiveRegister, GiGraveFlowers } from "react-icons/gi";
import { PiFlowerTulip } from "react-icons/pi";
import { FaHouse } from "react-icons/fa6";
import { RiArchiveDrawerFill } from "react-icons/ri";
import { LuCalendarSearch, LuFileStack } from "react-icons/lu";
import { FaCross, FaMoneyBillWave } from "react-icons/fa";
import { LuLogs } from "react-icons/lu";
import { CgLogOut } from "react-icons/cg";
import { FaGears } from "react-icons/fa6";
import { MdManageAccounts } from "react-icons/md";
import { GrDocumentConfig } from "react-icons/gr";
import { MdOutlineContentPasteSearch } from "react-icons/md";
import sgclogo1 from "../../../assets/logoSGCwhite.png";
import {
    GlobalStyle,
    CollapsedNavLink,
    CollapsedToggle,
    ChevronIcon,
    CompactChildLink,
    CompactNestedList,
    LogoContainer,
    LogoImage,
    MenuIconSlot,
    MenuLabel,
    NavContainer,
    NavItem,
    NavList,
    SidebarActionButton,
    SidebarToggle,
    StyledNavLink,
    Title,
} from "./styles";
import { LiaFileContractSolid } from "react-icons/lia";
import { TbReportAnalytics } from "react-icons/tb";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useAuthStore } from "../../../stores/authStore";

export default function SidebarMenu({ isCollapsed = false }) {
    const [expandedItems, setExpandedItems] = useState({});
    const navigate = useNavigate();
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        logout();
        navigate("/login", { replace: true });
    };

    const menuItems = [
        { name: "Home", icon: <MdDashboard size={20} />, path: "/home" },
        {
            name: "Operações",
            icon: <FaGears size={20} />,
            children: [
                { name: "Cadastrar Falecido", icon: <PiFlowerTulip size={20} />, path: "/cadastros/falecido" },
                { name: "Cadastrar Sepultamento", icon: <FaCross size={20} />, path: "/cadastros/sepultamento" },
            ],
        },
        {
            name: "Estrutura Cemiterial",
            icon: <GiGraveFlowers size={20} />,
            children: [
                { name: "Cemitério", icon: <FaHouse size={20} />, path: "/sepulturas/cemiterio" },
                { name: "Mapa", icon: <BsGrid3X3GapFill size={20} />, path: "/vermapa" },
                { name: "Ossário", icon: <RiArchiveDrawerFill size={20} />, path: "/sepulturas/ossario" },
            ],
        },
        {
            name: "Gestão Documental",
            icon: <GrDocumentConfig size={20} />,
            children: [
                { name: "Contratos/Títulos de posse", icon: <LiaFileContractSolid size={20} />, path: "/contratos" },
            ],
        },
        {
            name: "Consultas",
            icon: <MdOutlineContentPasteSearch size={20} />,
            children: [
                { name: "Calendário", icon: <LuCalendarSearch size={20} />, path: "/calendario" },
                { name: "Falecidos", icon: <GiArchiveRegister size={20} />, path: "/registros" },
                { name: "Relatórios", icon: <TbReportAnalytics size={20} />, path: "/relatorios" },
            ],
        },
        {
            name: "Administração", icon: <MdManageAccounts size={20} />, children: [
                { name: "Logs do Sistema", icon: <LuLogs size={20} />, path: "/protocolos" },
                { name: "Taxas", icon: <FaMoneyBillWave size={20} />, path: "/taxas" },

            ]
        },
        { name: "Sair", icon: <CgLogOut size={20} />, action: handleLogout },
    ];

    const toggleExpanded = (itemName) => {
        setExpandedItems((prev) => ({
            ...prev,
            [itemName]: !prev[itemName],
        }));
    };

    return (
        <>
            <GlobalStyle />
            <LogoContainer>
                <LogoImage src={sgclogo1} alt="Logo Memo" $isCollapsed={isCollapsed} />
                {!isCollapsed && <Title>SISTEMA DE GERENCIAMENTO DE CEMITÉRIOS</Title>}

            </LogoContainer>

            <NavContainer>
                <NavList>
                    {menuItems.map((item) => (
                        <NavItem key={item.name}>
                            {item.children ? (
                                <CollapsedToggle
                                    onClick={() => toggleExpanded(item.name)}
                                    isExpanded={expandedItems[item.name]}
                                    $isCollapsed={isCollapsed}
                                >
                                    <MenuIconSlot>{item.icon}</MenuIconSlot>
                                    <MenuLabel $isCollapsed={isCollapsed}>{item.name}</MenuLabel>
                                    {item.children && (
                                        <ChevronIcon $direction={expandedItems[item.name] ? "left" : "right"} $compact={isCollapsed}>
                                            <LuChevronRight size={18} />
                                        </ChevronIcon>
                                    )}
                                </CollapsedToggle>
                            ) : item.action ? (
                                <SidebarActionButton type="button" onClick={item.action} title={item.name}>
                                    <MenuIconSlot>{item.icon}</MenuIconSlot>
                                    <MenuLabel $isCollapsed={isCollapsed}>{item.name}</MenuLabel>
                                </SidebarActionButton>
                            ) : (
                                <CollapsedNavLink to={item.path} $isCollapsed={isCollapsed} title={item.name}>
                                    <MenuIconSlot>{item.icon}</MenuIconSlot>
                                    <MenuLabel $isCollapsed={isCollapsed}>{item.name}</MenuLabel>
                                </CollapsedNavLink>
                            )}

                            {item.children && (
                                <CompactNestedList
                                    $isOpen={!!expandedItems[item.name]}
                                    $isVisible={!!expandedItems[item.name]}
                                    $isCollapsed={isCollapsed}
                                >
                                    {item.children.map((child) => (
                                        <NavItem key={child.name}>
                                            <CompactChildLink to={child.path} title={child.name} $isCollapsed={isCollapsed}>
                                                <MenuIconSlot>{child.icon}</MenuIconSlot>
                                                <MenuLabel $isCollapsed={isCollapsed}>{child.name}</MenuLabel>
                                            </CompactChildLink>
                                        </NavItem>
                                    ))}
                                </CompactNestedList>
                            )}
                        </NavItem>
                    ))}
                </NavList>
            </NavContainer>
        </>
    );
}
