import styled from "styled-components";

export const CemeterySwitcherRoot = styled.div`
    position: relative;
    width: 100%;
    max-width: 300px;
    min-width: 0;
    margin: 0 auto;
`;

export const CemeteryButton = styled.button`
    width: 100%;
    min-width: 0;
    min-height: 40px;
    border: 1px solid rgba(25, 25, 112, 0.16);
    border-radius: 12px;
    background: linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%);
    color: #191970;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.5rem 0.875rem;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    box-shadow: 0 10px 24px rgba(25, 25, 112, 0.08);

    svg {
        flex: 0 0 auto;
    }

    &:focus-visible {
        outline: 2px solid #191970;
        outline-offset: 2px;
    }
`;

export const CemeteryValue = styled.span`
    min-width: 0;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const CemeteryPanel = styled.div`
    position: absolute;
    top: calc(100% + 0.5rem);
    left: 50%;
    width: min(360px, calc(100vw - 2rem));
    background: #ffffff;
    border: 1px solid rgba(25, 25, 112, 0.12);
    border-radius: 14px;
    box-shadow: 0 18px 42px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    z-index: 1200;
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
    pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
    transform: ${({ $isOpen }) =>
        $isOpen ? "translateX(-50%) scale(1) translateY(0)" : "translateX(-50%) scale(0.94) translateY(-8px)"};
    transition:
        opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    @media (max-width: 720px) {
        position: fixed;
        top: 4.25rem;
        right: 0.75rem;
        left: 0.75rem;
        width: auto;
        transform: ${({ $isOpen }) => ($isOpen ? "scale(1) translateY(0)" : "scale(0.94) translateY(-8px)")};
    }
`;

export const CemeteryItem = styled.button`
    width: 100%;
    border: 0;
    border-bottom: 1px solid rgba(25, 25, 112, 0.08);
    background: #ffffff;
    color: #1d1d3f;
    padding: 0.75rem 0.875rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    text-align: left;
    cursor: pointer;

    &:last-child {
        border-bottom: 0;
    }

    &:hover,
    &[data-selected="true"] {
        background: rgba(25, 25, 112, 0.06);
    }

    &:focus-visible {
        outline: 2px solid #191970;
        outline-offset: -2px;
    }
`;

export const CemeteryMeta = styled.span`
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.2rem;
    font-size: 0.8rem;

    span {
        overflow: hidden;
        color: #5a5a7a;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const CemeteryName = styled.strong`
    overflow: hidden;
    color: #191970;
    font-size: 0.9rem;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const CemeteryStatus = styled.span`
    flex: 0 0 auto;
    padding: 0.3rem 0.55rem;
    border-radius: 999px;
    background: rgba(25, 25, 112, 0.08);
    color: #191970;
    font-size: 0.72rem;
    font-weight: 700;

    &[data-active="false"] {
        color: #7c3b3b;
        background: rgba(197, 85, 85, 0.12);
    }
`;

export const CemeteryEmpty = styled.div`
    padding: 0.8rem 0.875rem;
    color: #5a5a7a;
    font-size: 0.85rem;
`;

export const CemeteryError = styled(CemeteryEmpty)`
    color: #c55;
`;
