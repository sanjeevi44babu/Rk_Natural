// =====================
// API ERROR CLASS
// =====================
import { SignUpData } from "@/types";

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status = 500, data: any = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

// =====================
// BASE CONFIG
// =====================
const API_BASE = (import.meta.env.VITE_API_URL ?? "http://localhost:5000/api").replace(/\/$/, "");
const TOKEN_KEY = "auth_token";

// =====================
// TOKEN HELPERS
// =====================
function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// =====================
// SAFE JSON PARSER
// =====================
async function parseJson(res: Response) {
  const text = await res.text();

  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

// =====================
// CORE REQUEST FUNCTION
// =====================
export async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Set JSON header
  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // Attach token (except login/signup)
  const token = getAuthToken();

  if (
    token &&
    !path.includes("/auth/login") &&
    !path.includes("/auth/signup")
  ) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await parseJson(res);

  if (!res.ok) {
    throw new ApiError(
      data?.message || "Request failed",
      res.status,
      data
    );
  }

  return data;
}

// =====================
// HTTP HELPERS
// =====================
export const apiGet = <T = any>(path: string) =>
  request<T>(path, { method: "GET" });

export const apiPost = <T = any>(path: string, body?: any) =>
  request<T>(path, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiPut = <T = any>(path: string, body?: any) =>
  request<T>(path, {
    method: "PUT",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });

export const apiDelete = <T = any>(path: string) =>
  request<T>(path, { method: "DELETE" });

// =====================
// AUTH HELPERS
// =====================
export async function loginRequest(payload: {
  email: string;
  password: string;
}) {
  const data = await apiPost<{ token: string; user: any }>(
    "/auth/login",
    payload
  );

  if (data?.token) {
    setAuthToken(data.token);
  }

  return data;
}

export const registerRequest = (payload: SignUpData) =>
  apiPost("/auth/signup", payload);

// =====================
// USER
// =====================
export const getMe = () => apiGet("/auth/me");

export const updateUserRequest = (id: string, payload: any) =>
  apiPut(`/auth/users/${id}`, payload);

export const logout = () => clearAuthToken();

// =====================
// DEFAULT EXPORT
// =====================
export default {
  request,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  loginRequest,
  registerRequest,
  updateUserRequest,
  getMe,
  logout,
  setAuthToken,
  clearAuthToken,
};