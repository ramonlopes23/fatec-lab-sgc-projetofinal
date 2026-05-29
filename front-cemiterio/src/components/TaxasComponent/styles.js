import styled from "styled-components";

export const Container = styled.div`
  max-width: 1220px;
  margin: 0 auto;
  padding: 24px 20px 28px;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

export const HeaderCopy = styled.div`
  display: grid;
  gap: 6px;
`;

export const Title = styled.h2`
  margin: 0;
  font-size: 29px;
  line-height: 1.15;
  font-weight: 800;
  color: #191970;
  letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #6c7293;
`;

export const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const PrimaryActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: 0;
  border-radius: 12px;
  padding: 13px 18px;
  background: #191970;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  box-shadow: 0 14px 28px rgba(74, 47, 227, 0.22);
  transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 18px 32px rgba(74, 47, 227, 0.24);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
    transform: none;
  }
`;

export const Panel = styled.section`
  background: #ffffff;
  border: 1px solid rgba(31, 38, 82, 0.08);
  border-radius: 18px;
  box-shadow: 0 14px 32px rgba(22, 28, 70, 0.06);
`;

export const FiltersPanel = styled(Panel)`
  padding: 16px;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
  margin: 16px 0 18px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.div`
  background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  border: 1px solid rgba(31, 38, 82, 0.08);
  border-radius: 18px;
  padding: 18px;
  box-shadow: 0 10px 24px rgba(31, 38, 82, 0.04);
  display: flex;
  align-items: center;
  gap: 14px;
`;

export const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex: 0 0 auto;
  color: ${({ $tone }) => {
     $tone == "#191970";
  }};
  background: ${({ $tone }) => {
    if ($tone === "success") return "linear-gradient(135deg, #6c6c8a 0%, rgba(185, 214, 196, 0.08) 100%)";
    return "linear-gradient(135deg, rgba(74,47,227,0.18) 0%, rgba(74,47,227,0.08) 100%)";
  }};
`;

export const StatCopy = styled.div`
  display: grid;
  gap: 4px;
`;

export const StatLabel = styled.span`
  font-size: 13px;
  color: #6c7293;
  font-weight: 600;
`;

export const StatValue = styled.strong`
  font-size: 26px;
  line-height: 1;
  color: #1f2652;
  font-weight: 800;
`;

export const StatHint = styled.span`
  font-size: 12px;
  color: #8d93b1;
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 0.8fr) minmax(0, 0.8fr) auto;
  gap: 12px;
  align-items: center;

  @media (max-width: 980px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`;

export const SearchWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 0;
`;

export const SearchIcon = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #8f97b7;
  display: inline-flex;
  align-items: center;
  pointer-events: none;
`;

export const SearchField = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(31, 38, 82, 0.12);
  border-radius: 12px;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #1f2652;
  padding: 13px 14px 13px 44px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;

  &:focus {
    border-color: #4a2fe3;
    box-shadow: 0 0 0 4px rgba(74, 47, 227, 0.08);
  }

  &::placeholder {
    color: #99a0bd;
  }
`;

export const FilterSelect = styled.select`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(31, 38, 82, 0.12);
  border-radius: 12px;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #1f2652;
  padding: 13px 14px;

  &:focus {
    border-color: #4a2fe3;
    box-shadow: 0 0 0 4px rgba(74, 47, 227, 0.08);
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height:50px;
  gap: 8px;
  border: 1px solid rgba(74, 47, 227, 0.14);
  border-radius: 12px;
  padding: 13px 16px;
  background: #fff;
  color: #191970;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, transform 0.15s ease;

  &:hover {
    background: rgba(74, 47, 227, 0.04);
    border-color: rgba(74, 47, 227, 0.22);
    transform: translateY(-1px);
  }
`;

export const Card = styled.div`
  background: #ffffff;
  border-radius: 18px;
  border: 1px solid rgba(31, 38, 82, 0.08);
  padding: 0;
  box-shadow: 0 14px 32px rgba(22, 28, 70, 0.06);
  margin-top: 18px;
  overflow: hidden;
`;

export const CardBody = styled.div`
  padding: 16px;
`;

export const CardTitle = styled.h3`
  margin: 0 0 12px;
  color: #191970;
  font-size: 16px;
  font-weight: 800;
`;

export const TableWrapper = styled.div`
  margin-top: 0;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 940px;
  font-size: 14px;
  table-layout: fixed;
`;

export const THead = styled.thead`
  color: #5b5f81;
  background: #f7f8fc;
`;

export const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  font-weight: 700;
  font-size: 13px;
  color: #191970;
  border-bottom: 1px solid rgba(31, 38, 82, 0.08);
`;

export const TBody = styled.tbody`
  background: #fff;
`;

export const Tr = styled.tr`
  background: ${({ index }) => (index % 2 === 0 ? "#ffffff" : "#fcfdff")};
  transition: background 0.12s ease;

  &:hover {
    background: #f5f7ff;
  }
`;

export const Td = styled.td`
  padding: 16px;
  vertical-align: middle;
  color: #344054;
  border-bottom: 1px solid rgba(31, 38, 82, 0.06);
  white-space: normal;
  overflow: visible;
  font-size: 14px;
`;

export const TdStatus = styled.td`
  padding: 16px;
  vertical-align: middle;
  border-bottom: 1px solid rgba(31, 38, 82, 0.06);
  white-space: nowrap;
  text-align: center;
`;

export const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: flex-start;
  flex-wrap: nowrap;
  white-space: nowrap;
`;

export const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  border: 1px solid rgba(31, 38, 82, 0.08);
  color: #454d73;
  cursor: pointer;
  padding: 0;
  transition: transform 0.08s ease, background 0.12s ease, border-color 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(74, 47, 227, 0.04);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &[data-danger="true"] {
    color: #e11d48;
    border-color: rgba(225, 29, 72, 0.18);
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
  border-radius: 12px;
  border: 1px solid rgba(31, 38, 82, 0.12);
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #222;
`;

export const Input = styled.input`
  ${baseInput}

  &:focus {
    border-color: #7b63ff;
    box-shadow: 0 2px 8px rgba(123, 99, 255, 0.08);
  }
`;

export const BtnPrimaryClose = styled.button`
  background: #fff;
  color: #4a2fe3;
  border: 1px solid rgba(74, 47, 227, 0.16);
  margin-top: 10px;
  padding: 12px 20px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(15, 13, 58, 0.06);

  &:hover {
    opacity: 0.92;
  }
`;

export const BtnPrimarySave = styled.button`
  background: #191970;
  color: #fff;
  border: 0;
  margin-right: 10px;
  margin-top: 10px;
  padding: 12px 20px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 700;
  box-shadow: 0 10px 22px rgba(74, 47, 227, 0.22);

  &:hover {
    opacity: 0.95;
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(16, 20, 44, 0.52);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

export const ModalContent = styled.div`
  background: #fff;
  padding: 20px;
  max-height: 82vh;
  overflow-y: auto;
  border-radius: 18px;
  width: min(720px, calc(100vw - 32px));
  box-shadow: 0 24px 50px rgba(16, 20, 44, 0.2);
`;

export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 20px;

  @media (max-width: 820px) {
    grid-template-columns: 1fr;
  }
`;

export const FormStyled = styled.div`
  display: grid;
  gap: 16px;
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 92px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
  letter-spacing: 0.35px;
  border: 1px solid
  ${({ $status }) => {
    const s = String($status || "").trim().toLowerCase();
    if (s === "ativo") return "#16a34a";
    if (s === "inativo") return "#ef4444";
    if (s === "a vencer") return "#f59e0b";
    return "#6b7280";
  }};
  color: ${({ $status }) => {
    const s = String($status || "").trim().toLowerCase();
    if (s === "a vencer") return "#7a4f00";
    return "#fff";
  }};
  background: ${({ $status }) => {
    const s = String($status || "").trim().toLowerCase();
    if (s === "ativo") return "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)";
    if (s === "inativo") return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    if (s === "a vencer") return "linear-gradient(135deg, #fde68a 0%, #fbbf24 100%)";
    return "#6b7280";
  }};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 1px 2px rgba(15, 23, 42, 0.12);
`;
