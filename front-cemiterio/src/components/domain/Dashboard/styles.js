import styled from "styled-components";

export const DashboardWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 2rem 1rem;
`;

export const Card = styled.div`
    background-color: #fff;
    border: 1px solid rgba(25, 25, 112, 0.2);
    border-radius: 12px;
    padding: 1rem;
    width: 100%;
    max-width: 800px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const CardHeader = styled.h2`
    margin: 0;
    font-size: 20px;
    text-align: center;
    margin-bottom: 5px;
    line-height: 1.15;
    font-weight: 800;
    color: #191970;
    letter-spacing: -0.02em;
`;

export const CardBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1rem;
`;

export const ProcessItem = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    background: #ffffff;
    border: 1px solid #e5e7eb;
    padding: 1rem;
    border-radius: 8px;

    @media (max-width: 720px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

export const ProcessInfo = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.25rem;

    strong {
        font-size: 1rem;
        color: #191970;
    }

    span {
        font-size: 0.875rem;
        color: #191970;
    }
`;

export const ProcessAction = styled.div`
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: wrap;
    font-weight: bold;
    color: #191970;

    @media (max-width: 720px) {
        width: 100%;
        justify-content: flex-start;
    }
`;

export const ProcessType = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 999px;
    background: rgba(25, 25, 112, 0.08);
    color: #191970;
    font-size: 0.8rem;
`;

export const Btn = styled.button`
    background: #191970;
    color: #fff;
    border: none;
    padding: 12px 28px;
    border-radius: 24px;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 6px 16px rgba(15, 13, 58, 0.18);

    &:hover {
        opacity: 0.95;
        transform: translateY(-1px);
    }

    &:disabled {
        cursor: not-allowed;
        opacity: 0.58;
        transform: none;
    }
`;

export const EmptyState = styled.div`
    padding: 12px;
    color: #5f637a;
    text-align: center;
    border: 1px dashed #d6d9e6;
    border-radius: 8px;
    background: #fafbff;
`;
