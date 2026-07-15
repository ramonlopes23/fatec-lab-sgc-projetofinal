export const getCalendarEventKey = (type, id, sourceIndex) =>
    JSON.stringify([String(type || "Evento"), id == null ? null : String(id), sourceIndex]);
