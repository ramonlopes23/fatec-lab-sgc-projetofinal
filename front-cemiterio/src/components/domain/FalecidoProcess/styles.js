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

export const FilePreview = styled.img`
    width: 160px;
    height: 120px;
    object-fit: cover;
    margin-top: 8px;
    border-radius: 6px;
    border: 1px solid #e6e8f2;
`;

export const InlineFeedback = styled.small`
    display: inline-block;
    margin-top: 6px;
    color: #666;
`;

export const ReviewPanel = styled.div`
    margin-bottom: 24px;
    padding: 16px;
    background-color: #f5f5f5;
    border-radius: 8px;
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
    ${(props) =>
        props.isExpanded &&
        `
    transform: rotate(180deg);
  `}
`;
