import styled from "styled-components";

export const TabsBar = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin: 12px 0;
`;

export const TabButton = styled.button`
  padding: 8px 12px;
  border-radius: 8px;
  border: ${(p) => (p.$active ? "2px solid #27348e" : "1px solid #d6d9e6")};
  background: ${(p) => (p.$active ? "#eef2ff" : "#fff")};
  color: #171770;
  font-weight: 700;
  cursor: pointer;
`;

export const AddPetButton = styled.button`
  margin-left: auto;
  background: #191970;
  color: #fff;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.7; transform: translateY(-1px); }
`;

export const PetList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 12px;
`;

export const PetCard = styled.div`
  border: 1px solid #dfe4ff;
  background: #fff;
  border-radius: 8px;
  padding: 5px 12px;
`;

export const PetActionsRow = styled.div`
    display:flex;
    gap:6px;
    justify-content:flex-end;
    margin-bottom:-25px;
`;

export const PetName = styled.div`
  color: #171770;
  font-weight: 700;
  font-size: 14px;
`;

export const PetMeta = styled.div`
  color: #596080;
  font-size: 12px;
  margin-top: 4px;
`;

export const EmptyText = styled.p`
  margin: 8px 0 12px;
  color: #596080;
  font-size: 13px;
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10001;
`;

export const ModalCard = styled.form`
  width: 520px;
  max-width: 92vw;
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  color: #171770;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const Label = styled.label`
  font-size: 13px;
  color: #5c6280;
`;

export const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid #d6d9e6;
  outline: none;
`;

export const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid #d6d9e6;
  outline: none;
  background: #fff;
`;

export const Textarea = styled.textarea`
  width: 100%;
  box-sizing: border-box;
  min-height: 82px;
  resize: vertical;
  padding: 9px 10px;
  border-radius: 10px;
  border: 1px solid #d6d9e6;
  outline: none;
`;

export const ModalButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
`;

export const BtnCancel = styled.button`
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  background: #eceffa;
  color: #191970;
  font-weight: 600;
  cursor: pointer;
`;

export const BtnSave = styled.button`
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  background: #191970;
  color: #fff;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
     
  &:hover { opacity: 0.7; transform: translateY(-1px); }
`;

export const BtnUpdate = styled.button`
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  background: #337c33;
  color: #fff;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

   &:hover { opacity: 0.7; transform: translateY(-1px); }
`;

export const BtnDelete = styled.button`
  border: none;
  border-radius: 8px;
  padding: 6px 12px;
  background: #cd0606;
  color: #ffffff;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

   &:hover { opacity: 0.7; transform: translateY(-1px); }
`;
