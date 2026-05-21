import styled from "styled-components";
import { NavLink } from "react-router-dom";
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
  font-family:"Inter", sans-serif;
}`;


export const LogoContainer = styled.div`
  padding: 1.15rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  border-bottom: none;
  background: #191970;

  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background: #e5e7eb;
  }
`;

export const LogoImage = styled.img`
  width:300px;
  height: 150px;
  object-fit: contain;
  margin-bottom:-25px;
`;


export const NavContainer = styled.nav`
  flex: 1;
  min-height: 0;
  padding: 0.5rem 0.75rem 1rem;
  background: #191970;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;

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
  gap: 0.25rem;
`;

export const NavTitle = styled.h2`
text-transform:uppercase;
font-size:0.75rem;
font-family:"Inter", sans-serif;
color:#6b7280;
margin-bottom:0.5rem;
margin-left:2.5rem;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 10px;
  line-height: 1.35;
  letter-spacing: 2px;
  margin: 0;
  color: #ffffff;
`;


export const NavItem = styled.li`
  margin: 0;
  width: 100%;
`;

export const NestedList = styled.ul`
  list-style: none;
  padding: 0;
  font-size:14px;
  margin: 0.35rem 0 0.2rem 0.75rem;
  overflow: hidden;
  max-height: ${props => (props.$isOpen ? "500px" : "0px")};
  opacity: ${props => (props.$isOpen ? 1 : 0)};
  transform: ${props => (props.$isOpen ? "translateY(0)" : "translateY(-6px)")};
  visibility: ${props => (props.$isOpen ? "visible" : "hidden")};
  pointer-events: ${props => (props.$isOpen ? "auto" : "none")};
  transition: max-height 320ms cubic-bezier(0.4, 0, 0.2, 1), opacity 220ms ease, transform 220ms ease, visibility 220ms ease;

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
  box-sizing: border-box;
  padding: 0.82rem 0.95rem;
  border-radius: 0.7rem;
  text-decoration: none;
  color: #fff;
  font-weight: 800;
  transition: background-color 0.2s ease, color 0.2s ease;
  align-self: stretch;

  &:hover {
    background-color: #326bdd;
  }

  &.active {
    background-color: #326bdd;
    font-weight: 600;
  }
`;

export const DropdownToggle = styled(StyledNavLink).attrs({ as: "button" })`
  justify-content: flex-start;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: inherit;
  font-family: inherit;
  text-align: left;
  appearance: none;
  -webkit-appearance: none;
  width: 100%;
  min-width: 0;
  align-self: stretch;

  &:hover {
    background-color: #326bdd;
  }

  ${props => props.isExpanded && `
    background-color: #326bdd;
  `}
`;

export const ChevronIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  transition: transform 0.3s ease;
  ${props => props.isExpanded && `
    transform: rotate(180deg);
  `}
`;
