import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@apibridge/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "../api";

export interface DemoUserOption {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export const DEMO_USERS: DemoUserOption[] = [
  {
    id: "user-1",
    name: "Alex Rivera",
    email: "alex.rivera@apibridge.dev",
    role: "admin",
    avatarUrl:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&h=128&fit=crop&crop=faces",
  },
  {
    id: "user-2",
    name: "Jordan Chen",
    email: "jordan.chen@apibridge.dev",
    role: "developer",
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces",
  },
  {
    id: "user-3",
    name: "Taylor Smith",
    email: "taylor.smith@apibridge.dev",
    role: "designer",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces",
  },
];

interface AuthContextType {
  selectedUserId: string;
  currentUser: User | null;
  isLoading: boolean;
  switchUser: (userId: string) => void;
  availableUsers: DemoUserOption[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    return localStorage.getItem("demo_user_id") || "user-1";
  });

  const queryClient = useQueryClient();

  const { data: user, isLoading } = api.me.useQuery(undefined, {
    enabled: selectedUserId !== "anonymous",
    retry: false,
  });

  const switchUser = (userId: string) => {
    localStorage.setItem("demo_user_id", userId);
    setSelectedUserId(userId);
    // Invalidate user and any active queries
    queryClient.invalidateQueries();
  };

  useEffect(() => {
    if (!localStorage.getItem("demo_user_id")) {
      localStorage.setItem("demo_user_id", "user-1");
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        selectedUserId,
        currentUser: selectedUserId === "anonymous" ? null : (user as User) || null,
        isLoading: selectedUserId === "anonymous" ? false : isLoading,
        switchUser,
        availableUsers: DEMO_USERS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
}
