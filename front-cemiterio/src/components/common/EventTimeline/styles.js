import styled from "styled-components";

export const TimelineRoot = styled.div`
  display: grid;
  gap: 12px;
`;

export const TimelineItem = styled.div`
  display: grid;
  grid-template-columns: 26px minmax(0, 1fr);
  gap: 12px;
  position: relative;
`;

export const TimelineRail = styled.div`
  width: 2px;
  background: linear-gradient(180deg, rgba(25, 25, 112, 0.24) 0%, rgba(25, 25, 112, 0.04) 100%);
  position: absolute;
  left: 11px;
  top: 20px;
  bottom: -10px;
`;

export const TimelineDot = styled.div`
  width: 12px;
  height: 12px;
  margin-top: 4px;
  border-radius: 50%;
  background: ${({ $tone }) => {
    if ($tone === "success") return "#16a34a";
    if ($tone === "warning") return "#f59e0b";
    if ($tone === "danger") return "#dc2626";
    if ($tone === "neutral") return "#64748b";
    return "#191970";
  }};
  box-shadow: 0 0 0 6px rgba(25, 25, 112, 0.06);
`;

export const TimelineBody = styled.div`
  display: grid;
  gap: 4px;
`;

export const TimelineLabel = styled.strong`
  color: #1f2652;
  font-size: 13px;
  font-weight: 800;
`;

export const TimelineText = styled.p`
  margin: 0;
  color: #6c7293;
  font-size: 13px;
  line-height: 1.45;
`;

export const TimelineMeta = styled.span`
  color: #8d93b1;
  font-size: 12px;
`;

export const TimelineEmpty = styled.p`
  margin: 0;
  color: #6c7293;
  font-size: 13px;
  line-height: 1.45;
`;
