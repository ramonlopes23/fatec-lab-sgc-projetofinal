import React, { useEffect, useMemo, useRef, useState } from "react";
import { HiBars4 } from "react-icons/hi2";
import { FaChevronDown, FaRegUserCircle, FaChevronUp } from "react-icons/fa";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuthStore, useCemeteryStore } from "../../../stores";
import {
    formatDateDMY,
    getCemiterioFoundation,
    getCemiterioId,
    getCemiterioName,
    isCemiterioActive,
} from "../../../utils";
import NotificationsDropdown from "../NotificationsDropdown";
import {
    CemeteryButton,
    CemeteryEmpty,
    CemeteryError,
    CemeteryItem,
    CemeteryMeta,
    CemeteryName,
    CemeteryPanel,
    CemeterySwitcher,
    CemeteryStatus,
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

export default function Header({ isSidebarOpen }) {
    const navigate = useNavigate();
    const user = useAuthStore((s) => s.user);
    const hydrated = useAuthStore((s) => s.hydrated);
    const logout = useAuthStore((s) => s.logout);
    const cemeteries = useCemeteryStore((s) => s.cemeteries);
    const loading = useCemeteryStore((s) => s.loading);
    const error = useCemeteryStore((s) => s.error);
    const loadCemeteries = useCemeteryStore((s) => s.loadCemeteries);
    const selectedCemeteryId = useCemeteryStore((s) => s.selectedCemeteryId);
    const setSelectedCemeteryId = useCemeteryStore((s) => s.setSelectedCemeteryId);

    const [photo, setPhoto] = useState(null);
    const [isCemeteryDropdownOpen, setIsCemeteryDropdownOpen] = useState(false);
    const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
    const cemeteryDropdownRef = useRef(null);
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
        loadCemeteries().catch((err) => {
            console.error("Erro ao carregar cemitérios", err);
        });
    }, [loadCemeteries]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cemeteryDropdownRef.current && !cemeteryDropdownRef.current.contains(event.target)) {
                setIsCemeteryDropdownOpen(false);
            }

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

    const selectedCemetery = useMemo(() => {
        return (
            cemeteries.find((cemetery) => String(getCemiterioId(cemetery)) === String(selectedCemeteryId)) ||
            cemeteries.find((cemetery) => isCemiterioActive(cemetery)) ||
            cemeteries[0] ||
            null
        );
    }, [cemeteries, selectedCemeteryId]);

    const handleSelectCemetery = (cemeteryId) => {
        setSelectedCemeteryId(cemeteryId);
        setIsCemeteryDropdownOpen(false);
    };

    return (
        <HeaderContainer $isSidebarOpen={isSidebarOpen}>
            <HeaderLeft></HeaderLeft>

            <HeaderCenter ref={cemeteryDropdownRef}>
                <CemeterySwitcher>
                    <CemeteryButton
                        type="button"
                        onClick={() => setIsCemeteryDropdownOpen((prev) => !prev)}
                        aria-expanded={isCemeteryDropdownOpen}
                        aria-haspopup="listbox"
                    >
                        <span>
                            {selectedCemetery
                                ? getCemiterioName(selectedCemetery)
                                : loading
                                  ? "Carregando cemitérios..."
                                  : "Selecione um cemitério"}
                        </span>
                        {isCemeteryDropdownOpen && selectedCemeteryId ? <FaChevronUp /> : <FaChevronDown />}{" "}
                    </CemeteryButton>

                    <CemeteryPanel
                        $isOpen={isCemeteryDropdownOpen}
                        role="listbox"
                        aria-label="Selecionar cemitério"
                        aria-hidden={!isCemeteryDropdownOpen}
                    >
                        {loading && <CemeteryEmpty>Carregando cemitérios...</CemeteryEmpty>}
                        {!loading && error && <CemeteryError>{error}</CemeteryError>}
                        {!loading && !error && cemeteries.length === 0 && (
                            <CemeteryEmpty>Nenhum cemitério cadastrado.</CemeteryEmpty>
                        )}

                        {!loading &&
                            !error &&
                            cemeteries.map((cemetery) => {
                                const isSelected = String(getCemiterioId(cemetery)) === String(selectedCemeteryId);

                                return (
                                    <CemeteryItem
                                        key={getCemiterioId(cemetery)}
                                        type="button"
                                        role="option"
                                        aria-selected={isSelected}
                                        data-selected={isSelected}
                                        onClick={() => handleSelectCemetery(getCemiterioId(cemetery))}
                                    >
                                        <CemeteryMeta>
                                            <CemeteryName>{getCemiterioName(cemetery)}</CemeteryName>
                                            <span>
                                                Fundação:{" "}
                                                {formatDateDMY(
                                                    getCemiterioFoundation(cemetery),
                                                    getCemiterioFoundation(cemetery)
                                                )}
                                            </span>
                                        </CemeteryMeta>
                                        <CemeteryStatus data-active={isCemiterioActive(cemetery)}>
                                            {isCemiterioActive(cemetery) ? "Ativo" : "Inativo"}
                                        </CemeteryStatus>
                                    </CemeteryItem>
                                );
                            })}
                    </CemeteryPanel>
                </CemeterySwitcher>
            </HeaderCenter>

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
