import styled, { keyframes } from "styled-components";

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
    width: auto;
    height: 60px;
    flex-shrink: 0;
    background-color: #ffffff;
    border-bottom: 1px solid rgba(25, 25, 112, 0.1);
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 300px) minmax(0, 1fr);
    align-items: center;
    gap: 1rem;
    padding: 0 1rem;
    position: fixed;
    top: 0;
    right: 0;
    left: ${({ $isSidebarOpen }) => ($isSidebarOpen ? "16rem" : "5.5rem")};
    z-index: 950;
    transition: left 0.3s ease;

    @media (max-width: 900px) {
        left: 0;
        gap: 0.5rem;
        padding: 0 0.75rem;
    }

    @media (max-width: 600px) {
        grid-template-columns: auto minmax(0, 1fr) auto;
    }
`;

export const HeaderLeft = styled.div`
    display: flex;
    align-items: center;

    @media (max-width: 900px) {
        display: flex;
    }
`;

export const HeaderCenter = styled.div`
    display: flex;
    width: 100%;
    min-width: 0;
    justify-content: center;
    position: relative;
`;

export const HeaderRight = styled.div`
    display: flex;
    min-width: 0;
    justify-content: flex-end;
    align-items: center;
    gap: 0.75rem;
    position: relative;

    @media (max-width: 620px) {
        gap: 0.35rem;
    }
`;

export const MenuButton = styled.button`
    background: none;
    border: none;
    font-size: 1.5rem;
    color: #191970;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    padding: 0;
    border-radius: 10px;

    &:focus-visible {
        outline: 2px solid #191970;
        outline-offset: 2px;
    }

    @media (max-width: 900px) {
        display: flex;
    }
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

    @media (max-width: 1100px) {
        display: none;
    }
`;

export const UserDropdown = styled.div`
    position: relative;
    min-width: 15rem;

    @media (max-width: 1100px) {
        min-width: 0;
    }
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

    @media (max-width: 720px) {
        width: auto;
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
    opacity: ${(props) => (props.$isOpen ? 1 : 0)};
    transform: ${(props) => (props.$isOpen ? "scale(1) translateY(0)" : "scale(0.94) translateY(-12px)")};
    visibility: ${(props) => (props.$isOpen ? "visible" : "hidden")};
    pointer-events: ${(props) => (props.$isOpen ? "auto" : "none")};
    transition:
        opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
        visibility 0.25s cubic-bezier(0.4, 0, 0.2, 1);

    @media (max-width: 720px) {
        position: fixed;
        top: 68px;
        right: 0.75rem;
        width: min(18rem, calc(100vw - 1.5rem));
        min-width: 0;
    }
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
