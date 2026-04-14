import React, { useEffect, useState, useMemo } from "react";
import { HiBars4 } from "react-icons/hi2";
import { HeaderContainer, MenuButton, UserAvatar, UserContainer, UserName } from "./styles";
import { FaRegUserCircle } from "react-icons/fa";
import { useAuthStore } from "../../stores/authStore";
import { MdDarkMode } from "react-icons/md";
import { MdOutlineDarkMode } from "react-icons/md";

const PREF_KEY = "sgc-user-preferences";

export default function Header({ onMenuClick }) {
    const user = useAuthStore((s) => s.user);
    const hydrated = useAuthStore((s) => s.hydrated);

    const [photo, setPhoto] = useState(null);
    const [setTheme] = useState(
        () => document.body.getAttribute("data-theme") || "light"
    );

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
        const raw = localStorage.getItem(PREF_KEY);
        if (!raw) return;
        try {
            const parsed = JSON.parse(raw);
            const persistedTheme = parsed?.theme === "dark" ? "dark" : "light";
            setTheme(persistedTheme);
            document.body.setAttribute("data-theme", persistedTheme);
        } catch {
            //ignore
        }
    }, []);

    const displayName = useMemo(() => {
        if (!hydrated) return "Carregando...";
        return user?.name || user?.username || user?.email || "Usuário";
    }, [hydrated, user]);

    const toggleTheme = () => {
        const nextTheme = theme === "dark" ? "light" : "dark";
        setTheme(nextTheme);
        document.body.setAttribute("data-theme", nextTheme);
    
        let current = {};
        try {
            current = JSON.parse(localStorage.getItem(PREF_KEY) || "{}");
        } catch {
            current = {};
        }

        localStorage.setItem(
            PREF_KEY,
            JSON.stringify({
                ...current,
                theme: nextTheme,
            })
        );

    
        return (
            <HeaderContainer>
                <MenuButton type="button" onClick={onMenuClick}>
                    <HiBars4 />
                </MenuButton>
                <HeaderRight>
                    <ThemeButton type="button" onClick={toggleTheme} aria-label="Alternar tema">
                        {theme === "dark" ? <FaSun /> : <FaMoon />}
                        {theme === "dark" ? "Claro" : "Escuro"}
                    </ThemeButton>

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
                </HeaderRight>
            </HeaderContainer>

        )
    }
} 