import styled from "styled-components";

const baseButton = `
  margin-top: 16px;
  align-self: flex-start;
  border-radius: 24px;
  padding: 10px 18px;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(15, 13, 58, 0.18);
  transition: transform 0.12s ease, opacity 0.11s ease;

  &:hover {
    opacity: 0.88;
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
  }
`;

export const BtnAction = styled.button`
  ${baseButton}
  border: 2px solid rgba(10, 0, 196, 0.17);
  color: #191970;
`;

export const BtnAction2 = styled.button`
  ${baseButton}
  border: 2px solid #aa1818;
  color: #aa1818;
`;

export const SearchFieldWrapper = styled.div`
  position: relative;
`;

export const SearchResults = styled.ul`
  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 50;
  max-height: 220px;
  margin: 0;
  padding: 0;
  overflow: auto;
  list-style: none;
  background: #fff;
  border: 1px solid #191970;
  border-radius: 16px;
  box-shadow: 0 16px 32px rgba(25, 25, 112, 0.12);
`;

export const SearchResultItem = styled.li`
  padding: 8px 10px;
  cursor: pointer;
  border-bottom: 1px solid #f1f1f1;
  color: #222;

  &:hover {
    background: #f6f7ff;
  }

  &:last-child {
    border-bottom: 0;
  }
`;

export const StepHeader = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
`;

export const ChevronIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
  ${props => props.isExpanded && `
    transform: rotate(180deg);
  `}
`;
