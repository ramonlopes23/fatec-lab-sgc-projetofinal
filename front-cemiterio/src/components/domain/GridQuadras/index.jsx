import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Tile, Grid, GridWrap, TileBadge, TileLabel } from "./styles"
import { formatQuadraDisplay, normalizeQuadra, resolveQuadraDisplay } from "../../../utils";

const safeKey = (v, idx) => {
  if (v === undefined || v === null) return `idx-${idx}`;
  if (typeof v === "function") return `${v.name || "fn"}-${idx}`;
  return String(v);
};

function GridQuadras({
  quadrasDesc = [],
  value,
  onChange,
  qid,
  created,
  num,
  quadrasArr,
  columnsMinWidth = 92,
/*   showStatus = true, */
}) {
  const [internalSelected, setInternalSelected] = useState(null);

  const normalizeId = (v) => {
    if (v === undefined || v === null || v === "") return null;
    if (typeof v === "number") return Number.isNaN(v) ? null : v;
    if (/^\d+$/.test(String(v))) return Number(String(v));
    return String(v);
  };

  const normalizedQuadras = useMemo(() => {
    return (quadrasDesc || []).map((q) => ({
      ...normalizeQuadra(q),
      id: normalizeId(q.id),
    }));
  }, [quadrasDesc]);

  const selectedId = value !== undefined ? normalizeId(value) : internalSelected;

  useEffect(() => {
    const resolvedQid = normalizeId(qid);
    if (resolvedQid !== null) {
      setInternalSelected(resolvedQid);
      return;
    }

    const resolvedCreated = normalizeId(created?.id);
    if (resolvedCreated !== null) {
      setInternalSelected(resolvedCreated);
      return;
    }

    const resolvedNum = normalizeId(num);
    if (resolvedNum !== null) {
      setInternalSelected(resolvedNum);
      return;
    }

    if (Array.isArray(quadrasArr) && quadrasArr.length) {
      setInternalSelected(null);
      return;
    }
    setInternalSelected(null);
  }, [qid, created?.id, num, quadrasArr]);

  const handleToggle = (q) => {
    const next = selectedId === q.id ? null : q.id;
    if (onChange) {
      onChange(next == null ? null : normalizedQuadras.find((item) => item.id === next) ?? null);
      return;
    }
    setInternalSelected(next);
  };

  return (
    <GridWrap className="gridquad-wrap">
      <Grid className="gridquad" tileMinWidth={`${columnsMinWidth}px`}>
        {normalizedQuadras.map((q, idx) => {
          const isSelected = selectedId === q.id;
          return (
            <Tile
              key={safeKey(q.id, idx)}
              type="button"
              selected={isSelected}
              status={q.status}
              onClick={() => handleToggle(q)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleToggle(q);
                }
              }}
              aria-pressed={isSelected}
              title={`${formatQuadraDisplay(q, [], "", "Quadra sem número")}${q.status ? ` - ${q.status}` : ""}`}
            >
              <TileLabel>{resolveQuadraDisplay(q, [], "Sem número")}</TileLabel>

            </Tile>
          );
        })}
      </Grid>
    </GridWrap>
  );
}

GridQuadras.propTypes = {
  quadrasDesc: PropTypes.array,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func,
  qid: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  created: PropTypes.object,
  num: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  quadrasArr: PropTypes.array,
  columnsMinWidth: PropTypes.number,
  showStatus: PropTypes.bool,
};

export default GridQuadras;
