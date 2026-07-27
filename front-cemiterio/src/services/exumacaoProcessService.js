import { createExumacao, deleteExumacao } from "./exumacaoService.js";
import { createExumacaoCanceller, createExumacaoRequester } from "./exumacaoProcessCore.js";

export const solicitarExumacao = createExumacaoRequester({ createExumacao });
export const cancelarExumacao = createExumacaoCanceller({ deleteExumacao });
