// src/main.tsx

import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { UserProvider } from "./context/user/user.context.tsx";
import "react-toastify/dist/ReactToastify.css"; // <-- THÊM DÒNG NÀY

// --- 1. IMPORT CÁC CÔNG CỤ CỦA REACT QUERY ---
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// --- 2. TẠO "BỘ NÃO" QUERY CLIENT ---
// (Chỉ tạo một lần duy nhất)
const queryClient = new QueryClient();

// 3. RENDER ỨNG DỤNG
createRoot(document.getElementById("root")!).render(
  // --- 4. BỌC "PROVIDER" CỦA QUERY BÊN NGOÀI CÙNG ---
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <App />
    </UserProvider>
  </QueryClientProvider>
);
