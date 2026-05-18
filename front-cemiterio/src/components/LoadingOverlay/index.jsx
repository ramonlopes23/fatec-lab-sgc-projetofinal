import React from "react";
import sgcLogo from "../../assets/SGCv2.png";
import {
  LoadingOverlayRoot,
  LoadingCard,
  LoadingCircle,
  LoadingLogo,
  LoadingText,
} from "./styles";

export default function LoadingOverlay({
  open = true,
  logoSrc = sgcLogo,
  alt = "Carregando",
  label = "",
}) {
  if (!open) {
    return null;
  }

  return (
    <LoadingOverlayRoot role="status" aria-live="polite" aria-busy="true">
      <LoadingCard>
        <LoadingCircle data-loader="logo-circle">
          <LoadingLogo src={logoSrc} alt={alt} />
        </LoadingCircle>
        {label ? <LoadingText>{label}</LoadingText> : null}
      </LoadingCard>
    </LoadingOverlayRoot>
  );
}
