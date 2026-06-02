import React, { forwardRef } from "react";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Slide from "@mui/material/Slide";
import SystemButton from "../SystemButton";

const DialogTransition = forwardRef(function DialogTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function ConfirmationDialog({
    open,
    title,
    alertSeverity = "warning",
    alertMessage,
    description,
    confirmLabel = "Confirmar",
    cancelLabel = "Cancelar",
    confirmTone = "confirm",
    confirmVariant,
    onConfirm,
    onClose,
    isSubmitting = false,
    confirmDisabled = false,
    ariaDescriptionId,
}) {
    return (
        <Dialog
            open={open}
            TransitionComponent={DialogTransition}
            keepMounted
            onClose={onClose}
            aria-describedby={ariaDescriptionId}
            fullWidth
            maxWidth="sm"
        >
            {title ? <DialogTitle>{title}</DialogTitle> : null}
            <DialogContent>
                {alertMessage ? (
                    <Alert severity={alertSeverity} variant="outlined" sx={{ mb: 2 }}>
                        {alertMessage}
                    </Alert>
                ) : null}
                <DialogContentText id={ariaDescriptionId}>
                    {description || "Confirme a operação."}
                </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ padding: 2, paddingTop: 0 }}>
                <SystemButton onClick={onClose} disabled={isSubmitting} tone="cancel">
                    {cancelLabel}
                </SystemButton>
                <SystemButton
                    onClick={onConfirm}
                    disabled={isSubmitting || confirmDisabled}
                    tone={confirmTone}
                    variant={confirmVariant}
                >
                    {isSubmitting ? "Processando..." : confirmLabel}
                </SystemButton>
            </DialogActions>
        </Dialog>
    );
}
