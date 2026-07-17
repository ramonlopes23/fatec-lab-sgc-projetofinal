import styled from "styled-components";

export const DashboardWrapper = styled.section`
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 1rem;
    box-sizing: border-box;
`;

export const DashboardGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    align-items: stretch;

    @media (max-width: 1100px) {
        grid-template-columns: 1fr;
    }
`;

export const DashboardCard = styled.article`
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 0;
    overflow: hidden;
    border: 1px solid var(--app-border);
    border-radius: 14px;
    background: var(--app-surface);
    box-shadow: 0 8px 24px rgba(25, 25, 112, 0.06);
`;

export const DashboardCardHeader = styled.header`
    display: flex;
    align-items: center;
    gap: 0.65rem;
    min-height: 58px;
    padding: 0 1.25rem;
    border-bottom: 1px solid var(--app-border);
`;

export const DashboardCardTitle = styled.h2`
    margin: 0;
    color: var(--app-text);
    font-size: 1.05rem;
    font-weight: 750;
    letter-spacing: -0.015em;
`;

export const DashboardCardBody = styled.div`
    flex: 1;
    padding: 0.9rem 1.25rem 1.15rem;
`;
