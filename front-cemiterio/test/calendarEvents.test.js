import test from "node:test";
import assert from "node:assert/strict";
import { buildCalendarEvents, getCalendarEventsForDate, groupCalendarEventsByDate } from "../src/utils/calendar.js";

test("buildCalendarEvents normalizes and sorts sepultamentos and exumacoes", () => {
    const events = buildCalendarEvents({
        quadras: [{ id: "q-1", number: 2, cemeteryId: "cem-1" }],
        sepultamentos: [
            { id: "sep-1", nome_sep: "Ana", dh_sep: "2026-07-14T08:00", quadra_sep: "q-1", num_sepultura_sep: 4 },
        ],
        exumacoes: [
            {
                id: "exu-1",
                nome_sep: "Bruno",
                dh_exu: "2026-07-14T14:00",
                quadra_sep: "q-1",
                num_sepultura_sep: 5,
                motivo: "Transferência",
            },
        ],
    });

    assert.equal(events.length, 2);
    assert.deepEqual(
        events.map((event) => event.tipo),
        ["Sepultamento", "Exumação"]
    );
    assert.deepEqual(
        events.map((event) => event.horario),
        ["08:00", "14:00"]
    );
    assert.equal(events[0].quadra, "2");
    assert.equal(events[0].blockId, "q-1");
    assert.equal(events[0].cemeteryId, "cem-1");
    assert.equal(events[1].motivo, "Transferência");
});

test("getCalendarEventsForDate returns only events from the requested operational day", () => {
    const events = buildCalendarEvents({
        sepultamentos: [
            { id: "today", nome_sep: "Ana", dh_sep: "2026-07-14T10:00" },
            { id: "tomorrow", nome_sep: "Bia", dh_sep: "2026-07-15T10:00" },
        ],
        exumacoes: [{ id: "today-exu", nome_sep: "Caio", dh_exu: "2026-07-14T08:00" }],
    });

    assert.deepEqual(
        getCalendarEventsForDate(events, "2026-07-14").map((event) => event.sourceId),
        ["today-exu", "today"]
    );
});

test("buildCalendarEvents discards invalid dates and preserves repeated source identifiers", () => {
    const events = buildCalendarEvents({
        sepultamentos: [
            { id: "same", nome_sep: "A", dh_sep: "2026-07-14T08:00" },
            { id: "same", nome_sep: "B", dh_sep: "2026-07-14T09:00" },
            { id: "invalid", dh_sep: "not-a-date" },
        ],
    });

    assert.equal(events.length, 2);
    assert.notEqual(events[0].id, events[1].id);
});

test("groupCalendarEventsByDate creates sorted daily collections", () => {
    const events = buildCalendarEvents({
        sepultamentos: [{ id: "sep", nome_sep: "Ana", dh_sep: "2026-07-14T10:00" }],
        exumacoes: [{ id: "exu", nome_sep: "Bruno", dh_exu: "2026-07-14T08:00" }],
    });
    const grouped = groupCalendarEventsByDate(events);

    assert.deepEqual(
        grouped["2026-07-14"].map((event) => event.horario),
        ["10:00", "08:00"]
    );
});
