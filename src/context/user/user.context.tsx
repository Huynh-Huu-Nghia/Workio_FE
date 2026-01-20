// src/context/user/user.context.tsx

import React, { createContext, useContext, useState, useEffect } from "react";
import type { User } from "./user.type.ts"; // Import kiểu User bạn vừa tạo
import { clearAuthTokens, getAccessToken } from "@/utils/authStorage";
import { axiosInstance } from "@/utils/axios";

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing authentication on app startup
  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          // Try to fetch user profile to validate token
          const response = await axiosInstance.get("/me");
          if (response.data.err === 0) {
            setUser(response.data.data);
          } else {
            // Token is invalid, clear it
            clearAuthTokens();
          }
        } catch (error) {
          // Token is invalid or request failed, clear it
          clearAuthTokens();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const logout = () => {
    clearAuthTokens();
    setUser(null); // Xóa thông tin user trong state
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        setUser,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook (móc) để các component khác có thể "useUser()"
export const useUser = (): UserContextType => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within a UserProvider");
  return ctx;
};
