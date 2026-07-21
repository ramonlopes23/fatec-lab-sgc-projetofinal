import styled from "styled-components";

export const CemeterySwitcherRoot = styled.div`
    position: relative;
    flex: 0 0 auto;
    padding: 0.6rem 0.75rem 0.35rem;
    background: #191970;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.08);
`;

export const CemeteryButton = styled.button`
    width: 100%;
    min-width: 0;
    min-height: 3.15rem;
    box-sizing: border-box;
    padding: ${({ $isCollapsed }) => ($isCollapsed ? "0.75rem" : "0.75rem 0.95rem")};
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.7rem;
    background: ${({ $isCollapsed }) => ($isCollapsed ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.08)")};
    color: #ffffff;
    display: flex;
    align-items: center;
    justify-content: ${({ $isCollapsed }) => ($isCollapsed ? "center" : "flex-start")};
    gap: 0.7rem;
    font: inherit;
    font-weight: 800;
    cursor: pointer;
    transition:
        background-color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;

    &:hover {
        background: #326bdd;
        border-color: rgba(255, 255, 255, 0.12);
        transform: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "translateX(2px)")};
    }

    &:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.8);
        outline-offset: 2px;
    }
`;

export const CemeteryIcon = styled.span`
    width: 1.6rem;
    height: 1.6rem;
    flex: 0 0 1.6rem;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    svg {
        font-size: 1.1rem;
    }
`;

export const CemeteryValue = styled.span`
    display: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "block")};
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-align: left;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const CemeteryChevron = styled.span`
    display: inline-flex;
    flex: 0 0 auto;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    transform: rotate(${({ $isOpen }) => ($isOpen ? "90deg" : "0deg")});
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const CemeteryNestedList = styled.div`
    width: calc(100% - 0.75rem);
    max-height: ${({ $isOpen }) => ($isOpen ? "16rem" : "0")};
    margin: ${({ $isOpen }) => ($isOpen ? "0.4rem 0 0.15rem 0.75rem" : "0 0 0 0.75rem")};
    padding-left: 0.75rem;
    box-sizing: border-box;
    border-left: 1px solid rgba(255, 255, 255, 0.18);
    overflow: hidden;
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
    pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
    transform: translateY(${({ $isOpen }) => ($isOpen ? "0" : "-0.35rem")});
    transition:
        max-height 320ms cubic-bezier(0.4, 0, 0.2, 1),
        margin 320ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 220ms ease,
        transform 220ms ease,
        visibility 220ms ease;
`;

export const CemeteryItem = styled.button`
    width: 100%;
    min-width: 0;
    min-height: 3.4rem;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 0.65rem;
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    padding: 0.65rem 0.7rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.55rem;
    text-align: left;
    cursor: pointer;
    transition:
        background-color 0.2s ease,
        border-color 0.2s ease;

    & + & {
        margin-top: 0.3rem;
    }

    &:hover,
    &[data-selected="true"] {
        background: #326bdd;
        border-color: rgba(255, 255, 255, 0.14);
    }

    &:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.75);
        outline-offset: 2px;
    }
`;

export const CemeteryMeta = styled.span`
    min-width: 0;
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.15rem;
    font-size: 0.72rem;

    span {
        overflow: hidden;
        color: rgba(255, 255, 255, 0.7);
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const CemeteryName = styled.strong`
    overflow: hidden;
    color: #ffffff;
    font-size: 0.8rem;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const CemeteryStatus = styled.span`
    flex: 0 0 auto;
    padding: 0.25rem 0.4rem;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.14);
    color: #ffffff;
    font-size: 0.64rem;
    font-weight: 700;

    &[data-active="false"] {
        color: #ffd4d4;
        background: rgba(197, 85, 85, 0.24);
    }
`;

export const CemeteryEmpty = styled.div`
    padding: 0.7rem;
    border-radius: 0.65rem;
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.72);
    font-size: 0.75rem;
`;

export const CemeteryError = styled(CemeteryEmpty)`
    color: #ffd4d4;
`;
