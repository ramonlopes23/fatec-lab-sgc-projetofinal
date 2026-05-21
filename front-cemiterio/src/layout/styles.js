import styled from "styled-components";
import {createGlobalStyle} from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
  font-family:"Inter", sans-serif;
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
  width:${({isSidebarOpen}) => (isSidebarOpen? 'calc(100% - 16rem)' : '100%')};
  margin-left:${({isSidebarOpen}) => (isSidebarOpen ? '16rem' : '0')};
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
  width:16rem;
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
  transform:${({isOpen})=> (isOpen ?"translate(0)":"translate(-100%)")};
  transition:transform 0.3s ease;
  z-index:1000;
`;

