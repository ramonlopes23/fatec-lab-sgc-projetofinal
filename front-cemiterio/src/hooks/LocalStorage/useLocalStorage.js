import { useCallback, useEffect, useState } from "react";

export default function useLocalStorage(key, initialValue = null) {
    const [state, setState] = useState(() => {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : initialValue;
        } catch (err) {
            console.error("useLocalStorage: read error", err);
            return initialValue;
        }
    });

    const setValue = useCallback(
        (value) => {
            try {
                const next = typeof value === "function" ? value(state) : value;
                setState(next);
                if (next === undefined || next === null) {
                    localStorage.removeItem(key);
                } else {
                    localStorage.setItem(key, JSON.stringify(next));
                }
            } catch (err) {
                console.error("useLocalStorage: write error", err);
            }
        },
        [key, state]
    );

    const clear = useCallback(() => {
        try {
            localStorage.removeItem(key);
            setState(initialValue);
        } catch (err) {
            console.error("useLocalStorage: clear error", err);
        }
    }, [key, initialValue]);

    useEffect(() => {
        const handler = (e) => {
            if (e.key !== key) return;
            try {
                setState(e.newValue ? JSON.parse(e.newValue) : null);
            } catch (err) {
                err;
            }
        };
        window.addEventListener("storage", handler);
        return () => window.removeEventListener("storage", handler);
    }, [key]);

    return [state, setValue, clear];
}
