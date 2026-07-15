import React from "react";
import { FaFileCsv, FaFileExcel, FaFilePdf, FaPrint } from "react-icons/fa";
import SystemButton from "../../common/SystemButton";
import { ExportActionsGrid, ExportCard, ExportCopy, ExportError, ExportHint, ExportTitle } from "./styles";

const EXPORT_ACTIONS = [
    /*     { format: "pdf", label: "Exportar PDF", icon: <FaFilePdf />, tone: "pdf" },
     */ { format: "xlsx", label: "Exportar Excel", icon: <FaFileExcel />, tone: "excel" },
    { format: "csv", label: "Exportar CSV", icon: <FaFileCsv />, tone: "csv" },
];

export default function RelatoriosExportActions({ loadingFormat, error, onExport }) {
    const isBusy = Boolean(loadingFormat);

    return (
        <ExportCard>
            <ExportCopy>
                <ExportTitle>Exportar relatório</ExportTitle>
                <ExportHint>
                    Gere arquivos com os filtros, indicadores, graficos e dados detalhados do recorte atual.
                </ExportHint>
                {error ? <ExportError>{error}</ExportError> : null}
            </ExportCopy>

            <ExportActionsGrid>
                {EXPORT_ACTIONS.map((action) => (
                    <SystemButton
                        key={action.format}
                        type="button"
                        disabled={isBusy}
                        onClick={() => onExport(action.format)}
                        sx={{ justifyContent: "flex-start", minHeight: 46 }}
                    >
                        {action.icon}
                        {loadingFormat === action.format ? "Gerando..." : action.label}
                    </SystemButton>
                ))}
            </ExportActionsGrid>
        </ExportCard>
    );
}
