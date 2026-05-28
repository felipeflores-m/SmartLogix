import { createValidationError } from "@/lib/api/apiErrors";
import { AUTH_ROLES } from "@/lib/api/apiTypes";
import type { ApiResponse, AuthRole, HealthCheckResponse, LoginResponse, SystemServiceHealth, UserResponse } from "@/lib/api/apiTypes";

type Guard<T> = (value: unknown) => value is T;

export function parseHealthCheckResponse(value: unknown): HealthCheckResponse {
  if (!isRecord(value) || typeof value.status !== "string") {
    throw createValidationError("health response must include status", value);
  }

  return {
    status: value.status,
    checkedAt: typeof value.checkedAt === "string" ? value.checkedAt : undefined,
    services: isSystemServiceHealthArray(value.services) ? value.services : undefined,
    components: isRecord(value.components) ? value.components : undefined,
    groups: isStringArray(value.groups) ? value.groups : undefined
  };
}

export function parseLoginApiResponse(value: unknown): ApiResponse<LoginResponse> {
  return parseApiResponse(value, isLoginResponse, "login response");
}

export function parseCurrentUserApiResponse(value: unknown): ApiResponse<UserResponse> {
  return parseApiResponse(value, isUserResponse, "current user response");
}

export function parseApiResponse<T>(value: unknown, dataGuard: Guard<T>, context: string): ApiResponse<T> {
  if (!isRecord(value)) {
    throw createValidationError(`${context} must be an object`, value);
  }

  if (typeof value.success !== "boolean") {
    throw createValidationError(`${context} must include boolean success`, value);
  }

  if (typeof value.message !== "string") {
    throw createValidationError(`${context} must include string message`, value);
  }

  const data = value.data;

  if (!dataGuard(data)) {
    throw createValidationError(`${context} data has invalid shape`, data);
  }

  return {
    success: value.success,
    message: value.message,
    data
  };
}

function isLoginResponse(value: unknown): value is LoginResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.accessToken === "string" &&
    value.accessToken.length > 0 &&
    typeof value.tokenType === "string" &&
    typeof value.expiresIn === "number" &&
    isUserResponse(value.user)
  );
}

function isUserResponse(value: unknown): value is UserResponse {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "number" &&
    typeof value.email === "string" &&
    typeof value.fullName === "string" &&
    typeof value.role === "string" &&
    isAuthRole(value.role) &&
    (value.active === undefined || typeof value.active === "boolean") &&
    (value.createdAt === undefined || typeof value.createdAt === "string") &&
    (value.updatedAt === undefined || typeof value.updatedAt === "string")
  );
}

function isAuthRole(value: string): value is AuthRole {
  return AUTH_ROLES.some((role) => role === value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSystemServiceHealthArray(value: unknown): value is SystemServiceHealth[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        isRecord(item) &&
        typeof item.key === "string" &&
        typeof item.name === "string" &&
        typeof item.status === "string" &&
        (item.message === undefined || typeof item.message === "string")
    )
  );
}
