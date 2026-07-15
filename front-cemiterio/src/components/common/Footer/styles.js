import styled from "styled-components";

export const FooterWrapper = styled.footer`
    flex: 0 0 auto;
    min-height: 3.25rem;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.2rem;
    background-color: #ffffff;
    border-top: 1px solid #e5e7eb;
    padding: 0.35rem 1rem;
    text-align: center;
    position: static;
    z-index: 0;
    overflow: visible;
`;

export const FooterContainer = styled.ul`
    display: flex;
    justify-content: center;
    gap: 0.5rem;
    list-style: none;
    padding: 0;
    margin: 0;
    line-height: 1.2;

    a {
        text-decoration: none;
        color: #1f2937;

        &:hover {
            color: #191970;
        }
    }
`;

export const SubFooter = styled.div`
    font-size: 0.75rem;
    line-height: 1.2;
    color: #6b7280;
`;
