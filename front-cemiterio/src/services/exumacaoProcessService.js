import { createExumacao, deleteExumacao } from "./exumacaoService.js";
import { createExumacaoCanceller, createExumacaoRequester } from "./exumacaoProcessCore.js";
import { getSepultamentoById } from "./sepultamentoService.js";

export const solicitarExumacao = createExumacaoRequester({ createExumacao, getSepultamentoById });
export const cancelarExumacao = createExumacaoCanceller({ deleteExumacao });
