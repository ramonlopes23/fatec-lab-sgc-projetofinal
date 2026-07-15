import styled from "styled-components";

export const SelectWrapper = styled.div`
    position: relative;
    width: 100%;
`;

export const Select = styled.select`
    width: 100%;
    min-height: 40px;
    box-sizing: border-box;
    padding: 8px 36px 8px 12px;
    border-radius: 6px;
    border: 1px solid ${({ $invalid }) => ($invalid ? "#b42318" : "#d6d9e6")};
    background: #fff;
    color: #222;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    cursor: pointer;
    text-align: left;
    appearance: none;
    -webkit-appearance: none;
    -moz-appearance: none;

    &:disabled {
        cursor: not-allowed;
        opacity: 0.65;
    }

    &:focus {
        border-color: ${({ $invalid }) => ($invalid ? "#b42318" : "#191970")};
        box-shadow: 0 2px 8px ${({ $invalid }) => ($invalid ? "rgba(180, 35, 24, 0.08)" : "rgba(123, 99, 255, 0.08)")};
        outline: none;
    }

    > span:first-child {
        min-width: 0;
        display: inline-flex;
        align-items: center;
        overflow: hidden;
    }
`;

export const SelectIcon = styled.span`
    position: absolute;
    top: 50%;
    right: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #191970;
    pointer-events: none;
    transform: translateY(-50%) rotate(${({ $open }) => ($open ? "180deg" : "0deg")});
    transition: transform 0.2s ease;
    opacity: ${({ $disabled }) => ($disabled ? 0.65 : 1)};
`;
