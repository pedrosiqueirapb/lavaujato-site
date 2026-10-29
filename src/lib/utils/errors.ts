/**
 * Erros com mensagem segura para exibir ao usuário final.
 * Qualquer outro tipo de erro é registrado no servidor e vira uma mensagem genérica,
 * para nunca expor nomes de variáveis, chaves, URLs ou detalhes técnicos.
 */
export class UserError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UserError';
  }
}

export const GENERIC_ERROR = 'Não foi possível concluir a operação. Tente novamente em instantes.';
export const ASAAS_UNAVAILABLE =
  'Não foi possível se comunicar com o Asaas no momento. Tente novamente em instantes.';

export function safeMessage(e: unknown): string {
  return e instanceof UserError ? e.message : GENERIC_ERROR;
}
