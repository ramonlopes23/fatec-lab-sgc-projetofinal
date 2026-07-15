import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

export default function AddressMapbox({
    token,
    onSelect,
    country = "br",
    placeholder = "Rua, número, bairro, cidade ou CEP",
    limit = 6,
    proximity = null,
}) {
    const [q, setQ] = useState("");
    const [items, setItems] = useState([]);
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const abortRef = useRef(null);
    const containerRef = useRef(null);
    const debounceRef = useRef(null);

    useEffect(() => {
        if (!q || q.trim() === "") {
            setItems([]);
            setOpen(false);
            return;
        }

        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(async () => {
            if (!token) return;
            if (abortRef.current) abortRef.current.abort();
            abortRef.current = new AbortController();
            try {
                const encoded = encodeURIComponent(q);
                const url = [
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json`,
                    `?autocomplete=true`,
                    `&limit=${limit}`,
                    country ? `&country=${encodeURIComponent(country)}` : "",
                    proximity ? `&proximity=${proximity.lng},${proximity.lat}` : "",
                    `&types=address,place,locality,neighborhood,postcode`,
                    `&access_token=${encodeURIComponent(token)}`,
                ].join("");

                const res = await fetch(url, { signal: abortRef.current.signal });
                if (!res.ok) throw new Error("Mapbox error");
                const data = await res.json();
                setItems(Array.isArray(data.features) ? data.features : []);
                setOpen(true);
                setActiveIndex(-1);
            } catch (err) {
                if (err.name === "AbortError") return;
                console.error("Mapbox fetch error", err);
                setItems([]);
                setOpen(false);
            }
        }, 250);
        return () => clearTimeout(debounceRef.current);
    }, [q, token, country, limit, proximity]);

    useEffect(() => {
        const onDoc = (ev) => {
            if (!containerRef.current) return;
            if (!containerRef.current.contains(ev.target)) setOpen(false);
        };

        document.addEventListener("mousedown", onDoc);
        return () => document.removeEventListener("mousedown", onDoc);
    }, []);

    const parseFeature = (f) => {
        const ctx = f.context || [];
        const findCtx = (prefix) => {
            const c = ctx.find((x) => String(x.id).startsWith(prefix + "."));
            return c ? c.text : null;
        };
        const rua = f.text || "";
        const numero =
            f.address ||
            (() => {
                const m = (f.place_name || "").match(/(?:,|\s)(\d{1,6})(?:\b|$)/);
                return m ? m[1] : "";
            })();
        const bairro = findCtx("neighborhood") || findCtx("locality") || "";
        const cidade = findCtx("place") || findCtx("locality") || "";
        const uf = findCtx("region") || "";
        const cep = findCtx("postcode") || "";
        const lat = Array.isArray(f.center) ? f.center[1] : (f.geometry?.coordinates?.[1] ?? null);
        const lng = Array.isArray(f.center) ? f.center[0] : (f.geometry?.coordinates?.[0] ?? null);

        return {
            provider: "mapbox",
            id: f.id,
            raw: f,
            formatted: f.place_name,
            logradouro: rua,
            numero: numero || "",
            bairro: bairro || "",
            cidade: cidade || "",
            uf: uf || "",
            cep: cep || "",
            lat,
            lng,
        };
    };

    const handlePick = (f) => {
        const parsed = parseFeature(f);
        setQ(parsed.formatted || parsed.logradouro || "");
        setOpen(false);
        setItems([]);
        setActiveIndex(-1);
        onSelect && onSelect(parsed);
    };

    const onKeyDown = (e) => {
        if (!open) return;
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, items.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            if (activeIndex >= 0 && items[activeIndex]) handlePick(items[activeIndex]);
            else if (items[0]) handlePick(items[0]);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    return (
        <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: 720 }}>
            <input
                aria-autocomplete="list"
                aria-expanded={open}
                role="combobox"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={placeholder}
                style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #d6d9e6",
                    boxSizing: "border-box",
                }}
            />
            {open && items.length > 0 && (
                <ul
                    role="listbox"
                    style={{
                        position: "absolute",
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        background: "#fff",
                        border: "1px solid rgba(0,0,0,0.08)",
                        marginTop: 8,
                        borderRadius: 8,
                        maxHeight: 320,
                        overflow: "auto",
                        padding: 0,
                        listStyle: "none",
                        boxShadow: "0 10px 30px rgba(24,24,80,0.06)",
                    }}
                >
                    {items.map((it, idx) => (
                        <li
                            key={it.id}
                            role="option"
                            aria-selected={activeIndex === idx}
                            onMouseDown={(ev) => ev.preventDefault()}
                            onClick={() => handlePick(it)}
                            onMouseEnter={() => setActiveIndex(idx)}
                            style={{
                                padding: "10px 12px",
                                cursor: "pointer",
                                background: activeIndex === idx ? "#f4f6ff" : "transparent",
                                borderBottom: "1px solid rgba(0,0,0,0.03)",
                            }}
                        >
                            <div style={{ fontSize: 14, fontWeight: 600 }}>{it.place_name}</div>
                            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                                {it.properties?.category || ""}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

AddressMapbox.propTypes = {
    token: PropTypes.string.isRequired,
    onSelect: PropTypes.func,
    country: PropTypes.string,
    placeholder: PropTypes.string,
    limit: PropTypes.number,
    proximity: PropTypes.object,
};
