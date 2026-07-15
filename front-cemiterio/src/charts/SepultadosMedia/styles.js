import styled from "styled-components";

export const DashboardWrapper = styled.div`
    display: flex;
    justify-content: center;
    padding: 0.1rem;
    flex: 0 0 460px;
    box-sizing: border-box;
    transition: all 180ms ease;
`;

export const Card = styled.div`
    background-color: #fff;
    border: 1px solid rgba(25, 25, 112, 0.2);
    border-radius: 12px;
    padding: 1rem;
    width: 100%;
    height: 170px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const CardHeader = styled.h2`
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 0.5rem;
    color: #191970;
    margin-top: 5px;
`;

export const CardBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    height: calc(100% - 40px);
`;

export const Controls = styled.div`
    display: flex;
    gap: 8px;
    justify-content: center;
    align-items: center;
`;

export const PeriodButton = styled.button`
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid ${(props) => (props.$active ? "#1D4ED8" : "#ddd")};
    background: ${(props) => (props.$active ? "#eef2ff" : "#fff")};
    cursor: pointer;
    font-size: 0.85rem;
`;

export const ChartWrapper = styled.div`
    flex: 1;
    position: relative;
    min-height: 90px;
`;
