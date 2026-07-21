import React, { useEffect, useMemo, useRef, useState } from "react";
import { HiBars4 } from "react-icons/hi2";
import { FaRegUserCircle } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../../stores";
import NotificationsDropdown from "../NotificationsDropdown";
import {
    HeaderCenter,
    HeaderContainer,
    HeaderLeft,
    HeaderRight,
    MenuButton,
    UserAvatar,
    UserContainer,
    UserName,
    UserAction,
    UserDropdown,
    UserDropdownButton,
    UserDropdownFooter,
    UserDropdownHeader,
    UserDropdownMenu,
    UserDropdownName,
    UserDropdownNote,
} from "./styles";

export default function Header({ isSidebarOpen, onMenuClick }) {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const hydrated = useAuthStore((s) => s.hydrated);
    const logout = useAuthStore((s) => s.logout);
    const [photo, setPhoto] = useState(null);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const userDropdownRef = useRef(null);

    const handleLogout = () => {
        logout();
        setIsUserDropdownOpen(false);
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        const load = () => {
            const localPhoto = localStorage.getItem("userPhoto");
            const storePhoto = user?.photo || user?.avatar || null;
            setPhoto(localPhoto || storePhoto);
        };

        load();
        window.addEventListener("userPhotoUpdated", load);
        return () => window.removeEventListener("userPhotoUpdated", load);
    }, [user?.photo, user?.avatar]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
                setIsUserDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const displayName = useMemo(() => {
        if (!hydrated) return "Carregando...";
        return user?.name || user?.username || user?.email || "Usuário";
    }, [hydrated, user]);

    return (
        <HeaderContainer $isSidebarOpen={isSidebarOpen}>
            <HeaderLeft>
                <MenuButton
                    type="button"
                    onClick={onMenuClick}
                    aria-label={isSidebarOpen ? "Fechar menu lateral" : "Abrir menu lateral"}
                    aria-expanded={isSidebarOpen}
                >
                    <HiBars4 />
                </MenuButton>
            </HeaderLeft>

            <HeaderCenter />

            <HeaderRight ref={userDropdownRef}>
                <NotificationsDropdown />
                <UserDropdown>
                    <UserDropdownButton
                        type="button"
                        onClick={() => setIsUserDropdownOpen((prev) => !prev)}
                        aria-haspopup="menu"
                        aria-expanded={isUserDropdownOpen}
                    >
                        <UserContainer>
                            <UserAvatar>
                                {photo ? (
                                    <img
                                        src={photo}
                                        alt="avatar"
                                        style={{
                                            width: "100%",
                                            height: "100%",
                                            borderRadius: "50%",
                                            objectFit: "cover",
                                        }}
                                    />
                                ) : (
                                    <FaRegUserCircle />
                                )}
                            </UserAvatar>
                            <UserName>Bem vindo, {displayName}</UserName>
                        </UserContainer>
                    </UserDropdownButton>

                    <UserDropdownMenu
                        $isOpen={isUserDropdownOpen}
                        role="menu"
                        aria-label="Conta do usuário"
                        aria-hidden={!isUserDropdownOpen}
                    >
                        <UserDropdownHeader>
                            <UserDropdownName>{displayName}</UserDropdownName>
                            <UserDropdownNote>{user?.email || user?.username || "Conta ativa"}</UserDropdownNote>
                        </UserDropdownHeader>

                        <UserAction type="button" onClick={handleLogout} role="menuitem">
                            <FiLogOut />
                            <span>Sair</span>
                        </UserAction>
                    </UserDropdownMenu>
                </UserDropdown>
            </HeaderRight>
        </HeaderContainer>
    );
}
