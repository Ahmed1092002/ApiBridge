import React, { createContext, useContext, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TypedApiClient } from "./types";

interface ApiBridgeContextValue {
  baseUrl: string;
  client?: TypedApiClient<Record<string, unknown>>;
}

const ApiBridgeContext = createContext<ApiBridgeContextValue | null>(null);

export interface ApiBridgeProviderProps {
  children: ReactNode;
  baseUrl: string;
  client?: TypedApiClient<Record<string, unknown>>;
  queryClient?: QueryClient;
}

export function ApiBridgeProvider({
  children,
  baseUrl,
  client,
  queryClient,
}: ApiBridgeProviderProps): React.JSX.Element {
  const content = (
    <ApiBridgeContext.Provider value={{ baseUrl, client }}>{children}</ApiBridgeContext.Provider>
  );

  if (queryClient) {
    return <QueryClientProvider client={queryClient}>{content}</QueryClientProvider>;
  }

  return content;
}

export function useApiBridge(): ApiBridgeContextValue {
  const context = useContext(ApiBridgeContext);
  if (!context) {
    throw new Error("useApiBridge must be used within an ApiBridgeProvider");
  }
  return context;
}
