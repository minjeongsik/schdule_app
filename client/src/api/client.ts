const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:4000/api";

type ApiErrorResponse = {
  message?: string;
  details?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
};

export class ApiError extends Error {
  status: number;
  fieldErrors: Record<string, string[]>;
  formError: string | null;
  pageError: string;

  constructor(status: number, payload?: ApiErrorResponse | null) {
    super(payload?.message ?? "Request failed");
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = Object.fromEntries(
      Object.entries(payload?.details?.fieldErrors ?? {}).map(([key, value]) => [key, value ?? []])
    );
    this.formError = payload?.details?.formErrors?.[0] ?? payload?.message ?? null;
    this.pageError = payload?.message ?? "Request failed";
  }
}

export function toApiError(error: unknown) {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof Error) {
    return new ApiError(500, { message: error.message });
  }

  return new ApiError(500, { message: "Request failed" });
}

export async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const requestUrl = `${API_BASE_URL}${path}`;
  const requestConfig: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    ...options
  };

  console.debug("api:request", {
    method: requestConfig.method ?? "GET",
    url: requestUrl,
    body: requestConfig.body
  });

  const response = await fetch(requestUrl, requestConfig);
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    console.error("api:error", { status: response.status, data });
    throw new ApiError(response.status, data);
  }

  console.debug("api:response", { status: response.status, data });
  return data as T;
}
