import styled from "styled-components";

export const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  border: 1px solid ${({ $invalid }) => ($invalid ? "#b42318" : "rgba(31, 38, 82, 0.12)")};
  border-radius: 12px;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #1f2652;
  padding: 13px 14px;
  min-height: 46px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;

  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "#b42318" : "#191970")};
    box-shadow: 0 0 0 4px ${({ $invalid }) => ($invalid ? "rgba(180, 35, 24, 0.08)" : "rgba(74, 47, 227, 0.08)")};
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;
