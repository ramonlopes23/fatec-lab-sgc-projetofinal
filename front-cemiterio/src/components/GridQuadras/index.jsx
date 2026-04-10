import React, { useState, useEffect, useMemo, useRef } from "react";
import PropTypes from "prop-types";
import { Tile, Grid, GridWrap, TileBadge, TileLabel } from "./styles"

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
  const lastEmittedRef = useRef(null);

  const normalizeId = (v) => {
    if (v === undefined || v === null || v === "") return null;
    if (typeof v === "number") return Number.isNaN(v) ? null : v;
    if (/^\d+$/.test(String(v))) return Number(String(v));
    return String(v);
  };

  const normalizedQuadras = useMemo(() => {
    return (quadrasDesc || []).map((q) => ({
      ...q,
      id: normalizeId(q.id),
      num_quadra: q.num_quadra ?? q.nome ?? String(q.id ?? ""),
    }));
  }, [JSON.stringify(quadrasDesc)]);

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
  }, [qid, created, num, JSON.stringify(quadrasArr)]);

  useEffect(() => {
    if (value === undefined) return;
    const next = normalizeId(value);
    if (String(next) === String(internalSelected)) return;
    setInternalSelected(next);
  }, [value]);

  useEffect(() => {
    if (!onChange) return;
    const item = normalizedQuadras.find((q) => q.id === internalSelected) ?? null;
    const idToEmit = item?.id ?? null;
    if (String(lastEmittedRef.current) === String(idToEmit)) return;
    lastEmittedRef.current = idToEmit;
    onChange(item);
  }, [internalSelected, JSON.stringify(normalizedQuadras)]);

  const handleToggle = (q) => {
    const next = internalSelected === q.id ? null : q.id;
    setInternalSelected(next);
  };

  return (
    <GridWrap className="gridquad-wrap">
      <Grid className="gridquad" tileMinWidth={`${columnsMinWidth}px`}>
        {normalizedQuadras.map((q, idx) => {
          const isSelected = internalSelected === q.id;
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
              title={`${q.num_quadra}${q.status ? ` - ${q.status}` : ""}`}
            >
              <TileLabel>{q.num_quadra}</TileLabel>

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
