import { createApiClient } from "@apibridge/react";
import { userContracts, taskContracts } from "@apibridge/contracts";

export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string) || "http://localhost:4000";

export const api = createApiClient({
  baseUrl: API_BASE_URL,
  contracts: {
    me: userContracts.me,
    tasks: taskContracts,
  },
  getHeaders: () => {
    const headers: Record<string, string> = {};
    const userId = localStorage.getItem("demo_user_id");
    if (userId && userId !== "anonymous") {
      headers["x-demo-user-id"] = userId;
    }
    return headers;
  },
});
