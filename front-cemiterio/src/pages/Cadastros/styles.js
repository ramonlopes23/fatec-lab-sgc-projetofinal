import styled from "styled-components";
import {Paper} from "@mui/material"

export const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
`;

export const Title = styled.h2`
  margin: 0;
  margin-bottom:10px;
  font-size: 25px;
  text-align:center;
  line-height: 1.15;
  font-weight: 800;
  color: #191970;
  letter-spacing: -0.02em;
`;

export const Subtitle = styled.p`
  margin: 0;
  text-align:center;
  font-size: 14px;
  line-height: 1.5;
  color: #6c7293;
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
  align-items: center;
  gap: 8px;
  margin-top: 6px;

  @media (max-width: 880px) {
    justify-content: center;
  }
`;

export const BtnPrimary = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #191970;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 16px;
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
    opacity: 0.92;
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(15,13,58,0.25);
  }
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
    transform: none;
    box-shadow: none;
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
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #bbc1c3;
  color: #000;
  border: none;
  padding: 12px 28px;
  border-radius: 16px;
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
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 10px 22px rgba(15,13,58,0.25);
  }
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.58;
    transform: none;
    box-shadow: none;
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

export const BtnAction = styled.button`
    margin-top:16px;
    align-self:flex-start;
    border:2px solid rgba(10, 0, 196, 0.17);
    border-radius:24px;
    padding:10px 18px;
    background:#fff;
    color:#191970;
    font-weight:600;
    cursor:pointer;
    box-shadow:0 6px 16px rgba(15,13,58,0.18);
    transition:transform 0.12s ease, opacity 0.11s ease;

    &:hover{
        opacity:0.88;
        transform:translateY(-1px);
    }

    &:disabled {
        cursor:not-allowed;
        opacity:0.55;
        transform:none;
    }
`;

export const BtnAction2 = styled.button`
    margin-top:16px;
    align-self:flex-start;
    border:2px solid #aa1818;
    border-radius:24px;
    padding:10px 18px;
    background:#fff;
    color:#aa1818;
    font-weight:600;
    cursor:pointer;
    box-shadow:0 6px 16px rgba(15,13,58,0.18);
    transition:transform 0.12s ease, opacity 0.11s ease;

    &:hover{
        opacity:0.88;
        transform:translateY(-1px);
    }

    &:disabled {
        cursor:not-allowed;
        opacity:0.55;
        transform:none;
    }
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

export const StepperWrap = styled.div`
  margin-bottom: 20px;
`;

export const StepperCard = styled(Paper)`
  && {
    padding: 24px;
    border-radius: 20px;
    box-shadow: 0 12px 32px rgba(22, 28, 70, 0.08);
    background: linear-gradient(180deg, #ffffff 0%, #fbfcff 100%);
  }
`;

export const SectionTitle = styled.h3`
  margin: 0 0 6px;
  font-size: 18px;
  color: #191970;
`;

export const SectionHint = styled.p`
  margin: 0 0 18px;
  color: #6b6f85;
  font-size: 14px;
`;

export const ReviewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 880px) {
    grid-template-columns: 1fr;
  }
`;

export const ReviewItem = styled.div`
  padding: 12px 14px;
  border-radius: 14px;
  background: #f7f8fc;
  border: 1px solid #e7eaf3;
`;

export const SummaryLabel = styled.div`
  font-size: 12px;
  color: #6b6f85;
  margin-bottom: 4px;
`;

export const SummaryValue = styled.div`
  font-size: 14px;
  color: #1f2437;
  font-weight: 500;
  word-break: break-word;
`;

export const UploadBox = styled.label`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  border-radius: 18px;
  border: 1.5px dashed #cdd3e4;
  background: #fafbff;
  cursor: pointer;
  transition: border-color 180ms ease, background 180ms ease, transform 180ms ease;

  &:hover {
    border-color: #191970;
    background: #f5f7ff;
    transform: translateY(-1px);
  }
`;

export const UploadMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const UploadFilename = styled.div`
  font-size: 13px;
  color: #1f2437;
  font-weight: 500;
`;