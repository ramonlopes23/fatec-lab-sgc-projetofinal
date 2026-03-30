import styled from "styled-components";
import { NavLink } from "react-router-dom";
import {createGlobalStyle} from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
font-family:"Inter", sans-serif;
}`;


export const LogoContainer = styled.div`
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  border-bottom: none;         
  margin-bottom: 12px;        
  &::after {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    bottom: -20px;            
    height: 2px;
    background: #e5e7eb;
  }
`;

export const LogoImage = styled.img`
width:400px; 
margin-bottom:-60px;
height:auto;
object-fit:contain;
`;


export const NavContainer = styled.nav`
flex:1;
padding:1rem;
`;

export const NavTitle = styled.h2`
text-transform:uppercase;
font-size:0.75rem;
font-family:"Inter", sans-serif;
color:#6b7280;
margin-bottom:0.5rem;
margin-left:2.5rem;
margin-top:20px;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 10px;
  letter-spacing: 2px;
  margin-bottom:-25px;
  margin-top:-0px;
  color: #191970;
`;


export const NavItem = styled.li`
  margin-bottom: 0.7rem;
`;

export const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  gap: 0.55 rem;
  padding: 0.5rem 0rem;
  border-radius: 0.375rem;
  text-decoration: none;
  color: #191970;
  font-weight: 800;

  &:hover {
    background-color: #f3f4f6;
  }

  &.active {
    background-color: #e5e7eb;
    font-weight: 600;
  }
`;