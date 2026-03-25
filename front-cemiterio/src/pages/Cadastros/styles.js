import styled from "styled-components";

export const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 20px;
  letter-spacing: 2px;
  margin-bottom: 28px;
  color: #191970;
`;

export const FormStyled = styled.form`
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(22,28,70,0.06);
`;

export const FormTop = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

export const SmallLabel = styled.label`
  font-size: 13px;
  color: #6b6f85;
  min-width: 260px;
`;

export const SelectTop = styled.select`
  flex: 1;
  padding: 8px 12px;
  border-radius: 20px;
  border: 1px solid #d6d9e6;
  background: #fff;
  color: #222;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

export const ColumnLeft = styled.div`
  padding-right: 24px;
  border-right: 1px solid #e6e8f2;

  @media (max-width: 880px) {
    padding-right: 0;
    border-right: none;
  }
`;

export const ColumnRight = styled.div`
  padding-left: 24px;

  @media (max-width: 880px) {
    padding-left: 0;
  }
`;

export const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;


export const Field = styled.div`
  margin-bottom: 14px;
  label {
    display: block;
    font-size: 12px;
    color: #6b6f85;
    margin-bottom: 6px;
  }
`;

const baseInput = `
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #222;
`;

export const Input = styled.input`
  ${baseInput}
  &:focus {
    border-color: #191970;
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;

export const SelectField = styled.select`
  ${baseInput}
  border-radius: 18px;
  &:focus {
    border-color: #191970;
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;


export const Textarea = styled.textarea`
  ${baseInput}
  min-height: 82px;
  border-radius: 12px;
  resize: vertical;
  padding-top: 10px;
  &:focus {
    border-color: #191970;
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;

export const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 6px;

  @media (max-width: 880px) {
    justify-content: center;
  }
`;

export const BtnPrimary = styled.button`
  background: #191970;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);
  width: 120px;       
  height: 44px;
  transition:
    transform 220ms cubic-bezier(.22,.61,.36,1),
    box-shadow 220ms cubic-bezier(.22,.61,.36,1),
    opacity 160ms ease;
    font-size:18px;
  will-change: transform;
  transform: translateZ(0);

  &:hover {
    opacity: 0.8;
    transform: scale(1.12);
    box-shadow: 0 10px 22px rgba(15,13,58,0.25);
  }
  &:active {
    transform: scale(1.06);
  }
`;

export const CheckboxWrapper = styled.div`
  box-sizing: border-box;

  * {
    box-sizing: inherit;
  }

  *::before,
  *::after {
    box-sizing: inherit;
  }
`;

export const CheckboxInput = styled.input.attrs({ type: "checkbox" })`
  --active: #275efe;
  --active-inner: #fff;
  --focus: 2px rgba(39, 94, 254, 0.3);
  --border: #bbc1e1;
  --border-hover: #275efe;
  --background: #fff;
  --disabled: #f6f8ff;
  --disabled-inner: #e1e6f9;

  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;

  width: 21px;
  height: 21px;
  margin: 0;
  outline: none;
  cursor: pointer;
  display: inline-block;
  vertical-align: top;
  position: relative;

  border: 1px solid var(--bc, var(--border));
  border-radius: 7px;
  background: var(--b, var(--background));

  transition: background 0.3s, border-color 0.3s, box-shadow 0.2s;

  &::after {
    content: "";
    position: absolute;
    left: 7px;
    top: 4px;
    width: 5px;
    height: 9px;
    border: 2px solid var(--active-inner);
    border-top: 0;
    border-left: 0;
    opacity: var(--o, 0);
    transform: rotate(var(--r, 20deg));
    transition: transform var(--d-t, 0.3s) var(--d-t-e, ease),
      opacity var(--d-o, 0.2s);
  }

  &:checked {
    --b: var(--active);
    --bc: var(--active);
    --o: 1;
    --r: 43deg;
    --d-o: 0.3s;
    --d-t: 0.6s;
    --d-t-e: cubic-bezier(0.2, 0.85, 0.32, 1.2);
  }

  &:hover:not(:checked):not(:disabled) {
    --bc: var(--border-hover);
  }

  &:focus {
    box-shadow: 0 0 0 var(--focus);
  }

  &:disabled {
    --b: var(--disabled);
    cursor: not-allowed;
    opacity: 0.9;
  }

  &:disabled:checked {
    --b: var(--disabled-inner);
    --bc: var(--border);
  }
`;

export const CheckboxLabel = styled.label`
  display: inline-block;
  vertical-align: middle;
  margin-left: 6px;
  cursor: pointer;
`;

export const BtnClear = styled.button`
  background: #bbc1c3;
  color: #000;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  margin-right:15px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);
  width: 120px;       
  height: 44px;
  transition:
    transform 220ms cubic-bezier(.22,.61,.36,1),
    box-shadow 220ms cubic-bezier(.22,.61,.36,1),
    opacity 160ms ease;
    font-size:18px;
  will-change: transform;
  transform: translateZ(0);

  &:hover {
    opacity: 0.8;
    transform: scale(1.12);
    box-shadow: 0 10px 22px rgba(15,13,58,0.25);
  }
  &:active {
    transform: scale(1.06);
  }
`;


export const InputCova = styled.input`
  width: 100%;
  box-sizing: border-box;
  
  padding: 10px 12px;
  border-radius: 18px;
  border: 1px solid #d6d9e6;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #222;
`;