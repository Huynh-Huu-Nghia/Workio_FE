// src/constants/path.ts

const path = {
  // --- Public
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // --- Admin (Quản lý 3 vai trò)
  admin: "/admin",
  adminUserManagement: "/admin/users", // Quản lý User (Candidate, Recruiter, Edu Manager)
  adminUserCreate: "/admin/users/create",
  adminUserEdit: "/admin/users/edit/:id",
  adminUserView: "/admin/users/view/:id",

  // (Mình sẽ thêm (add) "Job Management" (Quản lý Job) sau)
} as const;

export default path;
