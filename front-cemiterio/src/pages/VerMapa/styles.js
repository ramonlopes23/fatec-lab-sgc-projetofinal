import styled from "styled-components";

export const Container = styled.div`
  max-width: 1100px;
  margin: 24px auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Title = styled.h2`
  margin: 0;
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

export const QuadraWrapper = styled.div`
  border: 1px solid rgba(25,25,112,0.2);
  border-radius: 10px;
  padding: 20px;
  margin-top: 8px;
  background: #fff;
  position:relative;
`;

export const QuadraTitle = styled.div`
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 12px;
  color:#191970;
`;

export const QuadraInfo = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  align-items: center;
  z-index: 2;
`;

export const InfoPill = styled.span`
  background: #f1f3ff;
  color: #191970;
  padding: 6px 10px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  border: 1px solid rgba(0,0,0,0.06);
`;

export const CovaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
  gap: 12px;
  align-items: center;
`;

/* const statusColors = {
  ocupada: "#000",
  "disponível": "#9e9e9e",
  "indisponível": "#c55",
  reservada: "#d2b24a",
  default: "#ccc"
};
 */

export const CovaItem = styled.button`
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  width: 64px;
  height: ${p => (p.hasPets ? "88px" : "70px")};
  border-radius: 8px;
  cursor: pointer;
  box-sizing: border-box;
  position:relative;
  padding-top:12px;

  background: ${p => {
    const s = String(p.status || "").toLowerCase();
    if (s === "reservada") return "#d2b24a";
    if (s === "particular_ocupada") return "#000";
    if (s === "ocupada") return "#000";
    if (s === "indisponível" || s === "indisponivel") return "#aa1818";
    if (s === "disponível" || s === "disponivel" || s === "livre") return "#9e9e9e";
    return "#f4f8f5";
  }};

  color: ${p => {
    const s = String(p.status || "").toLowerCase();
    if (s === "reservada") return "#000";
    if (s === "particular_ocupada" || s === "ocupada" || s === "indisponível" || s === "indisponivel") return "#fff";
    return "#191970"
  }};

  border: ${p => (p.borderColor ? `${p.borderWidth ?? 2}px solid ${p.borderColor}` : "transparent")};
  opacity: ${p => (p.$dimmed ? 0.28 : 1)};
  outline: ${p => (p.$selected ? "3px solid rgba(25, 25, 112, 0.28)" : "none")};
  outline-offset: 3px;
  transition: transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease, opacity 180ms ease;
  svg { 
    width: 14px; 
    height: 14px; 
    flex-shrink:0; 
  }

  & .cova-number {
    position:absolute;
    top: 4px;
    right: 6px;
    margin: 0;
    font-weight: 700;
    font-size: 17px;
    line-height: 1;
    pointer-events: none;
  }

  & .cova-capacity{
    font-size: 15px;
    font-weight: 600;
    line-height: 0.9;
    color: inherit;
    opacity: 0.9;
    display:inline-flex;
    align-items:center;
    gap:4px;
  }

  & .cova-petCap{    
    font-size: 10px;
    font-weight: 600;
    line-height: 0.9;
    color: inherit;
    opacity: 0.9;
    display:inline-flex;
    align-items:center;
    gap:4px;
  }

  & .cova-divider { 
    width: 80%;
    height:1px;
    background:currentColor;
    opacity:0.35;
    margin: 2px 0 1px;
  }

  &:hover {
    transform: translateY(-2px);
    border-color:#000;
    border-width:1.5px;
    box-shadow: 0 10px 20px rgba(15,13,58,0.12);
  }
`;

export const LegendRow = styled.div`
  display:flex;
  gap:18px;
  align-items:center;
  margin-top:12px;
  flex-wrap:wrap;
`;

export const LegendItem = styled.div`
  display:flex;
  gap:8px;
  align-items:center;
  font-size:13px;
  background:transparent;
  box-sizing:border-box;

  & > span.color {
    width:18px;
    height:18px;
    border-radius:4px;
    background: ${({ color }) => color || "#ccc"};
    border: ${({ borderColor, borderWidth }) => borderColor ? `${borderWidth ?? 2}px solid ${borderColor}` : "none"};
    box-sizing: border-box;
  }
`;


export const SmallSelect = styled.select`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #d6d9e6;
  background: #fff;
  font-size: 14px;
  outline: none;
  margin-right:10px;
  margin-bottom:10px;
`;

export const ThreeCols = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Button = styled.button`
  background: #191970;
  color: #fff;
  border: none;
  padding: 12px 28px;
  border-radius: 24px;
  margin-right:10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.7; }
`;

export const BtnClose = styled.button`
  gap:8px;
  font-size:15px;
  background: #e6e6f1ff;
  color: #191970;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);
  &:hover { opacity: 0.7; transform: translateY(-1px); }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
  }
`;

export const LegendButton = styled.button`
  display:flex;
  gap:8px;
  align-items:center;
  font-size:13px;
  background:${({ $active }) => ($active ? "#eef2ff" : "#fff")};
  color:#171770;
  box-sizing:border-box;
  border:1px solid ${({ $active }) => ($active ? "#27348e" : "#d6d9e6")};
  border-radius:8px;
  padding:6px 9px;
  cursor:pointer;
  font-weight:${({ $active }) => ($active ? 700 : 500)};
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;

  & > span.color {
    width:18px;
    height:18px;
    border-radius:4px;
    background: ${({ color }) => color || "#ccc"};
    border: ${({ borderColor, borderWidth }) => borderColor ? `${borderWidth ?? 2}px solid ${borderColor}` : "none"};
    box-sizing: border-box;
  }

  &:hover {
    transform: translateY(-1px);
    border-color:#27348e;
  }
`;

export const ActiveFilterPill = styled.button`
  border: 1px solid rgba(25, 25, 112, 0.18);
  border-radius: 999px;
  padding: 6px 10px;
  background: #f7f8ff;
  color: #191970;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    background: #eef2ff;
  }
`;

export const EmptyMapState = styled.div`
  min-height: 160px;
  display: grid;
  place-items: center;
  color: #5f637a;
  border: 1px dashed #d6d9e6;
  border-radius: 8px;
  background: #fafbff;
  font-size: 14px;
`;

export const ButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
`;

export const BtnPrimaryClose = styled.button`
  background: #e6e6f1ff;
  color: #191970;
  border-color:#191970;
  border: 2px;
  padding: 12px 28px;
  border-radius: 24px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);

  &:hover { opacity: 0.7; }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset:0;
  width:100%;
  height:100%;
  background: rgba(0,0,0,0.5);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index: 1000;
`;

const baseInput = `
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #d6d9e6;
  background: #fff;
  outline: none;
  font-size: 14px;
  color: #222;
`;

export const Input = styled.input`
  ${baseInput}
  border-color: ${({ $invalid }) => ($invalid ? "#b42318" : "#d6d9e6")};
  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "#b42318" : "#7b63ff")};
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;

export const Label = styled.label`
  font-weight: normal;
  margin-left: 5px;
`;

export const Textarea = styled.textarea`
  ${baseInput}
  border-color: ${({ $invalid }) => ($invalid ? "#b42318" : "#d6d9e6")};
  min-height: 82px;
  border-radius: 12px;
  resize: vertical;
  padding-top: 10px;
  &:focus {
    border-color: ${({ $invalid }) => ($invalid ? "#b42318" : "#191970")};
    box-shadow: 0 2px 8px rgba(123,99,255,0.08);
  }
`;

export const FieldErrorText = styled.small`
  display: block;
  margin: 5px 0 0 5px;
  color: #b42318;
  font-size: 12px;
  line-height: 1.35;
`;

export const FormStyled = styled.form`
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 6px 18px rgba(22,28,70,0.06);
  border: 1px solid #eee;
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
    font-size: 14px;
    color: #6b6f85;
    margin-bottom: 6px;
  }
`;

export const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const ModalContent = styled.div`
  color: #171770;
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  overflow: auto;
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-sizing: border-box;
`;

export const DrawerOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(12, 16, 36, 0.28);
  display: flex;
  justify-content: flex-end;
`;

export const CovaDrawer = styled.aside`
  width: min(440px, 100vw);
  height: 100%;
  background: #fff;
  color: #191970;
  box-shadow: -18px 0 42px rgba(0, 0, 0, 0.18);
  display: flex;
  flex-direction: column;
  animation: drawerIn 180ms ease-out;

  @keyframes drawerIn {
    from {
      transform: translateX(24px);
      opacity: 0.72;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;

export const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding: 18px 18px 14px;
  border-bottom: 1px solid #e6e8f2;
`;

export const DrawerTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #191970;
    font-size: 18px;
  }

  span {
    color: #6b6f85;
    font-size: 13px;
  }
`;

export const DrawerCloseButton = styled.button`
  border: 0;
  background: #eef2ff;
  color: #191970;
  border-radius: 8px;
  padding: 8px 10px;
  cursor: pointer;
  font-weight: 800;

  &:hover {
    background: #e2e7ff;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const DrawerBody = styled.div`
  flex: 1;
  overflow: auto;
  padding: 16px 18px 22px;
`;

export const DrawerSection = styled.section`
  padding: 12px 0;
  border-bottom: 1px solid #eef0ff;

  &:last-child {
    border-bottom: 0;
  }
`;

export const DrawerSectionTitle = styled.h3`
  margin: 0 0 10px;
  color: #191970;
  font-size: 20px;
`;

export const SepDivider = styled.hr`
  border: 0;
  border-top: 1px solid #eee;
  margin: 12px 0;
`;

export const SepHeader = styled.div`
  margin-bottom: 8px;
  font-weight: 600;
`;

export const SepList = styled.div`
  display: flex;
  flex-direction:column;
  gap: 2px;
  width:100%;
  margin-bottom: 10px;
`;

export const SepItemButton = styled.button`
  padding: 8px 10px;
  border-radius: 6px;
  border: ${p => (p.active ? "2px solid #27348E" : "1px solid #ddd")};
  background: ${p => (p.active ? "#f4f7ff" : "#fff")};
  cursor: pointer;
  display: flex;
  align-items: center;
  width:100%;
  gap:12px;
  text-align:left;
`;

export const SepItemName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #171770;
`;

export const SepItemDate = styled.div`
  font-size: 11px;
  color: #666;
  margin-top: 4px;
`;

export const SepItemRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* gap: 12px; */
  padding: 6px 0px;
  width:100%;
`;

export const SepToggle = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #27348E;
  font-size: 16px;
`;

export const ModalButtonsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
`;

export const QuadraDropdownWrapper = styled.div`
  position: relative;
`;

export const MapToolbar = styled.div`
  margin: 12px 0;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
`;

export const ToolbarLabel = styled.label`
  font-weight: 600;
  color: #171770;
`;

export const DropdownIcon = styled.span`
  margin-left: 8px;
`;

export const QuadraSelectButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #d6d9e6;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #191970;
`;

export const QuadraDropdown = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 8px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #d6d9e6;
  padding: 16px;
  min-width: 400px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
  z-index: 999;
  transition: all .5s ease;
  opacity: ${props => props.$isOpen ? 1 : 0};
  transform: ${props => props.$isOpen ? "scale(1) translateY(0)" : "scale(0.95) translateY(-10px)"};
  visibility: ${props => props.$isOpen ? "visible" : "hidden"};
  pointer-events: ${props => props.$isOpen ? "auto" : "none"};
  transition: opacity 0.24s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.24s cubic-bezier(0.4, 0, 0.2, 1),
              visibility 0.24s cubic-bezier(0.4, 0, 0.2, 1);
`;

export const BtnAction = styled.button`
    display:flex;
    gap:8px;
    margin-top:16px;
    margin-left:auto;
    align-items:center;
    border:2px solid rgba(10, 0, 196, 0.17);
    border-radius:10px;
    padding:10px 18px;
    background:#fff;
    color:#191970;
    font-weight:600;
    cursor:pointer;
    box-shadow:0 6px 16px rgba(15,13,58,0.18);
    transition:transform 0.12s ease, opacity 0.11s ease;
    position: static; 
    right: auto;

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

export const BtnActionCancel = styled.button`
    display:flex;
    gap:8px;
    margin-top:16px;
    margin-right:20px;
    align-items:center;
    border:2px solid rgba(10, 0, 196, 0.17);
    border-radius:10px;
    padding:10px 18px;
    background:#fff;
    color:#191970;
    font-weight:600;
    cursor:pointer;
    box-shadow:0 6px 16px rgba(15,13,58,0.18);
    transition:transform 0.12s ease, opacity 0.11s ease;
    position: static; 
    right: auto;

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

export const BtnAdd = styled.button`
  display:flex;
  gap:8px;
  font-size:15px;
  align-items:center;
  margin-left: auto; 
  margin-top: 15px;
  background: #191970;
  color: #fff;
  border: none;
  padding: 8px 16px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  box-shadow: 0 6px 16px rgba(15,13,58,0.18);
  position: static; 
  right: auto;
  &:hover { opacity: 0.7; transform: translateY(-1px); }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    transform: none;
  }
`;

export const BtnDanger = styled(BtnAdd)`
  background: #cf142b;
`;

export const LegendActions = styled.div`
  margin-left: auto;
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 720px) {
    width: 100%;
    margin-left: 0;
  }
`;

export const CemeteryForm = styled.form`
  margin: 12px 0 16px;
  padding: 12px;
  border: 1px solid #d9d9ea;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: flex-end;
  background: #fff;
`;

export const CompactField = styled(Field)`
  min-width: ${({ $minWidth }) => $minWidth || "auto"};
  margin: 0;
`;

export const InlineCheckLabel = styled(Label)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CompactButton = styled(BtnAdd)`
  padding: 8px 10px;
`;

export const CompactCancelButton = styled(BtnActionCancel)`
  padding: 8px 10px;
`;

export const ModalSurface = styled.div`
  color: #171770;
  width: ${({ $width }) => $width || "520px"};
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  overflow: auto;
  background: #fff;
  padding: 18px;
  border-radius: 8px;
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.16);
  box-sizing: border-box;
`;

export const ModalTitle = styled.h3`
  margin-top: 0;
  color: #191970;
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 12px;
`;

export const ModalGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

export const ModalGridFull = styled.div`
  grid-column: span 2;

  @media (max-width: 680px) {
    grid-column: auto;
  }
`;

export const SelectMedium = styled(SmallSelect)`
  width: 200px;
  border-color: ${({ $invalid }) => ($invalid ? "#b42318" : "#d6d9e6")};
`;

export const SelectSmall = styled(SmallSelect)`
  width: 80px;
`;

export const InputTiny = styled(Input)`
  width: 70px;
`;

export const InputMedium = styled(Input)`
  width: 200px;
`;

export const ToggleStatusLabel = styled.button`
  position: relative;
  width: 54px;
  height: 30px;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  background: ${({ $active }) => ($active ? "#191970" : "#c4c8d8")};
  transition: background 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${({ $active }) => ($active ? "27px" : "3px")};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    transition: left 0.2s ease;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const ToggleStatusRow = styled.div`
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 12px;
  border: 1px solid #e6e8f2;
  border-radius: 10px;
  background: #f9faff;
`;

export const ToggleStatusText = styled.span`
  font-size: 13px;
  color: #2a2f45;
  font-weight: 600;
`;


export const SepItemContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

export const SepDetailPanel = styled.div`
  padding: 8px 12px 12px;
  border-left: 3px solid #eef0ff;
  background: #fff;
`;

export const SepDetailText = styled.p`
  margin: 6px 0;
`;

export const ChartModalContent = styled(ModalSurface)`
  width: 90%;
  max-width: 500px;
  max-height: 60vh;
  border-radius: 12px;
  padding: 20px;
`;

export const ChartModalHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

export const ChartModalTitle = styled.h2`
  margin: 0;
  color: #191970;
  font-size: 25px;
  text-align: center;
`;

export const ChartModalBody = styled.div`
  display: flex;
  gap: 24px;
  align-items: flex-start;
  flex: 1;

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

export const ChartArea = styled.div`
  flex: 1;
  min-width: 300px;
`;

export const ChartLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 180px;
  padding-top: 70px;

  @media (max-width: 720px) {
    padding-top: 0;
  }
`;
