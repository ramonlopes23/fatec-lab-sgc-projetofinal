import styled from "styled-components";
import { NavLink } from "react-router-dom";

export const LogoContainer = styled.div`
    padding: 1.15rem 1rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.45rem;
    position: relative;
    border-bottom: none;
    background: #191970;
    height: 7rem;
    box-sizing: border-box;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.08);
    overflow: hidden;

    &::after {
        content: "";
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 1px;
        background: #e5e7eb;
    }
`;

export const LogoImage = styled.img`
    width: ${({ $isCollapsed }) => ($isCollapsed ? "120px" : "220px")};
    height: ${({ $isCollapsed }) => ($isCollapsed ? "80px" : "112px")};
    object-fit: contain;
    margin-bottom: ${({ $isCollapsed }) => ($isCollapsed ? "-25px" : "-25px")};
`;

export const SidebarToggle = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.22);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
    color: #ffffff;
    cursor: pointer;
    flex: 0 0 auto;
    position: absolute;
    top: 1rem;
    right: 0.9rem;
    transition:
        background-color 0.2s ease,
        transform 0.2s ease;

    &:hover {
        background: rgba(255, 255, 255, 0.16);
    }

    svg {
        transition: transform 0.2s ease;
    }
`;

export const NavContainer = styled.nav`
    flex: 1;
    min-height: 0;
    margin-top: 1px;
    padding: 0.6rem 0.75rem 1rem;
    background: linear-gradient(180deg, #191970 0%, #18195d 100%);
    overflow-y: auto;
    overflow-x: hidden;

    overscroll-behavior: contain;
    scrollbar-gutter: stable;

    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.35) transparent;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: rgba(255, 255, 255, 0.35);
        border-radius: 999px;
        border: 2px solid transparent;
        background-clip: padding-box;
    }
`;

export const NavList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
`;

export const NavTitle = styled.h2`
    text-transform: uppercase;
    font-size: 0.75rem;
    color: #6b7280;
    margin-bottom: 0.5rem;
    margin-left: 2.5rem;
`;

export const Title = styled.h2`
    text-align: center;
    font-size: 10px;
    line-height: 1;
    letter-spacing: 2px;
    margin-top: -10px;
    color: #ffffff;
`;

export const NavItem = styled.li`
    margin: 0;
    width: 100%;
`;

export const MenuIconSlot = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.6rem;
    min-width: 1.6rem;
    height: 1.6rem;
    flex: 0 0 1.6rem;
`;

export const NestedList = styled.ul`
    list-style: none;
    padding: 0;
    font-size: 14px;
    margin: 0.45rem 0 0.2rem 0.75rem;
    overflow: hidden;
    max-height: ${(props) => (props.$isOpen ? "500px" : "0px")};
    opacity: ${(props) => (props.$isOpen ? 1 : 0)};
    transform: ${(props) => (props.$isOpen ? "translateY(0)" : "translateY(-6px)")};
    visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
    pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
    transition:
        max-height 320ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 220ms ease,
        transform 220ms ease,
        visibility 220ms ease;

    ${NavItem} {
        margin-bottom: 0.25rem;
    }
`;

export const StyledNavLink = styled(NavLink)`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-width: 0;
    min-height: 3.15rem;
    box-sizing: border-box;
    padding: 0.85rem 0.95rem;
    border-radius: 0.7rem;
    text-decoration: none;
    color: #fff;
    font-weight: 800;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition:
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
    align-self: stretch;
    position: relative;

    svg {
        flex: 0 0 auto;
    }

    &:hover {
        background-color: #2f18b4;
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateX(2px);
    }

    &.active {
        background-color: #2f18b4;
        border-color: rgba(255, 255, 255, 0.12);
        font-weight: 600;
        box-shadow: 0 10px 24px rgba(50, 107, 221, 0.28);
    }
`;

export const SidebarActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-width: 0;
    min-height: 3.15rem;
    box-sizing: border-box;
    padding: 0.85rem 0.95rem;
    border-radius: 0.7rem;
    text-decoration: none;
    color: #fff;
    font-weight: 800;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition:
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
    align-self: stretch;
    position: relative;
    justify-content: flex-start;
    cursor: pointer;
    font-size: inherit;
    font-family: inherit;
    text-align: left;
    appearance: none;
    -webkit-appearance: none;

    svg {
        flex: 0 0 auto;
    }

    &:hover {
        background-color: #2f18b4;
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateX(2px);
    }

    &:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.75);
        outline-offset: 2px;
    }
`;

export const DropdownToggle = styled.button`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    min-width: 0;
    min-height: 3.15rem;
    box-sizing: border-box;
    padding: 0.85rem 0.95rem;
    border-radius: 0.7rem;
    text-decoration: none;
    color: #fff;
    font-weight: 800;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    transition:
        background-color 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
    align-self: stretch;
    position: relative;
    justify-content: flex-start;
    border: 1px solid rgba(255, 255, 255, 0.08);
    cursor: pointer;
    font-size: inherit;
    font-family: inherit;
    text-align: left;
    appearance: none;
    -webkit-appearance: none;

    &:hover {
        background-color: #2f18b4;
        border-color: rgba(255, 255, 255, 0.12);
        transform: translateX(2px);
    }

    ${(props) =>
        props.isExpanded &&
        `
    background-color: #2f18b4;
    border-color: rgba(255, 255, 255, 0.12);
  `}

    &:focus-visible {
        outline: 2px solid rgba(255, 255, 255, 0.75);
        outline-offset: 2px;
    }
`;

export const ChevronIcon = styled.span`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    flex: 0 0 auto;
    transform: rotate(${({ $isOpen }) => ($isOpen ? "90deg" : "0deg")});
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const MenuLabel = styled.span`
    min-width: 0;
    flex: ${({ $isCollapsed }) => ($isCollapsed ? "0 0 0" : "1 1 auto")};
    white-space: normal;
    overflow: hidden;
    overflow-wrap: anywhere;
    word-break: normal;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    transition:
        opacity 0.2s ease,
        width 0.2s ease,
        margin 0.2s ease;
    width: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "100%")};
    opacity: ${({ $isCollapsed }) => ($isCollapsed ? 0 : 1)};
    pointer-events: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "auto")};
`;

export const CollapsedNavLink = styled(StyledNavLink)`
    justify-content: flex-start;
    padding: 0.85rem 0.95rem;

    ${ChevronIcon} {
        display: flex;
    }

    ${MenuLabel} {
        display: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "-webkit-box")};
    }
`;

export const CollapsedToggle = styled(DropdownToggle)`
    justify-content: flex-start;
    padding: 0.85rem 0.95rem;

    ${ChevronIcon} {
        display: flex;
        margin-left: auto;
        position: static;
    }

    ${MenuLabel} {
        display: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "-webkit-box")};
    }
`;

export const CompactNestedList = styled(NestedList)`
    display: block;
    position: relative;
    width: ${({ $isCollapsed }) => ($isCollapsed ? "100%" : "calc(100% - 0.75rem)")};
    margin: ${({ $isCollapsed, $isOpen }) =>
        $isOpen ? ($isCollapsed ? "0.35rem 0 0.15rem" : "0.35rem 0 0.15rem 0.75rem") : "0"};
    padding-left: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "0.75rem")};
    box-sizing: border-box;
    border-left: 1px solid ${({ $isCollapsed }) => ($isCollapsed ? "transparent" : "rgba(255, 255, 255, 0.18)")};
    transition:
        max-height 320ms cubic-bezier(0.4, 0, 0.2, 1),
        opacity 220ms ease,
        transform 220ms ease,
        visibility 220ms ease,
        padding-left 220ms ease,
        margin 320ms cubic-bezier(0.4, 0, 0.2, 1);

    ${NavItem} {
        margin-bottom: 0.25rem;
    }
`;

export const CompactChildLink = styled(StyledNavLink)`
    min-height: 2.8rem;
    padding: 0.72rem 0.85rem;
    font-weight: 700;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    justify-content: ${({ $isCollapsed }) => ($isCollapsed ? "center" : "flex-start")};
    gap: ${({ $isCollapsed }) => ($isCollapsed ? "0" : "0.65rem")};

    &:hover,
    &.active {
        background-color: #2f18b4;
        border-color: rgba(255, 255, 255, 0.12);
    }

    ${MenuLabel} {
        display: ${({ $isCollapsed }) => ($isCollapsed ? "none" : "-webkit-box")};
    }
`;
