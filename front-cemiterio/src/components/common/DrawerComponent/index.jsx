import React from "react";
import { FaTimes } from "react-icons/fa";
import {
  DrawerActionRow,
  DrawerBody,
  DrawerCloseButton,
  DrawerHeader,
  DrawerHeaderCopy,
  DrawerOverlay,
  DrawerPanel,
  DrawerSection,
  DrawerSectionTitle,
  DrawerSubtitle,
  DrawerTitle,
} from "./styles";

function DrawerComponent({
  open,
  title,
  subtitle,
  children,
  onClose,
  closeButton,
  closeLabel = "Fechar",
  closeOnOverlayClick = true,
  width,
  zIndex,
  overlay,
  panelColor,
  panelShadow,
  headerPlain = false,
  bodyAs,
  bodyProps = {},
  bodyPadding,
  bodyDisplay,
  bodyGap,
}) {
  if (!open) return null;

  const handleOverlayClick = () => {
    if (closeOnOverlayClick && onClose) onClose();
  };

  return (
    <DrawerOverlay $zIndex={zIndex} $overlay={overlay} onClick={handleOverlayClick}>
      <DrawerPanel
        $width={width}
        $color={panelColor}
        $shadow={panelShadow}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || subtitle || onClose || closeButton) && (
          <DrawerHeader $plain={headerPlain}>
            <DrawerHeaderCopy>
              {title ? <DrawerTitle>{title}</DrawerTitle> : null}
              {subtitle ? <DrawerSubtitle>{subtitle}</DrawerSubtitle> : null}
            </DrawerHeaderCopy>

            {closeButton || (
              <DrawerCloseButton type="button" title={closeLabel} aria-label={closeLabel} onClick={onClose}>
                <FaTimes size={14} />
              </DrawerCloseButton>
            )}
          </DrawerHeader>
        )}

        <DrawerBody
          as={bodyAs}
          $padding={bodyPadding}
          $display={bodyDisplay}
          $gap={bodyGap}
          {...bodyProps}
        >
          {children}
        </DrawerBody>
      </DrawerPanel>
    </DrawerOverlay>
  );
}

function Section({ title, children, compact = false, titleSize }) {
  return (
    <DrawerSection $compact={compact}>
      {title ? <DrawerSectionTitle $size={titleSize}>{title}</DrawerSectionTitle> : null}
      {children}
    </DrawerSection>
  );
}

DrawerComponent.Section = Section;
DrawerComponent.ActionRow = DrawerActionRow;

export { DrawerActionRow, DrawerSection, DrawerSectionTitle };
export default DrawerComponent;
