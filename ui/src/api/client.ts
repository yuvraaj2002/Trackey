import type {
  AnalyticsResponse,
  HealthDbResponse,
  HealthResponse,
  Spend,
  SpendCategory,
  SpendCreate,
  SpendListResponse,
  SpendUpdate,
} from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    const detail =
      typeof data?.detail === "string"
        ? data.detail
        : Array.isArray(data?.detail)
          ? data.detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(", ")
          : `Request failed (${response.status})`;
    throw new ApiError(response.status, detail);
  }

  return data as T;
}

export const api = {
  health: () => request<HealthResponse>("/health"),
  healthDb: () => request<HealthDbResponse>("/health/db"),

  listCategories: () => request<SpendCategory[]>("/spend-categories"),
  createCategory: (name: string) =>
    request<SpendCategory>("/spend-categories", {
      method: "POST",
      body: JSON.stringify({ name }),
    }),
  deleteCategory: (categoryId: number) =>
    request<SpendCategory>(`/spend-categories/${categoryId}`, {
      method: "DELETE",
    }),

  listSpends: (params?: { category_id?: number; cursor?: number }) => {
    const search = new URLSearchParams();
    if (params?.category_id != null) {
      search.set("category_id", String(params.category_id));
    }
    if (params?.cursor != null) {
      search.set("cursor", String(params.cursor));
    }
    const query = search.toString();
    return request<SpendListResponse>(`/spends${query ? `?${query}` : ""}`);
  },
  createSpend: (payload: SpendCreate) =>
    request<Spend>("/spends", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  updateSpend: (spendId: number, payload: SpendUpdate) =>
    request<Spend>(`/spends/${spendId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteSpend: (spendId: number) =>
    request<void>(`/spends/${spendId}`, { method: "DELETE" }),

  getAnalytics: (params: { start: string; end: string; top_limit?: number }) => {
    const search = new URLSearchParams({
      start: params.start,
      end: params.end,
    });
    if (params.top_limit != null) {
      search.set("top_limit", String(params.top_limit));
    }
    return request<AnalyticsResponse>(`/analytics?${search.toString()}`);
  },
};
