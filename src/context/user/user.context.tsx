// src/context/user/user.context.tsx

import React, { createContext, useContext, useState } from "react";
import type { User } from "./user.type.ts"; // Import kiểu User bạn vừa tạo
import { clearAuthTokens } from "@/utils/authStorage";

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

  // Chúng ta sẽ tạm để `loading` là false
  // Chúng ta sẽ thêm logic "tự động đăng nhập" (giống FreshFarm) sau
  const [loading] = useState(false);

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
