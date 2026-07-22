import React, { useEffect, useMemo, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useCemeteryStore } from "../../../stores";
import {
    formatDateDMY,
    getCemiterioFoundation,
    getCemiterioId,
    getCemiterioName,
    isCemiterioActive,
} from "../../../utils";
import {
    CemeteryButton,
    CemeteryEmpty,
    CemeteryError,
    CemeteryItem,
    CemeteryMeta,
    CemeteryName,
    CemeteryPanel,
    CemeteryStatus,
    CemeterySwitcherRoot,
    CemeteryValue,
} from "./styles";

export default function CemeterySwitcher() {
    const cemeteries = useCemeteryStore((state) => state.cemeteries);
    const loading = useCemeteryStore((state) => state.loading);
    const error = useCemeteryStore((state) => state.error);
    const loadCemeteries = useCemeteryStore((state) => state.loadCemeteries);
    const selectedCemeteryId = useCemeteryStore((state) => state.selectedCemeteryId);
    const setSelectedCemeteryId = useCemeteryStore((state) => state.setSelectedCemeteryId);
    const [isOpen, setIsOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        loadCemeteries().catch((loadError) => {
            console.error("Erro ao carregar cemitérios", loadError);
        });
    }, [loadCemeteries]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (rootRef.current && !rootRef.current.contains(event.target)) setIsOpen(false);
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const selectedCemetery = useMemo(
        () =>
            cemeteries.find((cemetery) => String(getCemiterioId(cemetery)) === String(selectedCemeteryId)) ||
            cemeteries.find((cemetery) => isCemiterioActive(cemetery)) ||
            cemeteries[0] ||
            null,
        [cemeteries, selectedCemeteryId]
    );

    const selectedName = selectedCemetery
        ? getCemiterioName(selectedCemetery)
        : loading
          ? "Carregando cemitérios..."
          : "Selecione um cemitério";

    const handleSelect = (cemeteryId) => {
        setSelectedCemeteryId(cemeteryId);
        setIsOpen(false);
    };

    return (
        <CemeterySwitcherRoot ref={rootRef}>
            <CemeteryButton
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-expanded={isOpen}
                aria-haspopup="listbox"
            >
                <CemeteryValue>{selectedName}</CemeteryValue>
                {isOpen ? <FaChevronUp /> : <FaChevronDown />}
            </CemeteryButton>

            <CemeteryPanel $isOpen={isOpen} role="listbox" aria-label="Selecionar cemitério" aria-hidden={!isOpen}>
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
                                onClick={() => handleSelect(getCemiterioId(cemetery))}
                            >
                                <CemeteryMeta>
                                    <CemeteryName>{getCemiterioName(cemetery)}</CemeteryName>
                                    <span>
                                        Fundação: {formatDateDMY(getCemiterioFoundation(cemetery), "Não informada")}
                                    </span>
                                </CemeteryMeta>
                                <CemeteryStatus data-active={isCemiterioActive(cemetery)}>
                                    {isCemiterioActive(cemetery) ? "Ativo" : "Inativo"}
                                </CemeteryStatus>
                            </CemeteryItem>
                        );
                    })}
            </CemeteryPanel>
        </CemeterySwitcherRoot>
    );
}
