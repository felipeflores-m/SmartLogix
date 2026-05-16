import { parseCurrentUserApiResponse, parseLoginApiResponse } from "@/lib/api/apiSchemas";
import type { ApiResponse, LoginRequest, LoginResponse, UserResponse } from "@/lib/api/apiTypes";
import { httpClient } from "@/lib/api/httpClient";
import { authTokenProvider } from "@/lib/security/authTokenProvider";

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await httpClient.post<ApiResponse<LoginResponse>>("/api/auth/login", {
      body: credentials,
      auth: false,
      parse: parseLoginApiResponse
    });

    return response.data;
  },

  async getCurrentUser(): Promise<UserResponse> {
    const response = await httpClient.get<ApiResponse<UserResponse>>("/api/auth/me", {
      parse: parseCurrentUserApiResponse
    });

    return response.data;
  },

  async logout(): Promise<void> {
    authTokenProvider.clearToken();
  }
};
