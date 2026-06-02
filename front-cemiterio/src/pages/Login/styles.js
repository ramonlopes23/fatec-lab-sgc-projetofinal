import styled from "styled-components";

export const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #efefef;
  font-family: "Satoshi", sans-serif;

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const BrandSide = styled.section`
  display: grid;
  place-items: center;
  padding: 32px;
`;
 
export const BrandWrap = styled.div`
  width: min(92%, 560px);
  text-align: center;
  color: #070a3a;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
`;

export const BrandLogo = styled.img`
  width: 800px;
  height: auto;
  object-fit: contain;
  margin: 0;
  display: block;
  margin-top:-110px;
`;

export const PrefeituraLogo = styled.img`
  width: 800px;
  height: 300px;
  object-fit: contain;
  margin: 0;
  display: block;
  margin-top:-100px;
`;

export const BrandSubtitle = styled.p`
  margin: 0;
  margin-top: -110px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #191970;
`;

export const FormSide = styled.section`
  display: grid;
  place-items: center;
  padding: 32px;
`;

export const Card = styled.form`
  width: min(92%, 420px);
  background: #f7f7f7;
  margin-right:120px;
  border: 1px solid #191970;
  border-radius: 14px;
  box-shadow: 2px 3px 0 rgba(0, 0, 0, 0.22);
  padding: 80px 60px 80px;
`;

export const Title = styled.h1`
  margin: 0 0 14px;
  text-align: center;
  font-size: 44px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -0.5px;
  color: #191970;
  font-family: "Satoshi", sans-serif;
`;

export const Field = styled.div`
  margin-bottom: 12px;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  color: #191970;
  font-size: 14px;
  font-weight: 600;
  font-family: "Satoshi", sans-serif;
`;

export const Input = styled.input`
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #9fa4b8;
  padding: 0 12px;
  font-size: 14px;
  color: #2a2f4f;
  background: #f6f6f6;
  outline: none;
  box-sizing: border-box;
  font-family: "Satoshi", sans-serif;

  &::placeholder {
    color: #8a8fa4;
  }

  &:focus {
    border-color: #191970;
    box-shadow: 0 0 0 3px rgba(13, 21, 87, 0.12);
  }
`;

export const Select = styled.select`
  width: 100%;
  height: 42px;
  border-radius: 10px;
  border: 1px solid #9fa4b8;
  padding: 0 12px;
  font-size: 14px;
  color: #2a2f4f;
  background: #f6f6f6;
  outline: none;
  box-sizing: border-box;
  font-family: "Satoshi", sans-serif;

  &:focus {
    border-color: #191970;
    box-shadow: 0 0 0 3px rgba(13, 21, 87, 0.12);
  }
`;

export const HelperLink = styled.button`
  appearance: none;
  border: 0;
  background: transparent;
  padding: 0;
  margin: 2px 0 10px;
  color: #131844;
  font-size: 13px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-family: "Satoshi", sans-serif;
`;

export const ErrorText = styled.p`
  margin: 0 0 10px;
  color: #b11212;
  font-size: 13px;
  font-weight: 600;
  font-family: "Satoshi", sans-serif;
`;

export const PrimaryButton = styled.button`
  width: 100%;
  height: 42px;
  border: 0;
  border-radius: 10px;
  background: #191970;
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  font-family: "Satoshi", sans-serif;

  &:disabled {
    opacity: 0.72;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  width: 100%;
  height: 42px;
  margin-top: 10px;
  border-radius: 10px;
  border: 1px solid #40476b;
  background: #f2f2f2;
  color: #191970;
  font-size: 16px;
  font-weight: 600;
  line-height: 1;
  cursor: pointer;
  font-family: "Satoshi", sans-serif;
`;