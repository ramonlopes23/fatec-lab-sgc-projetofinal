import styled from "styled-components";

export const CountBadge = styled.span`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 7px;
    border-radius: 999px;
    background: rgba(79, 70, 229, 0.12);
    color: #4338ca;
    font-size: 0.78rem;
    font-weight: 750;
    box-sizing: border-box;
`;

export const ProcessList = styled.div`
    max-height: 430px;
    overflow: auto;
    border: 1px solid var(--app-border);
    border-radius: 12px;
`;

export const ProcessItem = styled.div`
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.9rem;
    min-height: 76px;
    padding: 0.8rem;
    background: var(--app-surface);
    border-bottom: 1px solid var(--app-border);

    &:last-child {
        border-bottom: none;
    }

    @media (max-width: 680px) {
        grid-template-columns: auto minmax(0, 1fr);
    }
`;

export const StatIcon = styled.div`
    width: 52px;
    height: 52px;
    border-radius: 36px;
    display: grid;
    place-items: center;
    flex: 0 0 52px;
    color: #191970;
    background: ${({ $tone }) => {
        if ($tone === "success") return "linear-gradient(135deg, #6c6c8a 0%, rgba(185, 214, 196, 0.08) 100%)";
        return "linear-gradient(135deg, rgba(74,47,227,0.18) 0%, rgba(74,47,227,0.08) 100%)";
    }};
    font-size: 1.2rem;
`;

export const ProcessInfo = styled.div`
    min-width: 0;
`;

export const ProcessTitle = styled.strong`
    display: block;
    overflow: hidden;
    color: var(--app-text);
    font-size: 0.92rem;
    font-weight: 720;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ProcessMetadata = styled.span`
    display: block;
    overflow: hidden;
    margin-top: 0.15rem;
    color: var(--app-muted);
    font-size: 0.8rem;
    line-height: 1.35;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const ProcessAction = styled.div`
    justify-self: end;

    @media (max-width: 680px) {
        grid-column: 1 / -1;
        justify-self: stretch;

        button {
            width: 100%;
        }
    }
`;

export const EmptyState = styled.div`
    padding: 1.25rem;
    border: 1px solid rgba(25, 25, 112, 0.2);
    border-radius: 10px;
    background: rgba(25, 25, 112, 0.025);
    color: var(--app-muted);
    text-align: center;
    font-size: 0.88rem;
`;

export const StatusMessage = styled.p`
    margin: 0 0 0.75rem;
    padding: 0.65rem 0.8rem;
    border-radius: 8px;
    background: #fff7ed;
    color: #9a3412;
    font-size: 0.82rem;
`;
