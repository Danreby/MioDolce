import "server-only";
import { api } from "@/lib/api-client";
import type { DashboardSummary } from "@/lib/types";

export function getDashboard() {
  return api<DashboardSummary>("/dashboard");
}
