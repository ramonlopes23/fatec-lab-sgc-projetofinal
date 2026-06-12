import styled from "styled-components";

export const TableCard = styled.section`
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.08);
  border-radius: 18px;
  box-shadow: 0 18px 36px rgba(16, 20, 44, 0.08);
  padding: 1rem;
  overflow: hidden;
`;

export const TableWrapper = styled.div`
  margin-top: 0;
  border-radius: 0;
  overflow: hidden;
  background: transparent;
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
  width: 100%;
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: ${({ $minWidth }) => $minWidth || "980px"};
  border-collapse: collapse;
  table-layout: fixed;
`;

export const THead = styled.thead`
  background: #f7f8fc;
  color: #5b5f81;
`;

export const TBody = styled.tbody`
  background: #ffffff;
`;

export const Tr = styled.tr`
  cursor: ${({ $clickable }) => ($clickable ? "pointer" : "default")};

  tbody & {
    background: ${({ $index, index }) => ((($index ?? index ?? 0) % 2 === 0) ? "#fafbff" : "#ffffff")};
    transition: background 0.12s ease, transform 0.12s ease;
  }

  tbody &:hover {
    background: #eef3ff;
  }
`;

export const Th = styled.th`
  text-align: left;
  padding: 14px 16px;
  font-size: 13px;
  font-weight: 700;
  color: #191970;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
`;

export const Td = styled.td`
  padding: 0.85rem 0.9rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  color: #253045;
  font-size: 0.9rem;
  white-space: ${({ $nowrap }) => ($nowrap ? "nowrap" : "normal")};
  overflow: ${({ $clip }) => ($clip ? "hidden" : "visible")};
  text-overflow: ${({ $clip }) => ($clip ? "ellipsis" : "clip")};
  vertical-align: middle;
`;

export const TdStatus = styled(Td).attrs({ $nowrap: true })`
  text-align: left;
`;

export const TdLocal = styled(Td)``;

export const TdValue = styled(Td).attrs({ $nowrap: true })``;

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

export const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0.28rem 0.62rem;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  color: ${({ $tone, $status }) => {
    const status = String($status || "").trim().toLowerCase();
    const tone = $tone || (
      ["inativo", "ocupado"].includes(status) ? "danger" :
      ["vencido", "interditado", "a vencer"].includes(status) ? "warning" :
      ["manutencao"].includes(status) ? "neutral" :
      "success"
    );
    if (tone === "warning") return "#92400e";
    if (tone === "danger") return "#991b1b";
    if (tone === "neutral") return "#475569";
    return "#166534";
  }};
  background: ${({ $tone, $status }) => {
    const status = String($status || "").trim().toLowerCase();
    const tone = $tone || (
      ["inativo", "ocupado"].includes(status) ? "danger" :
      ["vencido", "interditado", "a vencer"].includes(status) ? "warning" :
      ["manutencao"].includes(status) ? "neutral" :
      "success"
    );
    if (tone === "warning") return "rgba(245, 158, 11, 0.14)";
    if (tone === "danger") return "rgba(239, 68, 68, 0.12)";
    if (tone === "neutral") return "rgba(100, 116, 139, 0.14)";
    return "rgba(34, 197, 94, 0.12)";
  }};
`;
