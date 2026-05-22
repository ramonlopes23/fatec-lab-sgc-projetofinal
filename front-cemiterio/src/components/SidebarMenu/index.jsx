import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { GiArchiveRegister, GiGraveFlowers } from "react-icons/gi";
import { PiFlowerTulip } from "react-icons/pi";
import { FaHouse } from "react-icons/fa6";
import { RiArchiveDrawerFill } from "react-icons/ri";
import { LuCalendarSearch, LuFileStack } from "react-icons/lu";
import { FaCross, FaMoneyBillWave } from "react-icons/fa";

import sgclogo1 from "../../assets/logoSGCwhite.png";
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
    SidebarToggle,
    StyledNavLink,
    Title,
} from "./styles";
import { LiaFileContractSolid } from "react-icons/lia";
import { TbReportAnalytics } from "react-icons/tb";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

export default function SidebarMenu({ isCollapsed = false }) {
    const [expandedItems, setExpandedItems] = useState({});

    const menuItems = [
        { name: "Home", icon: <MdDashboard size={20} />, path: "/home" },
        {
            name: "Sepultamento",
            icon: <FaCross size={20} />,
            children: [
                { name: "Falecido", icon: <PiFlowerTulip size={20} />, path: "/cadastros/falecido" },
                { name: "Cadastrar Sepultamento", icon: <FaCross size={20} />, path: "/cadastros/sepultamento" },
            ],
        },
        {
            name: "Sepulturas",
            icon: <GiGraveFlowers size={20} />,
            children: [
                { name: "Mapa", icon: <BsGrid3X3GapFill size={20} />, path: "/vermapa" },
                { name: "Cemitério", icon: <FaHouse size={20} />, path: "/sepulturas/cemiterio" },
                { name: "Ossário", icon: <RiArchiveDrawerFill size={20} />, path: "/sepulturas/ossario" },
            ],
        },
        { name: "Calendário", icon: <LuCalendarSearch size={20} />, path: "/calendario" },
        {
            name: "Registros Gerais", icon: <LuFileStack size={20} />, children: [
                { name: "Contratos", icon: <LiaFileContractSolid size={20} />, path: "/contratos" },
                { name: "Registros", icon: <GiArchiveRegister size={20} />, path: "/registros" },
                { name: "Relatórios", icon: <TbReportAnalytics size={20} />, path: "/relatorios" },
                { name: "Taxas", icon: <FaMoneyBillWave size={20} />, path: "/taxas" },
            ]
        },
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
