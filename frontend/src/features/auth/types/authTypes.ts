import type { UserResponse } from "@/lib/api/apiTypes";

export type AuthUser = UserResponse;
export type AuthRole = "ADMIN" | "OPERATOR" | "VIEWER" | string;
