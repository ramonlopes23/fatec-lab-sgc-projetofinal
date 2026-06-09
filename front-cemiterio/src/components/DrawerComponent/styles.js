import styled from "styled-components";

export const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: ${({ $overlay }) => $overlay || "rgba(15, 23, 42, 0.48)"};
  z-index: ${({ $zIndex }) => $zIndex || 2400};
  display: flex;
  justify-content: flex-end;
  padding-left: 18px;

  @media (max-width: 720px) {
    padding-left: 0;
  }
`;

export const DrawerPanel = styled.aside`
  width: ${({ $width }) => ($width ? `min(${$width}, 100vw)` : "min(560px, 100%)")};
  height: 100%;
  background: #fff;
  color: ${({ $color }) => $color || "#191970"};
  border-left: 1px solid rgba(31, 38, 82, 0.08);
  box-shadow: ${({ $shadow }) => $shadow || "-30px 0 80px rgba(15, 23, 42, 0.28)"};
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: drawerIn 180ms ease-out;

  @media (max-width: 720px) {
    width: 100%;
  }

  @keyframes drawerIn {
    from {
      transform: translateX(24px);
      opacity: 0.72;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export const DrawerHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(31, 38, 82, 0.08);
  background: ${({ $plain }) => ($plain ? "#fff" : "linear-gradient(180deg, #fbfcff 0%, #ffffff 100%)")};
`;

export const DrawerHeaderCopy = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const DrawerTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 1.15;
  font-weight: 800;
  color: #191970;
`;

export const DrawerSubtitle = styled.p`
  margin: 0;
  font-size: 13px;
  color: #6c7293;
`;

export const DrawerBody = styled.div`
  flex: 1;
  padding: ${({ $padding }) => $padding || "18px 20px 22px"};
  overflow: auto;
  display: ${({ $display }) => $display || "grid"};
  gap: ${({ $gap }) => $gap || "16px"};
`;

export const DrawerSection = styled.section`
  padding: ${({ $compact }) => ($compact ? "8px 0" : "12px 0")};
  border-bottom: 1px solid #eef0ff;

  &:last-child {
    border-bottom: 0;
  }
`;

export const DrawerSectionTitle = styled.h3`
  margin: 0 0 10px;
  color: #191970;
  font-size: ${({ $size }) => $size || "20px"};
`;

export const DrawerActionRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const DrawerCloseButton = styled.button`
  border: 0;
  background: #eef2ff;
  color: #191970;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 800;

  &:hover {
    background: #e2e7ff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;
