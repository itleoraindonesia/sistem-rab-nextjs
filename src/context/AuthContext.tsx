"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  username: string;
  role?: "admin" | "user"; // Optional role, defaults to 'user'
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS = [
  { username: "admin", password: "leora123", role: "admin" as const },
  { username: "user1", password: "user123", role: "user" as const },
  { username: "user2", password: "user456", role: "user" as const },
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated on mount
    const checkAuth = () => {
      try {
        const authToken = document.cookie
          .split("; ")
          .find((row) => row.startsWith("auth-token="))
          ?.split("=")[1];

        if (authToken) {
          const userData = JSON.parse(decodeURIComponent(authToken));
          setUser(userData);
        }
      } catch (error) {
        console.error("Error parsing auth token:", error);
        // Clear invalid token
        document.cookie =
          "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find user in DEFAULT_USERS array
      const foundUser = DEFAULT_USERS.find(
        (user) => user.username === username && user.password === password
      );

      if (foundUser) {
        const userData = {
          username: foundUser.username,
          role: foundUser.role,
        };

        // Set cookie (expires in 7 days)
        const expires = new Date();
        expires.setDate(expires.getDate() + 7);

        document.cookie = `auth-token=${encodeURIComponent(
          JSON.stringify(userData)
        )}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;

        setUser(userData);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: "Username atau password salah" };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: "Terjadi kesalahan saat login" };
    }
  };

  const logout = () => {
    // Clear cookie
    document.cookie =
      "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
