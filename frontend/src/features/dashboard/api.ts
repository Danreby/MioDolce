import "server-only";
import { apiFetch } from "@/lib/api/client";
import type { Dashboard } from "./types";

export const dashboardApi = {
  get: () => apiFetch<Dashboard>("/api/dashboard"),
};
