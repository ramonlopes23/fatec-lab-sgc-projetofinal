import { useCallback } from "react";

export default function useFileUpload(setForm) {
  const handleFileChange = useCallback((event, fieldName) => {
    const file = event.target.files?.[0];
    const previewKey = fieldName === "residencia" ? "residencia_preview" : fieldName === "dec_obito" ? "dec_obito_preview" : `${fieldName}_preview`;

    if (!file) {
      setForm((prev) => ({ ...prev, [fieldName]: null, [previewKey]: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setForm((prev) => ({ ...prev, [fieldName]: file, [previewKey]: reader.result }));
    reader.readAsDataURL(file);
  }, [setForm]);

  return { handleFileChange };
}
