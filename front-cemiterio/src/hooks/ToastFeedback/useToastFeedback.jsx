import { useCallback, useState } from "react";
import { Alert, Snackbar } from "@mui/material";

export function useToastFeedback() {
    const [toastState, setToastState] = useState({
        open: false,
        severity: "success",
        message: "",
    });

    const closeToast = useCallback(() => {
        setToastState((prev) => ({ ...prev, open: false }));
    }, []);

    const showToast = useCallback(({ severity = "info", message = "" } = {}) => {
        const text = String(message || "").trim();
        if (!text) return;

        setToastState({
            open: true,
            severity,
            message: text,
        });
    }, []);

    const showSuccess = useCallback((message) => {
        showToast({ severity: "success", message });
    }, [showToast]);

    const showInfo = useCallback((message) => {
        showToast({ severity: "info", message });
    }, [showToast]);

    const showWarning = useCallback((message) => {
        showToast({ severity: "warning", message });
    }, [showToast]);

    const showError = useCallback((message) => {
        showToast({ severity: "error", message });
    }, [showToast]);

    const ToastElement = (
        <Snackbar
            open={toastState.open}
            autoHideDuration={3000}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            onClose={closeToast}
        >
            <Alert
                onClose={closeToast}
                severity={toastState.severity}
                variant="filled"
                sx={{ width: "100%" }}
            >
                {toastState.message}
            </Alert>
        </Snackbar>
    );

    return{
        showToast,
        showSuccess,
        showInfo,
        showWarning,
        showError,
        ToastElement,
    }
}