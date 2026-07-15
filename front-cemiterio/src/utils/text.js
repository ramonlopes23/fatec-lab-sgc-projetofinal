export const stripDiacritics = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

export const normalizeText = (value) => stripDiacritics(value);

export const normalizeSearchText = (value) => stripDiacritics(value);

export const sortNumericText = (left, right) => {
    const leftNumber = Number(left);
    const rightNumber = Number(right);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) return leftNumber - rightNumber;
    return String(left).localeCompare(String(right), "pt-BR", { numeric: true, sensitivity: "base" });
};
