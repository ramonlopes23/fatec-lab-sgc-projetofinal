import { useEffect, useRef, useState } from "react";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";

const getDateKey = (value) => {
    if (!(value instanceof Date)) return value == null ? null : String(value);
    const time = value.getTime();
    return Number.isNaN(time) ? null : time;
};

export default function StableDateTimePicker({ value, onAccept, onChange, onClose, ...props }) {
    const [draftValue, setDraftValue] = useState(value ?? null);
    const committedKeyRef = useRef(getDateKey(value));

    useEffect(() => {
        const nextKey = getDateKey(value);
        committedKeyRef.current = nextKey;
        setDraftValue((current) => (getDateKey(current) === nextKey ? current : (value ?? null)));
    }, [value]);

    const commitValue = (nextValue, context) => {
        const nextKey = getDateKey(nextValue);
        if (nextKey === committedKeyRef.current) return;
        committedKeyRef.current = nextKey;
        onChange?.(nextValue, context);
    };

    return (
        <DateTimePicker
            {...props}
            value={draftValue}
            onChange={(nextValue) => setDraftValue(nextValue)}
            onAccept={(nextValue, context) => {
                commitValue(nextValue, context);
                onAccept?.(nextValue, context);
            }}
            onClose={() => {
                commitValue(draftValue);
                onClose?.();
            }}
        />
    );
}
