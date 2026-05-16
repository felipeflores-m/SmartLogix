export type ApiClientErrorCode = "HTTP_ERROR" | "NETWORK_ERROR" | "TIMEOUT_ERROR" | "VALIDATION_ERROR";

type ApiClientErrorOptions = {
  code: ApiClientErrorCode;
  publicMessage: string;
  technicalMessage: string;
  status?: number;
  statusText?: string;
  details?: unknown;
};

export class ApiClientError extends Error {
  readonly code: ApiClientErrorCode;
  readonly publicMessage: string;
  readonly status?: number;
  readonly statusText?: string;
  readonly details?: unknown;

  constructor(options: ApiClientErrorOptions) {
    super(options.technicalMessage);
    this.name = "ApiClientError";
    this.code = options.code;
    this.publicMessage = options.publicMessage;
    this.status = options.status;
    this.statusText = options.statusText;
    this.details = options.details;
  }
}

type HttpErrorInput = {
  status: number;
  statusText: string;
  url: string;
  payload: unknown;
};

export function createHttpError({ status, statusText, url, payload }: HttpErrorInput): ApiClientError {
  return new ApiClientError({
    code: "HTTP_ERROR",
    status,
    statusText,
    details: payload,
    publicMessage: getPublicHttpMessage(status),
    technicalMessage: `HTTP ${status} ${statusText} at ${url}`
  });
}

export function createTimeoutError(url: string): ApiClientError {
  return new ApiClientError({
    code: "TIMEOUT_ERROR",
    publicMessage: "El backend no respondio a tiempo. Intenta nuevamente.",
    technicalMessage: `Request timed out at ${url}`
  });
}

export function createNetworkError(url: string, cause: unknown): ApiClientError {
  return new ApiClientError({
    code: "NETWORK_ERROR",
    publicMessage: "No fue posible conectar con el backend.",
    technicalMessage: `Network request failed at ${url}`,
    details: cause
  });
}

export function createValidationError(context: string, details?: unknown): ApiClientError {
  return new ApiClientError({
    code: "VALIDATION_ERROR",
    publicMessage: "La respuesta del backend no coincide con el contrato esperado.",
    technicalMessage: `Invalid API response: ${context}`,
    details
  });
}

export function getSafeErrorMessage(error: unknown): string {
  if (error instanceof ApiClientError) {
    return error.publicMessage;
  }

  return "No se pudo completar la operacion.";
}

function getPublicHttpMessage(status: number): string {
  if (status === 400) {
    return "Los datos enviados no son validos.";
  }

  if (status === 401) {
    return "Credenciales invalidas o sesion expirada.";
  }

  if (status === 403) {
    return "Tu usuario no tiene permisos para esta operacion.";
  }

  if (status === 404) {
    return "El recurso solicitado no existe.";
  }

  if (status >= 500) {
    return "El backend no pudo procesar la solicitud.";
  }

  return "No se pudo completar la solicitud.";
}
