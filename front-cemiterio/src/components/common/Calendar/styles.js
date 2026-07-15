import styled from "styled-components";

export const Card = styled.div`
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 6px 18px rgba(15, 13, 58, 0.06);
    overflow: hidden;
`;

export const CardHeader = styled.div`
    margin: 15px;
    font-size: 29px;
    line-height: 1.15;
    font-weight: 800;
    color: #191970;
    letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
    margin: 15px;
    font-size: 14px;
    line-height: 1.5;
    color: #6c7293;
`;

export const Title = styled.h3`
    font-size: 1.25rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 1rem;
    color: #191970;
    padding-bottom: 0.5rem;
`;

export const CardBody = styled.div`
    padding: 12px 16px;
`;

export const CalendarGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 6px;
`;

export const DayCell = styled.div`
    min-height: 90px;
    border: 1px solid #e6e6e6;
    border-radius: 6px;
    padding: 6px;
    background: ${(p) => (p.$isCurrentMonth ? "#fff" : "#fafafa")};
    box-sizing: border-box;
`;

export const DayButton = styled.button`
    width: 100%;
    text-align: left;
    border: none;
    background: transparent;
    padding: 0;
    cursor: pointer;
`;

export const Legend = styled.div`
    display: flex;
    gap: 12px;
    align-items: center;
`;

export const Btn = styled.button`
    background: #191970;
    color: #fff;
    padding: 6px 14px;
    border-radius: 10px;
    border: 5px;
    border-color: #000;
    cursor: pointer;
    font-weight: 600;
    box-shadow: 0 6px 16px rgba(15, 13, 58, 0.18);

    &:hover {
        opacity: 0.5;
    }
`;
