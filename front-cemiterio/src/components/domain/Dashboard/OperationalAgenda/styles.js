import styled from "styled-components";

export const AgendaList = styled.div`
    display: flex;
    flex-direction: column;
    max-height: 430px;
    overflow: auto;
`;

export const EventRow = styled.div`
    display: grid;
    grid-template-columns: 54px 18px minmax(0, 1fr) auto;
    gap: 0.7rem;
    min-height: 82px;
    align-items: start;
    padding: 0.7rem 0;

    @media (max-width: 620px) {
        grid-template-columns: 48px 16px minmax(0, 1fr);
    }
`;

export const EventTime = styled.strong`
    padding-top: 0.08rem;
    color: var(--app-text);
    font-size: 0.86rem;
    font-weight: 750;
`;

export const TimelineRail = styled.div`
    position: relative;
    display: flex;
    justify-content: center;
    align-self: stretch;

    > span {
        position: absolute;
        top: 16px;
        bottom: -12px;
        width: 2px;
        background: rgba(25, 25, 112, 0.14);
    }
`;

export const TimelineMarker = styled.i`
    position: relative;
    z-index: 1;
    display: block;
    width: 11px;
    height: 11px;
    margin-top: 0.18rem;
    border: 3px solid var(--app-surface);
    border-radius: 999px;
    background: ${({ $type }) => ($type === "Exumação" ? "#f97316" : "#4f46e5")};
    box-shadow: 0 0 0 2px ${({ $type }) => ($type === "Exumação" ? "rgba(249,115,22,0.18)" : "rgba(79,70,229,0.18)")};
`;

export const EventDetails = styled.div`
    min-width: 0;
    color: var(--app-muted);
    font-size: 0.8rem;
    line-height: 1.4;

    > span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
`;

export const EventName = styled.strong`
    display: block;
    margin-bottom: 0.08rem;
    color: var(--app-text);
    font-size: 0.9rem;
    font-weight: 750;
`;

export const EventLocation = styled.span`
    color: var(--app-muted);
`;

export const EventStatus = styled.span`
    align-self: start;
    padding: 0.28rem 0.65rem;
    border-radius: 999px;
    background: ${({ $status }) => {
        if ($status === "completed") return "rgba(22, 163, 74, 0.11)";
        if ($status === "cancelled") return "rgba(220, 38, 38, 0.1)";
        return "rgba(79, 70, 229, 0.1)";
    }};
    color: ${({ $status }) => {
        if ($status === "completed") return "#15803d";
        if ($status === "cancelled") return "#b91c1c";
        return "#4338ca";
    }};
    font-size: 0.7rem;
    font-weight: 700;

    @media (max-width: 620px) {
        display: none;
    }
`;

export const AgendaFooter = styled.footer`
    display: flex;
    justify-content: center;
    padding-top: 0.8rem;
    border-top: 1px solid var(--app-border);
`;

export const EmptyState = styled.div`
    padding: 1.25rem;
    border: 1px dashed rgba(25, 25, 112, 0.2);
    border-radius: 10px;
    background: rgba(25, 25, 112, 0.025);
    color: var(--app-muted);
    text-align: center;
    font-size: 0.88rem;
`;
