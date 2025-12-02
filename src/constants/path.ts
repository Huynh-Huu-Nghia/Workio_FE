// src/constants/path.ts

const path = {
  // --- Public
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // --- Admin (Quản lý 3 vai trò)
  admin: "/admin",
  ADMIN_USER_MANAGEMENT: "/admin/users", // Quản lý User (Candidate, Recruiter, Edu Manager)
  adminCreateCandidate: "/admin/candidates/create",
  adminUserEdit: "/admin/users/edit/:id",
  adminUserView: "/admin/users/view/:id",
  ADMIN_USER_CANDIDATE_CREATE: "/admin/candidates/create",
  ADMIN_USER_RECRUITER_CREATE: "/admin/recruiters/create",
  ADMIN_USER_CANDIDATE_LIST: "/admin/candidates/list",

  // (Mình sẽ thêm (add) "Job Management" (Quản lý Job) sau)
} as const;

export default path;
