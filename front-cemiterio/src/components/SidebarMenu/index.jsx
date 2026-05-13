import React, { useState } from "react";
import { MdDashboard } from "react-icons/md";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { GiArchiveRegister, GiGraveFlowers } from "react-icons/gi";
import { PiFlowerTulip } from "react-icons/pi";
import { LuCalendarSearch, LuFileStack, LuChevronDown } from "react-icons/lu";
import sgclogo1 from "../../assets/SGCv2.png";
import {
    GlobalStyle,
    LogoContainer,
    LogoImage,
    NavContainer,
    NavItem,
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
        { name: "HOME", icon: <MdDashboard size={20} />, path: "/home" },
        {
            name: "CADASTROS",
            icon: <GiArchiveRegister size={25} />,
            path: "/cadastros",
            children: [
                { name: "FALECIDO", icon: <PiFlowerTulip size={25}/> , path: "/cadastros/falecido" },
                { name: "SEPULTAMENTO", icon: <GiGraveFlowers size={25}/>, path: "/cadastros/sepultamento" },
            ],
        },
        { name: "SEPULTURAS", icon: <BsGrid3X3GapFill size={20} />, path: "/vermapa" },
        { name: "CALENDARIO", icon: <LuCalendarSearch size={20} />, path: "/calendario" },
        { name: "REGISTROS GERAIS", icon: <LuFileStack size={20} />, path: "/processselection" },
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
                <Title>SISTEMA DE GERENCIAMENTO DE CEMITERIOS</Title>
            </LogoContainer>

            <NavContainer>
                <NavTitle>Menu</NavTitle>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
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

                            {item.children && expandedItems[item.name] && (
                                <NestedList>
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
                </ul>
            </NavContainer>
        </>
    );
}
