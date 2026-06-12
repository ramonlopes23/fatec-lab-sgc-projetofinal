import styled from "styled-components";

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.46);
  display: grid;
  place-items: center;
  z-index: 2000;
  padding: 1rem;
`;

export const ModalContent = styled.div`
  width: min(${({ $width }) => $width || "820px"}, 100%);
  max-height: min(86vh, 900px);
  overflow: auto;
  border-radius: 18px;
  background: #ffffff;
  border: 1px solid rgba(25, 25, 112, 0.12);
  box-shadow: 0 30px 80px rgba(15, 23, 42, 0.28);
  padding: 1.1rem;
`;

export const ModalTitle = styled.h3`
  margin: 0 0 0.25rem;
  color: #191970;
  font-size: 1.1rem;
`;

export const ModalSubtitle = styled.p`
  margin: 0 0 1rem;
  color: #6b7280;
  font-size: 0.86rem;
`;

export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns || 2}, minmax(0, 1fr));
  gap: 0.8rem;

  label,
  span {
    color: #6b7280;
    font-size: 0.74rem;
    font-weight: 700;
  }

  > label,
  > div > label,
  > div > span {
    display: block;
    margin-bottom: 0.3rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
  }

  input,
  select,
  textarea {
    width: 100%;
    box-sizing: border-box;
  }

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const ModalViewGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns || 2}, minmax(0, 1fr));
  column-gap: 1.4rem;
  row-gap: 10px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 1rem;
`;

export const ModalField = styled.div`
  border: 1px solid rgba(25, 25, 112, 0.08);
  border-radius: 15px;
  padding: 0.8rem;
  background: #fafbff;
`;

export const ModalFieldLabel = styled.span`
  display: block;
  margin-bottom: 0.22rem;
  color: #6b7280;
  font-size: 0.74rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

export const ModalFieldValue = styled.div`
  color: #191970;
  font-weight: 700;
  font-size: 0.94rem;
  word-break: break-word;
`;
