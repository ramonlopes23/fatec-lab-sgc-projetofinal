import { format, isValid, parseISO } from "date-fns";

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const DMY_DATE_RE = /^\d{2}\/\d{2}\/\d{4}$/;
const LOCAL_DATETIME_RE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(?:\.\d{1,3})?)?$/;

const buildLocalDate = (year, month, day, hours = 0, minutes = 0, seconds = 0) => {
    const date = new Date(year, month - 1, day, hours, minutes, seconds, 0);
    return isValid(date) ? date : null;
};

export const parseDateValue = (value) => {
    if (value instanceof Date) {
        return isValid(value) ? value : null;
    }

    if (typeof value === "number") {
        const date = new Date(value);
        return isValid(date) ? date : null;
    }

    if (!value) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    if (DMY_DATE_RE.test(raw)) {
        const [day, month, year] = raw.split("/").map((part) => Number(part));
        return buildLocalDate(year, month, day);
    }

    if (ISO_DATE_RE.test(raw)) {
        const [year, month, day] = raw.split("-").map((part) => Number(part));
        return buildLocalDate(year, month, day);
    }

    if (LOCAL_DATETIME_RE.test(raw)) {
        const [datePart, timePart] = raw.split("T");
        const [year, month, day] = datePart.split("-").map((part) => Number(part));
        const [hour = 0, minute = 0, secondChunk = "0"] = timePart.split(":");
        const second = Number(String(secondChunk).split(".")[0]) || 0;
        return buildLocalDate(year, month, day, Number(hour) || 0, Number(minute) || 0, second);
    }

    const parsed = parseISO(raw);
    return isValid(parsed) ? parsed : null;
};

export const formatDateDMY = (value, fallback = "") => {
    const date = parseDateValue(value);
    return date ? format(date, "dd/MM/yyyy") : fallback;
};

export const formatDateTimeDMY = (value, fallback = "") => {
    const date = parseDateValue(value);
    return date ? format(date, "dd/MM/yyyy HH:mm") : fallback;
};

export const formatDateKey = (value, fallback = "") => {
    const date = parseDateValue(value);
    return date ? format(date, "yyyy-MM-dd") : fallback;
};

export const formatDateTimeKey = (value, fallback = "") => {
    const date = parseDateValue(value);
    return date ? format(date, "yyyy-MM-dd'T'HH:mm") : fallback;
};
