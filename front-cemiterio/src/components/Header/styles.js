import styled, { keyframes } from "styled-components";
import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
*{
  font-family:"Inter", sans-serif;
}
`;

const FadeInScale = keyframes`
  from{
  opacity: 0,
  transform: scale(0.94) translateY(-8px);
  }
  to{
  opacity:1;
  transform: scale(1) translateY(0);
  }
`;

export const HeaderContainer = styled.header`
  width: 100%;
  height: 60px;
  background-color: #ffffff;
  border-bottom: 1px solid rgba(25,25,112, 0.1);
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 1rem;
  padding: 0 1rem;
  position: relative;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const HeaderCenter = styled.div`
  display: flex;
  justify-content: center;
  position: relative;
`;

export const HeaderRight = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  position: relative;
`;

export const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #191970;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

export const CemeterySwitcher = styled.div`
  display: flex;
  justify-content: center;
  left:100px;
  align-items: center;
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  position: relative;
`;

export const CemeteryButton = styled.button`
  width: 100%;
  max-width: 300px;
  min-width: 220px;
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
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(25, 25, 112, 0.08);

  svg {
    flex-shrink: 0;
  }
`;

export const CemeteryPanel = styled.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 10;
  width: 50%;
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.12);
  border-radius: 14px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 1200;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? "scale(1) translateY(0)" : "scale(0.94) translateY(-8px)"};
  visibility: ${props => props.$isOpen ? "visible" : "hidden"};
  pointer-events: ${props => props.$isOpen ? "auto" : "none"};
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const CemeteryItem = styled.button`
  width: 100%;
  border: 0;
  background: #ffffff;
  color: #1d1d3f;
  padding: 0.75rem 0.875rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  text-align: left;
  cursor: pointer;
  border-bottom: 1px solid rgba(25, 25, 112, 0.08);

  &:last-child {
    border-bottom: 0;
  }

  &[data-selected="true"] {
    background: rgba(25, 25, 112, 0.06);
  }
`;

export const CemeteryMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  font-size: 0.8rem;

  span {
    color: #5a5a7a;
  }
`;

export const CemeteryName = styled.span`
  font-size: 0.9rem;
  font-weight: 700;
  color: #191970;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CemeteryStatus = styled.span`
  flex-shrink: 0;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  color: #191970;
  background: rgba(25, 25, 112, 0.08);

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

export const UserContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const UserAvatar = styled.div`
  width: 34px;
  height: 34px;
  border: 2px solid #191970;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: -5px;
  flex-shrink: 0;

  svg {
    font-size: 1.7rem;
  }
`;

export const UserName = styled.span`
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: none;
  color: #191970;
  max-width: 11.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserDropdown = styled.div`
  position: relative;
  min-width: 15rem;
`;

export const UserDropdownButton = styled.button`
  width: 90%;
  min-height: 42px;
  border: 1px solid rgba(25, 25, 112, 0.16);
  border-radius: 18px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%);
  color: #191970;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.2rem;
  padding: 0.35rem 0.65rem 0.35rem 0.35rem;
  cursor: pointer;
  box-shadow: 0 10px 24px rgba(25, 25, 112, 0.08);

  svg:last-child {
    flex-shrink: 0;
  }
`;

export const UserDropdownMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.55rem);
  right: 0;
  width: 100%;
  min-width: 18rem;
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.12);
  border-radius: 12px;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.12);
  overflow: hidden;
  z-index: 1300;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? "scale(1) translateY(0)" : "scale(0.94) translateY(-12px)"};
  visibility: ${props => props.$isOpen ? "visible" : "hidden"};
  pointer-events: ${props => props.$isOpen ? "auto" : "none"};
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
              visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const UserDropdownHeader = styled.div`
  padding: 0.95rem 1rem 0.8rem;
  border-bottom: 1px solid rgba(25, 25, 112, 0.08);
`;

export const UserDropdownName = styled.div`
  font-size: 0.95rem;
  font-weight: 800;
  color: #191970;
`;

export const UserDropdownNote = styled.div`
  margin-top: 0.2rem;
  font-size: 0.8rem;
  color: #6a6a86;
`;

export const UserAction = styled.button`
  width: 100%;
  border: 0;
  background: #ffffff;
  color: #191970;
  padding: 0.9rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-align: left;
  cursor: pointer;
  font-size: 0.92rem;
  font-weight: 700;

  svg {
    font-size: 1rem;
  }

  &:hover {
    background: rgba(25, 25, 112, 0.06);
  }
`;

export const UserDropdownFooter = styled.div`
  padding: 0.75rem 1rem;
  border-top: 1px solid rgba(25, 25, 112, 0.08);
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #767693;
`;