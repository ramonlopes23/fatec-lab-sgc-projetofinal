import test from "node:test";
import assert from "node:assert/strict";
import {
    buildDashboardMovementSeries,
    buildOperationalProcesses,
    getGraveSituationCounts,
    getOperationalProcessKey,
    isCompletedSepultamento,
    sortOperationalProcesses,
} from "../src/utils/dashboard.js";

test("getOperationalProcessKey keeps opaque identifiers isolated by type", () => {
    assert.notEqual(
        getOperationalProcessKey({ id: "same-id", _type: "Sepultamento" }),
        getOperationalProcessKey({ id: "same-id", _type: "Exumação" })
    );
});

test("buildOperationalProcesses joins domain data and keeps only actionable records", () => {
    const processes = buildOperationalProcesses({
        falecidos: [{ id: "fal-1", nome_fal: "Maria Oliveira" }],
        blocks: [{ id: "q-2", number: 2 }],
        sepultamentos: [
            {
                id: "sep-1",
                falecido_id: "fal-1",
                dh_sep: "2026-07-14T08:00",
                quadra_sep: "q-2",
                num_sepultura_sep: 15,
                status: "Pendente",
                confirmado: false,
            },
            { id: "sep-finished", dh_sep: "2026-07-14T07:00", status: "Concluído", confirmado: true },
        ],
        velorios: [
            {
                id: "vel-1",
                falecido_id: "fal-1",
                dh_inicio_velorio: "2026-07-14T10:30",
                local_velorio: "Sala 02",
                status: "Pendente",
            },
        ],
        exumacoes: [{ id: "exu-finished", dh_exu: "2026-07-14T14:00", confirmado: "true" }],
    });

    assert.deepEqual(
        processes.map((process) => process.id),
        ["sep-1", "vel-1"]
    );
    assert.equal(processes[0]._type, "Sepultamento");
    assert.equal(processes[0].nome_fal, "Maria Oliveira");
    assert.equal(processes[0].quadra_num, "2");
    assert.equal(processes[0].num_sepultura, "15");
    assert.equal(processes[1].local, "Sala 02");
});

test("sortOperationalProcesses orders valid dates and leaves undated records last", () => {
    const records = [
        { id: "undated" },
        { id: "exumacao", dh_exu: "2026-07-14T14:00" },
        { id: "sepultamento", dh_sep: "2026-07-14T08:00" },
        { id: "velorio", dh_inicio_velorio: "2026-07-14T10:30" },
    ];

    assert.deepEqual(
        sortOperationalProcesses(records).map((record) => record.id),
        ["sepultamento", "velorio", "exumacao", "undated"]
    );
    assert.equal(records[0].id, "undated");
});

test("isCompletedSepultamento accepts confirmed and concluded records but excludes exhumed ones", () => {
    assert.equal(isCompletedSepultamento({ confirmado: true }), true);
    assert.equal(isCompletedSepultamento({ status: "Concluído" }), true);
    assert.equal(isCompletedSepultamento({ status: "Pendente" }), false);
    assert.equal(isCompletedSepultamento({ confirmado: true, foi_exumado: true }), false);
});

test("buildDashboardMovementSeries aggregates sepultamentos and exumacoes in the requested window", () => {
    const series = buildDashboardMovementSeries({
        referenceDate: "2026-07-14T18:00",
        days: 3,
        sepultamentos: [
            { dh_sep: "2026-07-12T08:00" },
            { dh_sep: "2026-07-14T09:00" },
            { dh_sep: "2026-07-14T15:00" },
            { dh_sep: "invalid" },
        ],
        exumacoes: [{ dh_exu: "2026-07-13T10:00" }, { dh_exu: "2026-07-14T14:00" }],
    });

    assert.deepEqual(series.labels, ["12/07", "13/07", "14/07"]);
    assert.deepEqual(series.sepultamentos, [1, 0, 2]);
    assert.deepEqual(series.exumacoes, [0, 1, 1]);
});

test("buildDashboardMovementSeries filters records by cemetery and resolves linked exumacoes", () => {
    const series = buildDashboardMovementSeries({
        referenceDate: "2026-07-14T18:00",
        days: 2,
        selectedCemeteryId: "cem-1",
        blocks: [
            { id: "q-1", cemeteryId: "cem-1" },
            { id: "q-2", cemeteryId: "cem-2" },
        ],
        sepultamentos: [
            { id: "sep-1", quadra_sep: "q-1", dh_sep: "2026-07-13T08:00" },
            { id: "sep-2", quadra_sep: "q-2", dh_sep: "2026-07-14T09:00" },
        ],
        exumacoes: [
            { sepultamento_id: "sep-1", dh_exu: "2026-07-14T10:00" },
            { quadra_sep: "q-2", dh_exu: "2026-07-14T11:00" },
        ],
    });

    assert.deepEqual(series.sepultamentos, [1, 0]);
    assert.deepEqual(series.exumacoes, [0, 1]);
});

test("getGraveSituationCounts returns exclusive counts for the selected cemetery", () => {
    const counts = getGraveSituationCounts({
        selectedCemeteryId: "cem-1",
        blocks: [
            { id: "q-1", cemeteryId: "cem-1" },
            { id: "q-2", cemeteryId: "cem-2" },
        ],
        graves: [
            { id: "available", blockId: "q-1", number: 1, bodyCapacity: 2, status: "AVAILABLE", areaType: "COMMON" },
            { id: "occupied", blockId: "q-1", number: 2, bodyCapacity: 0, status: "OCCUPIED", areaType: "COMMON" },
            { id: "private", blockId: "q-1", number: 3, bodyCapacity: 1, status: "AVAILABLE", areaType: "PERPETUAL" },
            {
                id: "maintenance",
                block: { id: "q-1" },
                number: 4,
                bodyCapacity: 1,
                status: "MAINTENANCE",
                areaType: "COMMON",
            },
            {
                id: "other-cemetery",
                blockId: "q-2",
                number: 5,
                bodyCapacity: 1,
                status: "AVAILABLE",
                areaType: "COMMON",
            },
        ],
    });

    assert.deepEqual(counts, { available: 1, occupied: 1, private: 1, unavailable: 1, total: 4 });
});
