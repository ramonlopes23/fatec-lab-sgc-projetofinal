import styled, { keyframes } from "styled-components";

const spinCircle = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

export const LoadingOverlayRoot = styled.div`
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(10, 14, 30, 0.36);
  backdrop-filter: blur(2px);
  display: grid;
  place-items: center;
  z-index: 20000;
  pointer-events: all;
`;

export const LoadingCard = styled.div`
  width: 190px;
  height: 190px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: grid;
  place-items: center;
`;

export const LoadingCircle = styled.div`
  width: 155px;
  height: 155px;
  position: relative;
  display: grid;
  place-items: center;
  border-radius: 50%;

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    border: 4px solid #191970;
    border-top-color: transparent;
    border-radius: 50%;
    animation: ${spinCircle} 1s linear infinite;
  }
`;

export const LoadingLogo = styled.img`
  width: 120px;
  height: 120px;
  object-fit: contain;
  user-select: none;
  pointer-events: none;
  position: relative;
  z-index: 1;
`;

export const LoadingText = styled.span`
  margin-top: 10px;
  color: #191970;
  font-size: 13px;
  font-weight: 600;
`;
