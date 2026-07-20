import styled from "styled-components";

export const SituationBody = styled.div`
    display: flex;
    flex-direction: column;
    min-height: 295px;
`;

export const SituationGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.7rem;
    margin: auto 0;

    @media (max-width: 620px) {
        grid-template-columns: 1fr;
    }
`;

export const StatCard = styled.article`
    display: flex;
    align-items: center;
    gap: 0.7rem;
    min-width: 0;
    min-height: 92px;
    padding: 0.75rem;
    border: 1px solid var(--app-border);
    border-radius: 12px;
    background: linear-gradient(180deg, var(--app-surface) 0%, rgba(25, 25, 112, 0.025) 100%);
    box-sizing: border-box;
`;

export const StatIcon = styled.div`
    display: grid;
    place-items: center;
    flex: 0 0 52px;
    width: 52px;
    height: 52px;
    border-radius: 36px;
    color: #191970;
    background: ${({ $tone }) => {
        if ($tone === "success") return "linear-gradient(135deg, #6c6c8a 0%, rgba(185, 214, 196, 0.08) 100%)";
        return "linear-gradient(135deg, rgba(74,47,227,0.18) 0%, rgba(74,47,227,0.08) 100%)";
    }};
    font-size: 1.2rem;
`;

export const StatCopy = styled.div`
    display: flex;
    flex-direction: column;
    min-width: 0;
`;

export const StatValue = styled.strong`
    overflow: hidden;
    color: var(--app-text);
    font-size: clamp(1.35rem, 2vw, 1.75rem);
    font-weight: 800;
    line-height: 1.05;
    text-overflow: ellipsis;
`;

export const StatLabel = styled.span`
    margin-top: 0.2rem;
    color: var(--app-muted);
    font-size: 0.74rem;
    font-weight: 650;
`;

export const SituationHint = styled.p`
    margin: 0.8rem 0 0;
    color: var(--app-muted);
    font-size: 0.75rem;
    text-align: center;
`;

export const GraveFooter = styled.footer`
    display: flex;
    justify-content: center;
    margin-top: auto;
    padding-top: 0.8rem;
    border-top: 1px solid var(--app-border);
`;

export const EmptyState = styled.div`
    display: grid;
    place-items: center;
    flex: 1;
    min-height: 180px;
    border: 1px dashed rgba(25, 25, 112, 0.2);
    border-radius: 10px;
    background: rgba(25, 25, 112, 0.025);
    color: var(--app-muted);
    text-align: center;
    font-size: 0.88rem;
`;
