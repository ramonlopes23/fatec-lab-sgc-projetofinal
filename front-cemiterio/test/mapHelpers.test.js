import test from "node:test";
import assert from "node:assert/strict";
import {
  resolveBlockId,
  normalizeCovaStatus,
  getSepultadosCount,
  getSepultadosCountBySep,
  getPetsCountBySep,
  getCovaDisplayMeta,
  getSepCountsByQuadra,
  buildQuadrasFromData,
  getVisibleBlocks,
} from "../src/utils/mapHelpers.js";

const sepultamentosAll = [
  { id: 1, quadra_sep: 10, num_sepultura_sep: 5, foi_exumado: false },
  { id: 2, quadra_sep: 10, num_sepultura_sep: 5, foi_exumado: false },
  { id: 3, quadra_sep: 10, num_sepultura_sep: 6, foi_exumado: true },
  { id: 4, quadra_sep: 11, num_sepultura_sep: 1, foi_exumado: false },
  { quadra_sep: 12, num_sepultura_sep: 2, dh_sep: "2024-10-01T10:00:00" },
];

const petsAll = [
  { id: "p1", quadra_sep: 10, num_sepultura_sep: 5, foi_exumado: false },
  { id: "p2", quadra_sep: 10, num_sepultura_sep: 5, foi_exumado: false },
  { id: "p3", quadra_sep: 11, num_sepultura_sep: 1, foi_exumado: true },
  { quadra_sep: 12, num_sepultura_sep: 2, dh_sep_pet: "2024-10-02T10:00:00" },
];

test("resolveBlockId returns the best identifier from objects and primitives", () => {
  assert.equal(resolveBlockId({ id: 7 }), 7);
  assert.equal(resolveBlockId({ blockId: 8 }), 8);
  assert.equal(resolveBlockId({ id: null, blockId: "9" }), "9");
  assert.equal(resolveBlockId(15), 15);
  assert.equal(resolveBlockId(null), "");
});

test("normalizeCovaStatus maps backend status variants to UI status", () => {
  assert.equal(normalizeCovaStatus("reservada"), "reservada");
  assert.equal(normalizeCovaStatus("indisponível"), "indisponivel");
  assert.equal(normalizeCovaStatus("OCUPADA"), "ocupada");
  assert.equal(normalizeCovaStatus("disponivel"), "livre");
  assert.equal(normalizeCovaStatus("Livre"), "livre");
  assert.equal(normalizeCovaStatus("foo"), "foo");
  assert.equal(normalizeCovaStatus(0), "0");
  assert.equal(normalizeCovaStatus(null), "livre");
});

test("getSepultadosCount counts unique active sepultamentos per quadra", () => {
  assert.equal(getSepultadosCount(sepultamentosAll, 10), 2);
  assert.equal(getSepultadosCount(sepultamentosAll, { num_quadra: 11 }), 1);
  assert.equal(getSepultadosCount(sepultamentosAll, 12), 1);
  assert.equal(getSepultadosCount(sepultamentosAll, 99), 0);
});

test("getSepultadosCountBySep counts active sepultamentos for a specific grave", () => {
  const cova = { numero: 5, sep: { id: "sep-5" } };
  assert.equal(getSepultadosCountBySep(cova, 10, sepultamentosAll), 3);
  assert.equal(getSepultadosCountBySep({ numero: 1 }, 11, sepultamentosAll), 1);
  assert.equal(getSepultadosCountBySep({ numero: 2 }, 12, sepultamentosAll), 1);
  assert.equal(getSepultadosCountBySep(null, 10, sepultamentosAll), 0);
});

test("getPetsCountBySep counts unique active pets per grave", () => {
  assert.equal(getPetsCountBySep({ numero: 5 }, 10, petsAll), 2);
  assert.equal(getPetsCountBySep({ numero: 1 }, 11, petsAll), 0);
  assert.equal(getPetsCountBySep(null, 10, petsAll), 0);
});

test("getCovaDisplayMeta derives status and counts from grave and placement data", () => {
  const cova = {
    id: 99,
    numero: 5,
    capacidade: 2,
    sep: { id: "sep-5" },
    grave: {
      status: "OCCUPIED",
      bodyCapacity: 2,
      areaType: "COMMON",
      blocked: false,
    },
  };

  const meta = getCovaDisplayMeta(cova, { id: 10, num_quadra: 10 }, sepultamentosAll, petsAll);

  assert.equal(meta.displayStatus, "ocupada");
  assert.equal(meta.sepCount, 3);
  assert.equal(meta.petCount, 2);
  assert.equal(meta.capacidadeTotal, 2);
  assert.equal(meta.occupiedCount, 3);
});

test("getCovaDisplayMeta prefers blocked and perpetual states", () => {
  const blocked = getCovaDisplayMeta(
    { numero: 1, grave: { status: "AVAILABLE", bodyCapacity: 1, areaType: "COMMON", blocked: true } },
    { id: 11, num_quadra: 11 },
    sepultamentosAll,
    petsAll
  );
  assert.equal(blocked.displayStatus, "indisponivel");

  const perpetualReserved = getCovaDisplayMeta(
    { numero: 2, grave: { status: "AVAILABLE", bodyCapacity: 1, areaType: "PERPETUAL", blocked: false } },
    { id: 12, num_quadra: 12 },
    sepultamentosAll,
    petsAll
  );
  assert.equal(perpetualReserved.displayStatus, "reservada");
});

test("getSepCountsByQuadra aggregates visible sepultamentos by quadra", () => {
  const counts = getSepCountsByQuadra(sepultamentosAll, [
    { id: 10, quadra_cova: 10 },
    { id: 11, quadra_cova: 11 },
    { id: 12, quadra_cova: 12 },
  ]);

  assert.equal(counts["10"], 2);
  assert.equal(counts["11"], 1);
  assert.equal(counts["12"], 1);
  assert.equal(counts["99"], undefined);
});

test("buildQuadrasFromData assembles and sorts quadras with cova and sepultamento data", () => {
  const quadras = buildQuadrasFromData(
    [
      { id: 2, number: 2, description: "B" },
      { id: 1, number: 1, description: "A" },
    ],
    [
      { id: "c1", quadra_cova: 1, num_cova: 1, status: "disponivel", capacidade: 2 },
      { id: "c2", quadra_cova: 2, num_cova: 7, status: "OCUPADA", capacidade: 1 },
    ],
    [
      { id: "s1", quadra_sep: 1, num_sepultura_sep: 1, confirmado: true, status: "concluido" },
      { id: "s2", quadra_sep: 2, num_sepultura_sep: 7, titulo_posse: "sim", confirmado: false },
    ]
  );

  assert.equal(quadras[0].id, 1);
  assert.equal(quadras[1].id, 2);
  assert.equal(quadras[0].covas[0].status, "ocupada");
  assert.equal(quadras[1].covas[0].status, "ocupada");
  assert.equal(quadras[1].covas[0].sep.id, "s2");
});

test("getVisibleBlocks filters blocks by selected cemetery", () => {
  const blocks = [
    { id: 1, cemeteryId: 10 },
    { id: 2, cemeteryId: 11 },
    { id: 3, cemeteryId: 10 },
  ];

  assert.deepEqual(getVisibleBlocks(blocks, 10).map((block) => block.id), [1, 3]);
  assert.deepEqual(getVisibleBlocks(blocks, 0), []);
  assert.deepEqual(getVisibleBlocks(blocks, "abc"), []);
});
