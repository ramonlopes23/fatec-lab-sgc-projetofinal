import styled, { css } from "styled-components";

export const GridWrap = styled.div`
    width: 100%;
`;

export const Grid = styled.div`
    --tile-min-width: ${(props) => props.$tileMinWidth || "91px"};

    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--tile-min-width), 1fr));
    gap: 10px;
    width: 100%;
    align-items: stretch;

    @media (max-width: 420px) {
        gap: 8px;
    }
`;

export const statusStyle = {
    ativo: css`
        background: #e8f5e9;
        border-color: #4caf50;
    `,
    inativo: css`
        background: #ffebee;
        border-color: #f44336;
        opacity: 0.6;
    `,
};

export const Tile = styled.button`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 64px;
    padding: 10px 8px;

    border-radius: 8px;
    background: #f7f8fb;
    border: 2px solid transparent;
    cursor: pointer;

    transition:
        transform 0.12s ease,
        box-shadow 0.12s ease,
        background 0.12s;

    box-shadow: 0 2px 6px rgba(7, 17, 27, 0.04);

    &:hover,
    &:focus {
        transform: translateY(-3px);
        box-shadow: 0 10px 24px rgba(7, 17, 27, 0.08);
        outline: none;
    }

    &:focus-visible {
        outline: 3px solid rgba(100, 120, 255, 0.18);
        outline-offset: 2px;
    }

    /* Tile selecionado */
    ${(props) =>
        props.$selected &&
        css`
            background: linear-gradient(180deg, rgba(106, 87, 255, 0.12), rgba(106, 87, 255, 0.06));
            border-color: #191970;
        `}

    /* Status dinâmico */
  ${(props) => statusStyle[props.$status] || css``}

  @media (max-width: 420px) {
        min-height: 56px;
        padding: 8px 6px;
    }
`;

export const TileLabel = styled.div`
    font-weight: 700;
    margin-bottom: 6px;
    font-size: 14px;
    color: #0f1724;

    @media (max-width: 420px) {
        font-size: 13px;
    }
`;

export const TileBadge = styled.div.attrs({ className: "badge" })`
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.04);
    color: #333;

    @media (max-width: 420px) {
        font-size: 11px;
    }
`;
