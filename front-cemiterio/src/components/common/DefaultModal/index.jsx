import React from "react";
import {
  ModalContent,
  ModalActions,
  ModalField,
  ModalFieldLabel,
  ModalFieldValue,
  ModalGrid,
  ModalOverlay,
  ModalSubtitle,
  ModalTitle,
  ModalViewGrid,
} from "./styles";

function DefaultModalInfoField({ label, value, emptyValue = "-", children }) {
  const content = children ?? value;
  const displayValue = content === undefined || content === null || content === "" ? emptyValue : content;

  return (
    <ModalField>
      <ModalFieldLabel>{label}</ModalFieldLabel>
      <ModalFieldValue>{displayValue}</ModalFieldValue>
    </ModalField>
  );
}

export default function DefaultModal({
  open,
  title,
  subtitle,
  fields = [],
  children,
  onClose,
  width,
  columns = 2,
  closeOnOverlay = true,
}) {
  if (!open) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlay && onClose) onClose();
  };

  return (
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContent $width={width} onClick={(event) => event.stopPropagation()}>
        {title && <ModalTitle>{title}</ModalTitle>}
        {subtitle && <ModalSubtitle>{subtitle}</ModalSubtitle>}

        {fields.length > 0 && (
          <ModalViewGrid $columns={columns}>
            {fields.map(([label, value]) => (
              <DefaultModalInfoField key={label} label={label} value={value} />
            ))}
          </ModalViewGrid>
        )}

        {children}
      </ModalContent>
    </ModalOverlay>
  );
}

export {
  ModalActions as DefaultModalActions,
  ModalGrid as DefaultModalGrid,
  ModalViewGrid as DefaultModalViewGrid,
  DefaultModalInfoField,
};
