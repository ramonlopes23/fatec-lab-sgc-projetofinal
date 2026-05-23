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

  @media (max-width: 1100px) {
    flex-direction: column;
  }
`;

export const Title = styled.h1`
  margin: 0;
  font-size: 29px;
  line-height: 1.05;
  color: #191970;
  letter-spacing: -0.5px;
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

export const FilterCard = styled.section`
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.1);
  border-radius: 18px;
  padding: 1rem;
  margin-bottom: 10px;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
`;

export const Table = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  table-layout: fixed;
`;

export const THead = styled.thead`
  background: #191970;
  color: #ffffff;
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
  color: #191970;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    background: rgba(25, 25, 112, 0.05);
  }
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
  width: min(820px, 100%);
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

export const ModalField = styled.div`
  border: 1px solid rgba(25, 25, 112, 0.08);
  border-radius: 14px;
  padding: 0.8rem;
  background: #fafbff;
`;

export const ModalFieldLabel = styled.span`
  display: block;
  margin-bottom: 0.22rem;
  color: #6b7280;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const ModalFieldValue = styled.div`
  color: #191970;
  font-weight: 700;
  font-size: 0.94rem;
  word-break: break-word;
`;

export const HeaderCopy = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
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

export const FilterCardTitle = styled.h2`
  margin: 0 0 0.5rem;
  color: #191970;
  font-size: 1rem;
`;

export const FilterHint = styled.p`
  margin: 0 0 1rem;
  font-size: 0.84rem;
  color: #6b7280;
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

export const FilterRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const FilterActionRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-top: 0.4rem;

  button {
    flex: 1;
  }
`;


export const SecondaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 1px solid rgba(25, 25, 112, 0.16);
  background: #ffffff;
  color: #191970;
  border-radius: 12px;
  height: 42px;
  padding: 0 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 18px rgba(25, 25, 112, 0.08);
  }
`;

export const PrimaryButton = styled(SecondaryButton)`
  background: linear-gradient(180deg, #2f3dc2 0%, #191970 100%);
  color: #ffffff;
  border-color: transparent;
`;

export const LayoutGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.9rem;

  @media (max-width: 1280px) {
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
  color: ${({ $tone }) => (
    $tone === "success" ? "#17a34a" : $tone === "warning" ? "#f59e0b" : $tone === "danger" ? "#ef4444" : "#6f63ff"
  )};
  background: ${({ $tone }) => (
    $tone === "success" ? "rgba(34, 197, 94, 0.12)" : $tone === "warning" ? "rgba(245, 158, 11, 0.14)" : $tone === "danger" ? "rgba(239, 68, 68, 0.12)" : "rgba(111, 99, 255, 0.12)"
  )};
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

export const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1.4fr 0.95fr 1.1fr;
  gap: 0.9rem;
  align-items: stretch;

  @media (max-width: 1320px) {
    grid-template-columns: 1fr 1fr;
  }

  @media (max-width: 900px) {
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

export const ChartHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

export const ChartTitle = styled.h3`
  margin: 0;
  color: #191970;
  font-size: 1rem;
`;

export const ChartSubtitle = styled.p`
  margin: 0.15rem 0 0;
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

export const Th = styled.th`
  text-align: left;
  padding: 0.9rem 0.9rem;
  font-size: 0.86rem;
  font-weight: 700;
`;

export const TdLocal = styled(Td)`
  color: #41506a;
`;

export const TdValue = styled(Td)`
  font-weight: 700;
  color: #191970;
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

