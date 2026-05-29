import styled from "styled-components";

export const Container = styled.div`
  width: 100%;
  max-width: 1220px;
  margin: 0 auto;
  padding: 1.5rem;
  box-sizing: border-box;
`;

export const PageHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.25rem;

  @media (max-width: 900px) {
    flex-direction: column;
  }
`;

export const HeaderCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 29px;
  font-weight: 800;
  line-height: 1.05;
  color: #191970;
`;

export const Subtitle = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
`;

export const PeriodChip = styled.div`
  min-width: 250px;
  padding: 0.9rem 1rem;
  border: 1px solid rgba(25, 25, 112, 0.12);
  border-radius: 14px;
  background: linear-gradient(180deg, #ffffff 0%, #f8f8ff 100%);
  box-shadow: 0 10px 24px rgba(25, 25, 112, 0.08);
  color: #191970;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
`;

export const PeriodChipLabel = styled.span`
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #6b7280;
`;

export const PeriodChipValue = styled.span`
  font-size: 0.95rem;
  font-weight: 700;
  color: #191970;
`;

export const FilterCard = styled.section`
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.1);
  border-radius: 18px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr) minmax(0, 1fr) auto;
  gap: 12px;
  align-items: center;

  @media (max-width: 1180px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 680px) {
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

export const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height:50px;
  border: 1px solid rgba(25, 25, 112, 0.16);
  background: #ffffff;
  color: #191970;
  border-radius: 12px;
  padding: 0 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(25, 25, 112, 0.08);
  }
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.9rem;
  margin-bottom: 1rem;

  @media (max-width: 1280px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled.article`
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.1);
  border-radius: 18px;
  padding: 1rem 1.05rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  display: flex;
  align-items: center;
  gap: 0.9rem;
  min-height: 104px;
`;

export const StatIcon = styled.div`
  width: 52px;
  height: 52px;
  border-radius: 36px;
  display: grid;
  place-items: center;
  font-size: 1.2rem;
  color: ${({ $tone }) => {
     $tone == "#191970";
  }};
  background: ${({ $tone }) => {
    if ($tone === "success") return "linear-gradient(135deg, #6c6c8a 0%, rgba(185, 214, 196, 0.08) 100%)";
    return "linear-gradient(135deg, rgba(74,47,227,0.18) 0%, rgba(74,47,227,0.08) 100%)";
  }};
  flex: 0 0 52px;
`;

export const StatCopy = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const StatLabel = styled.span`
  color: #6b7280;
  font-size: 0.82rem;
  font-weight: 600;
`;

export const StatValue = styled.strong`
  font-size: clamp(1.15rem, 2vw, 1.55rem);
  color: #191970;
  line-height: 1.1;
  margin-top: 0.15rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const StatHint = styled.span`
  margin-top: 0.18rem;
  color: #8b93a7;
  font-size: 0.76rem;
`;

export const ChartStatCard = styled.article`
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.1);
  border-radius: 18px;
  padding: 0.85rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  min-height: 104px;
  display: flex;
  flex-direction: column;
  min-width: 0;
`;

export const ChartStatBody = styled.div`
  flex: 1;
  min-height: 92px;
`;

export const ChartLegend = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.25rem 0.45rem;
  margin-top: 0.35rem;
`;

export const ChartLegendItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  min-width: 0;
  color: #4b5563;
  font-size: 0.68rem;
  font-weight: 700;
  white-space: nowrap;
`;

export const ChartLegendDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: ${({ $color }) => $color || "#94a3b8"};
  flex: 0 0 8px;
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 1rem;
  align-items: stretch;

  @media (max-width: 1120px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartCard = styled.section`
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.1);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
  min-height: 360px;
  display: flex;
  flex-direction: column;
`;

export const ChartTitle = styled.h3`
  margin: 0 0 0.25rem;
  margin-bottom:5px;
  color: #676787;
  text-align:center;
  font-size: 0.9rem;
`;

export const ChartSubtitle = styled.p`
  margin: 0 0 0.75rem;
  color: #6b7280;
  font-size: 0.82rem;
`;

export const ChartBody = styled.div`
  flex: 1;
  min-height: 280px;
`;

export const TableCard = styled.section`
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.1);
  border-radius: 18px;
  padding: 1rem;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
`;

export const TableHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
`;

export const TableTitle = styled.h3`
  margin: 0;
  color: #191970;
  font-size: 1rem;
`;

export const TableNote = styled.p`
  margin: 0.15rem 0 0;
  color: #6b7280;
  font-size: 0.82rem;
`;

export const TableScroller = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  table-layout: fixed;
`;

export const THead = styled.thead`
  background: #f7f8fc;
  color: #5b5f81;
`;

export const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #191970;
  border-bottom: 1px solid rgba(31, 38, 82, 0.08);
`;

export const TBody = styled.tbody`
  background: #ffffff;
`;

export const Tr = styled.tr`
  background: ${({ $index }) => ($index % 2 === 0 ? "#fafbff" : "#ffffff")};
  transition: background 0.12s ease;

  &:hover {
    background: #eef3ff;
  }
`;

export const Td = styled.td`
  padding: 0.85rem 0.9rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  color: #253045;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  vertical-align: middle;
`;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const IconBtn = styled.button`
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(25, 25, 112, 0.12);
  background: #ffffff;
  color: ${({ $danger }) => ($danger ? "#b91c1c" : "#191970")};
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    background: ${({ $danger }) => ($danger ? "rgba(239, 68, 68, 0.08)" : "rgba(25, 25, 112, 0.05)")};
  }
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.28rem 0.62rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${({ $tone }) => ($tone === "warning" ? "#92400e" : $tone === "danger" ? "#991b1b" : "#166534")};
  background: ${({ $tone }) => ($tone === "warning" ? "rgba(245, 158, 11, 0.14)" : $tone === "danger" ? "rgba(239, 68, 68, 0.12)" : "rgba(34, 197, 94, 0.12)")};
`;

export const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.4rem;
  margin-top: 0.9rem;
  flex-wrap: wrap;
`;

export const PageButton = styled.button`
  min-width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? "#191970" : "rgba(25, 25, 112, 0.14)")};
  background: ${({ $active }) => ($active ? "#191970" : "#ffffff")};
  color: ${({ $active }) => ($active ? "#ffffff" : "#191970")};
  font-weight: 700;
  cursor: pointer;
  padding: 0 0.65rem;

  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  padding: 1rem;
  color: #6b7280;
  text-align: center;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.46);
  display: grid;
  place-items: center;
  z-index: 2000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  width: min(920px, 100%);
  max-height: min(86vh, 900px);
  overflow: auto;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.12);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
  padding: 1.1rem;
`;

export const ModalTitle = styled.h3`
  margin: 0 0 0.25rem;
  color: #191970;
  font-size: 1.1rem;
`;

export const ModalSubtitle = styled.p`
  margin: 0 0 1rem;
  color: #6b7280;
  font-size: 0.86rem;
`;

export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 700;
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid rgba(31, 38, 82, 0.12);
  border-radius: 12px;
  background: ${({ readOnly }) => (readOnly ? "#fafbff" : "#ffffff")};
  outline: none;
  font-size: 14px;
  color: #1f2652;
  padding: 11px 12px;

  &:focus {
    border-color: #4a2fe3;
    box-shadow: 0 0 0 4px rgba(74, 47, 227, 0.08);
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
  flex-wrap: wrap;
`;

export const PrimaryButton = styled(SecondaryButton)`
  background: linear-gradient(180deg, #2f3dc2 0%, #191970 100%);
  color: #ffffff;
  border-color: transparent;
`;
