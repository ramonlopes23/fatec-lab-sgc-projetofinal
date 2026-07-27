import { archiveFalecido } from "./falecidoService.js";
import { createRegistroArchiver } from "./registroProcessCore.js";
import { archiveSepultamento } from "./sepultamentoService.js";

export const arquivarRegistroFalecido = createRegistroArchiver({
    archiveFalecido,
    archiveSepultamento,
});
