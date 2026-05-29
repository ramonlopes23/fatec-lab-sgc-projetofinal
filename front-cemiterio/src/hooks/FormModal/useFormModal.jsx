import { useState } from "react";

export default function useFormModal({ initialForm = {} } = {}) {
    const resolveInitialForm = () => (typeof initialForm === "function" ? initialForm() : initialForm);
    const [form, setForm] = useState(resolveInitialForm);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const openCreate = () => {
        setEditingId(null);
        setForm(resolveInitialForm());
        setErrors({});
        setModalOpen(true);
    };

    const openEdit = (id, formData = {}) => {
        setEditingId(id);
        setForm(formData);
        setErrors({});
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingId(null);
        setForm(resolveInitialForm());
        setErrors({});
    };

    const validate = (validateFn) => {
        if (typeof validateFn !== "function") return true;
        const nextErrors = validateFn(form, editingId) || {};
        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    return {
        form,
        setForm,
        errors,
        setErrors,
        editingId,
        modalOpen,
        isSubmitting,
        setIsSubmitting,
        openCreate,
        openEdit,
        closeModal,
        validate,
    };
}
