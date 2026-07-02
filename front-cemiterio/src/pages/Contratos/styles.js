import styled from "styled-components";

export const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 20px;
  letter-spacing: 2px;
  margin-bottom: 18px;
  color: #191970;
`;

export const FormStyled = styled.form`
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 10px 26px rgba(22,28,70,0.06);
`;

export const SearchBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export const SearchInput = styled.input`
  flex: 1;
  min-width: 220px;
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  outline: none;
  font-size: 14px;
  box-sizing: border-box;
  padding-right: 44px;
  &:focus {
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
    border-color: #191970;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 220px;
`;

export const SearchIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #191970;
  cursor:pointer;
  font-size: 18px;
  pointer-events: auto;
`

export const SmallSelect = styled.select`
  padding: 8px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  background: #fff;
  font-size: 14px;
  outline: none;
  margin-right:10px;
  margin-bottom:10px;
`;

export const SmallInput = styled.input`
  padding: 8px 12px;
  border-radius: 18px;
  border: 1px solid #0022bc;
  background: #fff;
  font-size: 14px;
  margin-bottom:10px;
  margin-right:10px;
`;

export const BtnPrimary = styled.button`
  background: #191970;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  margin-right:10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.7; }
`;

export const BtnPrimaryClose = styled.button`
  background: #e6e6f1ff;
  color: #191970;
  border-color:#191970;
  border: 2px;
  margin-top:10px;
  padding: 12px 28px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.7; }
`;

export const BtnPrimarySave = styled.button`
  background: #e6e6f1ff;
  color: #fff;
  background-color:#008000;
  border: 2px;
  margin-right:10px;
  margin-top:10px;
  padding: 12px 28px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.7; }
`;


export const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const Field = styled.div`
  margin-bottom: 14px;

  label {
    display: block;
    font-size: 12px;
    color: #6b6f85;
    margin-bottom: 6px;
  }
`;

export const ColumnRight = styled.div`
  padding-left: 24px;

  @media (max-width: 880px) {
    padding-left: 0;
  }
`;

export const ColumnLeft = styled.div`
  padding-right: 24px;
  border-right: 1px solid #e6e8f2;

  @media (max-width: 880px) {
    padding-right: 0;
    border-right: none;
  }
`;

export const Label = styled.label`
  font-weight: normal;
  margin-left: 5px;
`;

export const Card = styled.div`
  background: #ffffff;
  border-radius: 12px;
  padding: 28px;
  box-shadow: 0 10px 28px rgba(15,13,58,0.06);
  margin-top: 18px;
`;

export const TableWrapper = styled.div`
  margin-top: 18px;
  margin-bottom:20px;
  border-radius: 10px;
  overflow: hidden;
  background: transparent;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 720px;
  font-size: 14px;
  table-layout:fixed;
`;

export const THead = styled.thead`
  background: #191970;
  color: #fff;
`;

export const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  font-weight: 700;
  font-size: 15px;
`;


export const TBody = styled.tbody`
  background: #fff;
`;

export const Tr = styled.tr`
  background: ${({ index }) => (index % 2 === 0 ? "#fafafa" : "#ffffff")};
  transition: background 0.12s ease;
  &:hover {
    background: #ecf0fb;
  }
`;

export const Td = styled.td`
  padding: 14px 16px;
  vertical-align: middle;
  color: #3b3b3b;
  border-bottom: 1px solid rgba(15,13,58,0.04);
  white-space: normal;
  text-overflow: clip;
  overflow: visible;
  font-size:15px;
`;

export const TdStatus = styled.td`
  padding: 14px 16px;   
  vertical-align: middle;   
  border-bottom: 1px solid rgba(15, 13, 58, 0.04);   
  white-space: nowrap;   
  text-align: center;
`;

export const TdNumContrato = styled.td`
  padding: 14px 16px;
  font-size:20px; 
  font-weight:900;  
  vertical-align: middle;   
  border-bottom: 1px solid rgba(15, 13, 58, 0.04);   
  white-space: nowrap;   
  text-align: center;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content:flex-start;
  flex-wrap:nowrap;
  white-space:nowrap;
`;

export const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid rgba(15,13,58,0.08);
  color: #15142e;
  cursor: pointer;
  padding: 0;
  transition: transform 0.08s ease, background 0.12s ease;
  &:hover {
    transform: translateY(-1px);
    background: rgba(15,13,58,0.04);
  }
  &[data-danger="true"] {
    color: #c0392b;
    border-color: rgba(192,57,43,0.12);
  }
`;

export const TableScroller = styled.div`
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
`;

const baseInput = `
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #222;
`;

export const Input = styled.input`
  ${baseInput}
  &:focus {
    border-color: #191970;
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;


export const ModalOverlay = styled.div`
  position: fixed;
  top:0;
  left:0;
  width:100%;
  height:100%;
  background: rgba(0,0,0,0.5);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  height:55vh;
  overflow-y: auto;
  border-radius: 8px;
  width: 600px;
`;

export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom:20px;
`;

export const StatusBadge = styled.span`
  display:inline-flex;
  align-items:center;
  justify-content:center;
  min-width:96px;
  padding:6px 12px;
  border-radius:999px;
  font-size:12px;
  font-weight:700;
  line-height:1.2;
  text-transform:uppercase;
  letter-spacing:0.35px;
  border:1px solid
  ${({$status})=>{
    const s = String($status || "").trim().toLowerCase();
    if(s=== "ativo") return "#12833c"
    if(s=== "inativo") return "#b91c1c"
    if(s=== "vencido") return "#d4a100"
    return "#6b7280";
  }};
  color: ${({ $status})=>{
    const s = String($status || "").trim().toLowerCase();
    if(s === "vencido") return "#3d3200";
    return "#fff"
  }};
  background: ${({$status})=>{
    const s = String($status || "").trim().toLowerCase();
    if(s==="ativo") return "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
    if(s==="inativo") return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    if(s==="vencido") return "linear-gradient(135deg, #fde047 0%, #facc15 100%)";
    return "#6b7280"
  }};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 1px 2px rgba(15, 23, 42, 0.15);
`;
