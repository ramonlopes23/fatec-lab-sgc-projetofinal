import React from "react";
import { NavLink } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { GrNotes } from "react-icons/gr";
import { GiArchiveRegister } from "react-icons/gi";
import { LuCalendarSearch, LuFileSearch2 } from "react-icons/lu";
import { FaCog } from "react-icons/fa";
import { ImProfile } from "react-icons/im";
import { LuFileStack } from "react-icons/lu";
import { LogoContainer, LogoImage, NavContainer, NavItem, NavTitle, StyledNavLink, GlobalStyle } from "./styles";
import sgclogo1 from "../../assets/SGCv2.png";
import { Title } from "./styles"


export default function SidebarMenu() {

    const menuItems = [
        { name: "HOME", icon: <MdDashboard size={20} />, path: "/Home" },
        { name: "CADASTROS", icon: <GiArchiveRegister size={25} />, path: "/Cadastros" },        
        { name: "SEPULTURAS", icon: <BsGrid3X3GapFill size={20} />, path: "/VerMapa" },
        { name: "CALENDÁRIO", icon: <LuCalendarSearch size={20} />, path: "/Calendario" },
        { name: "REGISTROS GERAIS", icon: <LuFileStack size={20} />, path: "/ProcessSelection" },
        { name: "CONFIGURAÇÃO", icon: <FaCog size={20} />, path: "/Configurar" },
    ];

    return (
        <>
            <GlobalStyle />
            <LogoContainer>
                <LogoImage src={sgclogo1} alt="Logo Memo" />
                <Title>SISTEMA DE GERENCIAMENTO DE CEMITÉRIOS</Title>
            </LogoContainer>

            <NavContainer>
                <NavTitle>Menu</NavTitle>
                <ul style={{ listStyle: "none" }}>
                    {menuItems.map(item => (
                        <NavItem key={item.name}>
                            <StyledNavLink to={item.path}>

                                {item.icon} {item.name}
                            </StyledNavLink>
                        </NavItem>
                    ))}
                </ul>
            </NavContainer>
        </>
    )
} 
