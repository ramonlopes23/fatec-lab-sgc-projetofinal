import styled from "styled-components";

export const DashboardWrapper = styled.div`
  display: flex;
  justify-content: center;
  padding: 2rem;
`;

export const Card = styled.div`
  background-color: #fff;
  border: 1px solid rgba(25,25,112,0.2);
  border-radius: 12px;
  padding: 1rem;
  width: 100%;
  max-width: 800px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

export const Container = styled.div`
    max-width: 1100px;
    margin:0 auto;
    padding:20px;
`;

export const Title = styled.h2`
    text-align:center;
    font-size:20px;
    letter-spacing:2px;
    margin:0 0 8px;
    color: #191970;
`;

export const Subtitle = styled.p`
    text-align:center;
    margin:0 0 24px;
    color:#4b5563;
    font-size:14px;
`;

export const CardsGrid = styled.div`
    display:grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap:16px;
`;

export const ProcessCard = styled.section`
    background: #fff;
    border: 1px solid rgba(25,25,112,0.15);
    border-radius:12px;
    padding:18px;
    box-shadow:0 10px 24px rgba(15, 13,58,0.06);
    display:flex;
    flex-direction:column;
    min-height:190px;
`;

export const CardTitle = styled.h3`
    margin:0 0 10px;
    font-size:18px;
    color:#191970;
    text-align:center;
`;

export const CardText = styled.p`
    margin:0;
    color:#334155;
    line-height:1.45;
    font-size:14px;
    flex:1;
`;

export const CardAction = styled.button`
    margin-top:16px;
    align-itself:flex-start;
    border:2;
    border-radius:24px;
    border-color:rgba(10, 0, 196, 0.17);
    padding:10px 18px;
    background:#;
    color:#191970;
    font-weight:600;
    cursor:pointer;
    box-shadow:0 6px 16px rgba(15,13,58,0.18);
    transition:transform 0.12s ease, opacity 0.11s ease;

    &:hover{
        opacity:0.5;
        transform:translateY(-5px);
    }
`;

export const CardHeader = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1rem;
  color:#191970;
  padding-bottom: 0.5rem;
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const CardIcon = styled.div`
    width: 140px;
    height:140px;
    border-radius:14px;
    display:flex;
    align-items:center;
    justify-content:center;
    margin:0 auto 14px;
    color:#191970;
    background:linear-gradiente(
        180deg,
        rgba(25,25,112,0.08)0%,
        rgba(255,25,112,0.02)100%
    );
    border: 1px solid rgba(25, 25, 112, 0.16);

    svg{
    font-size:90px
    }
`;

export const ProcessItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  padding: 1rem;
  border-radius: 8px;
`;

export const ProcessInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align:center;

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
  font-weight: bold;
  color: #191970
`;


export const Btn = styled.button`
  background: #191970;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.95; }
`;

