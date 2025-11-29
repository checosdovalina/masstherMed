import { createContext, useContext, useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { LoginCredentials } from "@shared/schema";

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  therapistId: string | null;
  createdAt: Date;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const { data: sessionData, isLoading } = useQuery<{ user: User } | null>({
    queryKey: ["/api/auth/session"],
    retry: false,
    staleTime: 0,
  });

  useEffect(() => {
    if (sessionData?.user) {
      setUser(sessionData.user);
    } else {
      setUser(null);
    }
  }, [sessionData]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const res = await apiRequest("POST", "/api/auth/login", credentials);
        const data = await res.json();
        return data;
      } catch (error: any) {
        if (error instanceof Error && error.message) {
          const match = error.message.match(/\d+:\s*(.+)/);
          if (match && match[1]) {
            try {
              const errorData = JSON.parse(match[1]);
              throw new Error(errorData.error || "Error al iniciar sesión");
            } catch (parseError) {
              throw new Error(match[1]);
            }
          }
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/session"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      setUser(null);
      queryClient.removeQueries({ queryKey: ["/api/auth/session"] });
      queryClient.removeQueries({ queryKey: ["/api/therapy-types"] });
      queryClient.removeQueries({ queryKey: ["/api/therapists"] });
      queryClient.removeQueries({ queryKey: ["/api/patients"] });
      queryClient.removeQueries({ queryKey: ["/api/appointments"] });
      queryClient.removeQueries({ queryKey: ["/api/sessions"] });
    },
  });

  const login = async (credentials: LoginCredentials) => {
    await loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
