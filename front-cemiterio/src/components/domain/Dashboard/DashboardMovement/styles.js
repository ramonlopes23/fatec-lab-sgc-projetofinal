import styled from "styled-components";

export const HeaderContent = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    width: 100%;

    @media (max-width: 520px) {
        align-items: flex-start;
        flex-direction: column;
        padding: 0.8rem 0;
    }
`;

export const HeaderLabel = styled.div`
    display: flex;
    align-items: center;
    gap: 0.65rem;
`;

export const PeriodControl = styled.label`
    display: flex;
    align-items: center;
    gap: 0.55rem;
    color: var(--app-muted);
    font-size: 0.75rem;
    font-weight: 700;

    > div {
        width: 150px;
    }
`;

export const Summary = styled.div`
    display: flex;
    align-items: center;
    gap: 0.65rem;
    margin-bottom: 0.6rem;

    @media (max-width: 620px) {
        align-items: stretch;
        flex-wrap: wrap;
    }
`;

export const SummaryItem = styled.div`
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
    padding: 0.45rem 0.7rem;
    border-radius: 10px;
    background: ${({ $tone }) => ($tone === "warning" ? "rgba(249,115,22,0.08)" : "rgba(79,70,229,0.08)")};
    color: ${({ $tone }) => ($tone === "warning" ? "#c2410c" : "#4338ca")};

    strong {
        font-size: 1.05rem;
    }

    span {
        font-size: 0.72rem;
        font-weight: 700;
    }
`;

export const ChartLegend = styled.div`
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-left: auto;

    @media (max-width: 620px) {
        width: 100%;
        margin-left: 0;
    }
`;

export const ChartLegendItem = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--app-muted);
    font-size: 0.72rem;
    font-weight: 650;

    &::before {
        width: 8px;
        height: 8px;
        border-radius: 999px;
        background: ${({ $tone }) => ($tone === "warning" ? "#f97316" : "#4f46e5")};
        content: "";
    }
`;

export const ChartContainer = styled.div`
    width: 100%;
    height: 250px;
`;

export const EmptyState = styled.div`
    display: grid;
    place-items: center;
    width: 100%;
    height: 100%;
    border: 1px solid rgba(25, 25, 112, 0.2);
    border-radius: 10px;
    background: rgba(25, 25, 112, 0.025);
    color: var(--app-muted);
    text-align: center;
    font-size: 0.88rem;
`;
