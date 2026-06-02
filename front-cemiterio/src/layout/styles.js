import styled from "styled-components";
import {createGlobalStyle} from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
  font-family:"Satoshi", sans-serif;
}`;

export const LayoutContainer = styled.div`
  display: flex;
  height: 100vh;
  overflow: hidden; 
`;

export const Content = styled.div`
  flex: 1;
  border-left:1px solid var(--app-border);
  display: flex;
  flex-direction: column;
  width:${({isSidebarOpen}) => (isSidebarOpen? 'calc(100% - 16rem)' : 'calc(100% - 5.5rem)')};
  margin-left:${({isSidebarOpen}) => (isSidebarOpen ? '16rem' : '5.5rem')};
  transition:width 0.3s ease, margin-left 0.3s ease;
  height:100vh;
`;

export const PageContent = styled.main`
  flex: 1;
  padding: 1rem;
  background-color: var(--app-bg);
  color:var(--app-text);
  overflow: auto;
`;

export const SidebarContainer = styled.div`
  width:${({isOpen}) => (isOpen ? '16rem' : '5.5rem')};
  height:100vh;
  background-color:var(--app-surface);
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
  display:flex;
  flex-direction:column;
  border-right: 0.5px solid var(--app-border);
  overflow: hidden;
  position:fixed;
  top:0;
  left:0;
  transition:width 0.3s ease;
  z-index:1000;
`;

export const SidebarExternalToggle = styled.button`
  position: fixed;
  top: 20rem;
  left: ${({ isOpen }) => (isOpen ? '16rem' : '5.5rem')};
  width: 2rem;
  height: 5.1rem;
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-left: none;
  border-radius: 0 5px 5px 0;
  background: linear-gradient(180deg, #191970 0%, #191970 100%);
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(13, 21, 87, 0.24);
  z-index: 1100;
  transition: left 0.3s ease, background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background: linear-gradient(180deg, #3a40c2 0%, #21268c 100%);
  }
`;

