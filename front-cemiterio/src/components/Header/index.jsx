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

    const displayName = useMemo(() => {
        if (!hydrated) return "Carregando...";
        return user?.name || user?.username || user?.email || "Usuário";
    }, [hydrated, user]);
    
        return (
            <HeaderContainer>
                <MenuButton type="button" onClick={onMenuClick}>
                    <HiBars4 />
                </MenuButton>
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
            </HeaderContainer>

        )
    }
