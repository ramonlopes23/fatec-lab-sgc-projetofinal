import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow, isAfter, isBefore, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { loadSystemLogs } from "../../services/logsService.js";
import { LOG_PAGE_SIZE } from "../../services/logsData.js";

const initialFilters = {
    search: "",
    periodStart: "",
    periodEnd: "",
    user: "all",
    module: "all",
    eventType: "all",
    status: "all",
};

const normalizeText = (value) =>
    String(value || "")
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const toDate = (value) => {
    if (!value) return null;
    const parsed = parseISO(String(value));
    return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const buildStats = (logs) => {
    const users = new Set(
        logs
            .filter((item) => item.user?.isKnown)
            .map((item) => item.user?.id || item.user?.username || item.user?.name)
            .filter(Boolean)
    );
    const criticalCount = logs.filter((item) => item.status !== "success").length;
    const accessFailures = logs.filter((item) => item.action === "LOGIN" && item.status === "failure").length;
    const latestTimestamp = logs.reduce((latest, item) => {
        const date = toDate(item.timestamp);
        if (!date) return latest;
        if (!latest) return date;
        return date > latest ? date : latest;
    }, null);

    return {
        totalEvents: logs.length,
        activeUsers: users.size,
        criticalEvents: criticalCount,
        accessFailures,
        latestTimestamp,
    };
};

const useSystemLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filters, setFilters] = useState(initialFilters);
    const [page, setPage] = useState(1);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedLogId, setSelectedLogId] = useState(null);
    const [advancedOpen, setAdvancedOpen] = useState(true);

    useEffect(() => {
        let mounted = true;

        const bootstrap = async () => {
            setLoading(true);
            setError("");

            try {
                const loadedLogs = await loadSystemLogs();
                if (!mounted) return;

                const orderedLogs = [...loadedLogs].sort((left, right) => {
                    const leftDate = toDate(left.timestamp);
                    const rightDate = toDate(right.timestamp);
                    if (!leftDate && !rightDate) return 0;
                    if (!leftDate) return 1;
                    if (!rightDate) return -1;
                    return rightDate.getTime() - leftDate.getTime();
                });

                setLogs(orderedLogs);
            } catch (loadError) {
                if (!mounted) return;
                setError(loadError?.message || "Falha ao carregar logs do sistema.");
            } finally {
                if (mounted) setLoading(false);
            }
        };

        bootstrap();

        const handleLogCreated = () => {
            bootstrap();
        };
        window.addEventListener("systemLogCreated", handleLogCreated);

        return () => {
            mounted = false;
            window.removeEventListener("systemLogCreated", handleLogCreated);
        };
    }, []);

    const filteredLogs = useMemo(() => {
        const searchTerm = normalizeText(filters.search);
        const startDate = filters.periodStart ? new Date(`${filters.periodStart}T00:00:00`) : null;
        const endDate = filters.periodEnd ? new Date(`${filters.periodEnd}T23:59:59.999`) : null;

        return logs.filter((log) => {
            const searchable = [
                log.id,
                log.eventCode,
                log.user?.name,
                log.module,
                log.action,
                log.description,
                log.entity?.label,
                log.entity?.id,
                log.sourceCollection,
                log.sourceRecordId,
                log.user?.sourceField,
                log.statusLabel,
            ]
                .map(normalizeText)
                .join(" ");

            const logDate = toDate(log.timestamp);
            const matchesSearch = !searchTerm || searchable.includes(searchTerm);
            const matchesUser = filters.user === "all" || normalizeText(log.user?.name) === normalizeText(filters.user);
            const matchesModule =
                filters.module === "all" || normalizeText(log.module) === normalizeText(filters.module);
            const matchesEvent =
                filters.eventType === "all" || normalizeText(log.action) === normalizeText(filters.eventType);
            const matchesStatus =
                filters.status === "all" || normalizeText(log.status) === normalizeText(filters.status);
            const matchesStart = !startDate || (logDate ? !isBefore(logDate, startDate) : true);
            const matchesEnd = !endDate || (logDate ? !isAfter(logDate, endDate) : true);

            return (
                matchesSearch &&
                matchesUser &&
                matchesModule &&
                matchesEvent &&
                matchesStatus &&
                matchesStart &&
                matchesEnd
            );
        });
    }, [filters, logs]);

    useEffect(() => {
        setPage(1);
    }, [
        filters.search,
        filters.periodStart,
        filters.periodEnd,
        filters.user,
        filters.module,
        filters.eventType,
        filters.status,
    ]);

    const totalPages = Math.max(1, Math.ceil(filteredLogs.length / LOG_PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginatedLogs = useMemo(() => {
        const startIndex = (currentPage - 1) * LOG_PAGE_SIZE;
        return filteredLogs.slice(startIndex, startIndex + LOG_PAGE_SIZE);
    }, [currentPage, filteredLogs]);

    const selectedLog = useMemo(
        () => logs.find((item) => String(item.id) === String(selectedLogId)) || null,
        [logs, selectedLogId]
    );

    const stats = useMemo(() => buildStats(filteredLogs), [filteredLogs]);

    const availableUsers = useMemo(
        () =>
            Array.from(
                new Set(
                    logs
                        .filter((item) => item.user?.isKnown)
                        .map((item) => item.user?.name)
                        .filter(Boolean)
                )
            ).sort((left, right) => left.localeCompare(right)),
        [logs]
    );
    const availableModules = useMemo(
        () =>
            Array.from(new Set(logs.map((item) => item.module).filter(Boolean))).sort((left, right) =>
                left.localeCompare(right)
            ),
        [logs]
    );
    const availableEventTypes = useMemo(
        () =>
            Array.from(new Set(logs.map((item) => item.action).filter(Boolean))).sort((left, right) =>
                left.localeCompare(right)
            ),
        [logs]
    );

    const updateFilter = (key, value) => {
        setFilters((current) => ({ ...current, [key]: value }));
    };

    const clearFilters = () => setFilters(initialFilters);

    const openLog = (log) => {
        setSelectedLogId(log?.id || null);
        setDrawerOpen(Boolean(log));
    };

    const closeLog = () => setDrawerOpen(false);

    const selectedRelative = selectedLog?.timestamp
        ? formatDistanceToNow(new Date(selectedLog.timestamp), { addSuffix: true, locale: ptBR })
        : "";

    return {
        loading,
        error,
        logs,
        filteredLogs,
        paginatedLogs,
        stats,
        selectedLog,
        selectedRelative,
        page: currentPage,
        totalPages,
        filters,
        availableUsers,
        availableModules,
        availableEventTypes,
        drawerOpen,
        advancedOpen,
        setAdvancedOpen,
        setPage,
        updateFilter,
        clearFilters,
        openLog,
        closeLog,
        reload: async () => {
            const loadedLogs = await loadSystemLogs();
            setLogs(loadedLogs);
        },
    };
};

export default useSystemLogs;
