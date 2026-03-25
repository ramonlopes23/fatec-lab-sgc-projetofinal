import styled from "styled-components";

export const Container = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
`;

export const FormStyled = styled.form`
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(22,28,70,0.06);
`;


export const Title = styled.h2`
  text-align: center;
  font-size: 20px;
  letter-spacing: 2px;
  margin-bottom: 18px;
  color: #191970;
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
    border-color: #7b63ff;
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;

export const Select = styled.select`
  ${baseInput}
  border-radius: 18px;
  &:focus {
    border-color: #7b63ff;
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

  &:hover { opacity: 0.95; }
`;

export const Avatar = styled.img`
  width: 250px;
  height: 250px;
  border-radius: 50%;
  display:block;
  margin:8px auto 0;
  margin-top: 8px;
  margin-bottom:10px;
  object-fit: cover;
  border: 1px solid #e6e8f2;

  @media (max-width: 880px) {
    width: 140px;
    height: 140px;
  }

`;