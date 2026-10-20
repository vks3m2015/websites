const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080";

export type AuthResponse = {
  userId: string;
  name: string;
  roles: string[];
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
};

export type ApiErrorBody = {
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
};

export class ApiError extends Error {
  code: string;
  fieldErrors?: Record<string, string>;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.code = body.code;
    this.fieldErrors = body.fieldErrors;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    let body: ApiErrorBody;
    try {
      body = await res.json();
    } catch {
      body = { code: "UNKNOWN_ERROR", message: "Something went wrong. Please try again." };
    }
    throw new ApiError(body);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export function registerUser(payload: {
  name: string;
  email?: string;
  phone?: string;
  password: string;
  accountType: "CUSTOMER" | "PROFESSIONAL";
}) {
  return request<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginUser(payload: { identifier: string; password: string }) {
  return request<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function authenticatedRequest<T>(path: string, accessToken: string, options: RequestInit = {}) {
  return request<T>(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
