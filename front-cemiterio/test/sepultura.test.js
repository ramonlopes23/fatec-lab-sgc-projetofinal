import test from "node:test";
import assert from "node:assert/strict";
import { isSepulturaAvailable } from "../src/utils/sepultura.js";

test("occupied common grave remains selectable while it has remaining capacity", () => {
    assert.equal(
        isSepulturaAvailable({
            status: "OCCUPIED",
            bodyCapacity: 1,
            areaType: "COMMON",
            blocked: false,
        }),
        true
    );
});

test("occupied perpetual grave remains selectable for possession title while it has capacity", () => {
    assert.equal(
        isSepulturaAvailable(
            {
                status: "OCCUPIED",
                bodyCapacity: 1,
                areaType: "PERPETUAL",
                blocked: false,
            },
            "Sim"
        ),
        true
    );
});

test("full, blocked and maintenance graves remain unavailable", () => {
    assert.equal(isSepulturaAvailable({ status: "OCCUPIED", bodyCapacity: 0 }), false);
    assert.equal(isSepulturaAvailable({ status: "AVAILABLE", bodyCapacity: 1, blocked: true }), false);
    assert.equal(isSepulturaAvailable({ status: "MAINTENANCE", bodyCapacity: 1 }), false);
});
