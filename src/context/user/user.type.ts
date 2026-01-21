// src/context/user/user.type.ts

// 1. Định nghĩa kiểu cho object Role con bên trong
export interface UserRole {
  id: string;
  value: string; // Đây là cái quan trọng nhất (Admin/Recruiter/Candidate)
  createdAt?: string;
  updatedAt?: string;
}

// 2. Định nghĩa kiểu cho Center
export interface Center {
  center_id: string;
  name: string;
  code?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
}

// 3. Định nghĩa kiểu User chính
export interface User {
  id: string;
  email: string;
  name: string; // ⚠️ JSON backend trả về là "name", không phải "fullName"

  // 👇 SỬA QUAN TRỌNG TẠI ĐÂY: Role là object, không phải string
  role: UserRole;

  avatar_url?: string; // Thêm dấu ? vì có thể null
  center?: Center; // Thông tin center nếu user là center
  createdAt?: string;
  updatedAt?: string;
}
