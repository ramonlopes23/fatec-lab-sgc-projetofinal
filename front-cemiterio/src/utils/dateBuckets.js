import { parseDateValue } from "./date";

export const isDateWithinNextDays = (value, days) => {
    const date = parseDateValue(value);
    if (!date) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + Number(days || 0));
    limit.setHours(23, 59, 59, 999);

    return date >= today && date <= limit;
};

export const getValidityBucket = (value) => {
    const date = parseDateValue(value);
    if (!date) return "active";

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const limit = new Date(today);
    limit.setDate(limit.getDate() + 30);
    limit.setHours(23, 59, 59, 999);

    if (date < today) return "expired";
    if (date <= limit) return "expiring";
    return "active";
};