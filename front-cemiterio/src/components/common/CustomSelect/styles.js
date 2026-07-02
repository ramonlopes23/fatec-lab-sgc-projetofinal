import styled from "styled-components";

export const CustomSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const CustomSelectButton = styled.button`
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d6d9e6;
  background: #fff;
  color: #222;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  cursor: pointer;
  text-align: left;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  &:focus {
    border-color: #191970;
    box-shadow: 0 2px 8px rgba(123, 99, 255, 0.08);
    outline: none;
  }

  > span:first-child {
    min-width: 0;
    display: inline-flex;
    align-items: center;
    overflow: hidden;
  }
`;

export const CustomSelectPlaceholder = styled.span`
  color: #6b6f85;
`;

export const CustomSelectIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #191970;
  flex-shrink: 0;
  transition: transform 0.2s ease;
  transform: rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
`;

export const CustomSelectMenu = styled.div`
  position: absolute;
  z-index: 2600;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  max-height: 220px;
  overflow: auto;
  padding: 6px;
  border: 1px solid #d6d9e6;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(22, 28, 70, 0.14);
`;

export const CustomSelectOption = styled.button`
  width: 100%;
  border: 0;
  border-radius: 6px;
  padding: 9px 10px;
  background: ${({ $selected }) => ($selected ? "#f1f3ff" : "transparent")};
  color: #191970;
  font-size: 14px;
  text-align: left;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #f6f7ff;
  }

  &:disabled {
    cursor: not-allowed;
    color: #9aa0b8;
    background: transparent;
  }
`;
