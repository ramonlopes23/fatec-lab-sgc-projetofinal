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

export const PetIncludeButtonWrapper = styled.span`
    display: inline-flex;
`;

export const VisuallyHidden = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
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
    display: flex;
    gap: 6px;
    justify-content: flex-end;
    margin-bottom: -25px;
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

export const Field = styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
    grid-column: ${({ $fullWidth }) => ($fullWidth ? "1 / -1" : "auto")};
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

    &:focus {
        border-color: #191970;
        box-shadow: 0 0 0 3px rgba(25, 25, 112, 0.1);
    }

    &:disabled {
        cursor: not-allowed;
        background: #f5f6fa;
        color: #777d96;
    }
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

    &:focus {
        border-color: #191970;
        box-shadow: 0 0 0 3px rgba(25, 25, 112, 0.1);
    }

    &:disabled {
        cursor: not-allowed;
        background: #f5f6fa;
        color: #777d96;
    }
`;

export const PetFormGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;

    @media (max-width: 620px) {
        grid-template-columns: 1fr;
    }
`;

export const PetDetailsGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;

    @media (max-width: 620px) {
        grid-template-columns: 1fr;
    }
`;

export const PetDetailItem = styled.div`
    min-width: 0;
    padding: 0.85rem;
    border: 1px solid rgba(25, 25, 112, 0.1);
    border-radius: 10px;
    background: #fafbff;
`;

export const PetDetailLabel = styled.span`
    display: block;
    margin-bottom: 0.25rem;
    color: #6c7293;
    font-size: 0.75rem;
    font-weight: 700;
`;

export const PetDetailValue = styled.strong`
    display: block;
    overflow-wrap: anywhere;
    color: #191970;
    font-size: 0.9rem;
    font-weight: 700;
`;

export const PetDrawerActions = styled.div`
    position: sticky;
    bottom: -22px;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: auto;
    padding: 1rem 0 0.1rem;
    border-top: 1px solid rgba(25, 25, 112, 0.1);
    background: #fff;

    @media (max-width: 620px) {
        flex-direction: column;

        button {
            width: 100%;
        }
    }
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

    &:hover {
        opacity: 0.7;
        transform: translateY(-1px);
    }
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

    &:hover {
        opacity: 0.7;
        transform: translateY(-1px);
    }
`;
