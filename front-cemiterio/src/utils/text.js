const RESERVED_NAME_PARTICLES = new Set(["do", "da", "de", "di", "das", "dos"]);

export const capitalizeWords = (value) => {
  return String(value ?? "")
    .toLowerCase()
    .split(/(\s+|[-'])/g)
    .map((part) => {
      if (!part) return part;

      if (/^\s+$/.test(part) || part === "-" || part === "'") {
        return part;
      }

      if (RESERVED_NAME_PARTICLES.has(part)) {
        return part;
      }

      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("");
};