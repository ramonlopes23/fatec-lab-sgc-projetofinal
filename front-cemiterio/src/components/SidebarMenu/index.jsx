import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { GiGraveFlowers } from "react-icons/gi";
import { PiFlowerTulip } from "react-icons/pi";
import { AiFillFolderAdd } from "react-icons/ai";
import { FaHouse } from "react-icons/fa6";
import { RiArchiveDrawerFill } from "react-icons/ri";
import { LuCalendarSearch, LuFileStack, LuChevronDown } from "react-icons/lu";
import { FaCross, FaMoneyBillWave } from "react-icons/fa";

import sgclogo1 from "../../assets/logoSGCwhite.png";
import {
    GlobalStyle,
    LogoContainer,
    LogoImage,
    NavContainer,
    NavItem,
    NavList,
    NavTitle,
    NestedList,
    StyledNavLink,
    DropdownToggle,
    ChevronIcon,
    Title,
} from "./styles";

export default function SidebarMenu() {
    const [expandedItems, setExpandedItems] = useState({});

    const menuItems = [
        { name: "Home", icon: <MdDashboard size={20} />, path: "/home" },
        {
            name: "Sepultamento",
            icon: <FaCross size={20} />,
            path: "/cadastros",
            children: [
                { name: "Falecido", icon: <PiFlowerTulip size={20} />, path: "/cadastros/falecido" },
                { name: "Cadastrar Sepultamento", icon: <FaCross size={20} />, path: "/cadastros/sepultamento" },

            ],
        },
        {
            name: "Sepulturas",
            icon: <GiGraveFlowers size={20} />,
            path: "/sepulturas",
            children: [
                { name: "Mapa", icon: <BsGrid3X3GapFill size={20} />, path: "/vermapa" },
                { name: "Cemitério", icon: <FaHouse size={20} />, path: "/sepulturas/cemiterio" },
                { name: "Ossário", icon: <RiArchiveDrawerFill size={20} />, path: "/sepulturas/ossario" },
            ],
        },
        { name: "Calendário", icon: <LuCalendarSearch size={20} />, path: "/calendario" },
        { name: "Registros Gerais", icon: <LuFileStack size={20} />, path: "/processselection" },
        { name: "Taxas", icon: <FaMoneyBillWave size={20} />, path: "/cadastros/taxas" },
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
                <LogoImage src={sgclogo1} alt="Logo Memo" />
                <Title>SISTEMA DE GERENCIAMENTO DE CEMITÉRIOS</Title>
            </LogoContainer>

            <NavContainer>
                <NavList>
                    {menuItems.map((item) => (
                        <NavItem key={item.name}>
                            {item.children ? (
                                <DropdownToggle
                                    onClick={() => toggleExpanded(item.name)}
                                    isExpanded={expandedItems[item.name]}
                                >
                                    {item.icon}
                                    <span>{item.name}</span>
                                    <ChevronIcon isExpanded={expandedItems[item.name]}>
                                        <LuChevronDown size={18} />
                                    </ChevronIcon>
                                </DropdownToggle>
                            ) : (
                                <StyledNavLink to={item.path}>
                                    {item.icon} {item.name}
                                </StyledNavLink>
                            )}

                            {item.children && (
                                <NestedList $isOpen={!!expandedItems[item.name]}>
                                    {item.children.map((child) => (
                                        <NavItem key={child.name}>
                                            <StyledNavLink to={child.path}>
                                                {child.icon} {child.name}
                                            </StyledNavLink>
                                        </NavItem>
                                    ))}
                                </NestedList>
                            )}
                        </NavItem>
                    ))}
                </NavList>
            </NavContainer>
        </>
    );
}
