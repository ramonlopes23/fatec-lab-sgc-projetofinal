import test from "node:test";
import assert from "node:assert/strict";
import { getCalendarEventKey } from "../src/components/common/Calendar/utils.js";

test("getCalendarEventKey differentiates repeated business identifiers", () => {
    const first = getCalendarEventKey("Sepultamento", "registro-1", 0);
    const repeated = getCalendarEventKey("Sepultamento", "registro-1", 1);

    assert.notEqual(first, repeated);
});

test("getCalendarEventKey is deterministic for records without identifiers", () => {
    const first = getCalendarEventKey("Exumação", null, 2);
    const repeatedRender = getCalendarEventKey("Exumação", undefined, 2);

    assert.equal(first, repeatedRender);
});

test("getCalendarEventKey keeps event types isolated", () => {
    const sepultamento = getCalendarEventKey("Sepultamento", "registro-1", 0);
    const exumacao = getCalendarEventKey("Exumação", "registro-1", 0);

    assert.notEqual(sepultamento, exumacao);
});
