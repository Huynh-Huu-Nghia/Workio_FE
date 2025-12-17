// src/constants/path.ts

const path = {
  // --- Public
  home: "/",
  login: "/login",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",

  // --- Admin (Quản lý 3 vai trò)
  admin: "/admin",
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_USER_MANAGEMENT: "/admin/users", // Quản lý User (Candidate, Recruiter, Edu Manager)
  adminCreateCandidate: "/admin/candidates/create",
  adminUserEdit: "/admin/users/edit/:id",
  adminUserView: "/admin/users/view/:id",
  ADMIN_USER_CANDIDATE_CREATE: "/admin/candidates/create",
  ADMIN_USER_CANDIDATE_DETAIL: "/admin/candidates/detail/:id",
  ADMIN_USER_RECRUITER_CREATE: "/admin/recruiters/create",
  ADMIN_USER_CANDIDATE_LIST: "/admin/candidates/list",
  ADMIN_RECRUITER_LIST: "/admin/recruiters",
  ADMIN_RECRUITER_PENDING: "/admin/recruiters/pending",
  ADMIN_JOB_LIST: "/admin/jobs",
  ADMIN_JOB_PENDING: "/admin/jobs/pending",
  ADMIN_JOB_CANDIDATES: "/admin/jobs/candidates",
  ADMIN_JOB_SUGGESTED: "/admin/jobs/suggested",
  ADMIN_CANDIDATE_JOBS: "/admin/candidates/jobs",
  ADMIN_INTERVIEWS: "/admin/interviews",
  ADMIN_INTERVIEWS_RECRUITER: "/admin/interviews/recruiter",
  ADMIN_INTERVIEWS_CANDIDATE: "/admin/interviews/candidate",
  ADMIN_REPORT: "/admin/reports",
  ADMIN_SOCIAL: "/admin/social-insurances",
  ADMIN_REQUESTS: "/admin/requests",
  ADMIN_CATEGORIES_INDUSTRIES: "/admin/categories/industries",
  ADMIN_CATEGORIES_SKILLS: "/admin/categories/skills",
  ADMIN_SETTINGS: "/admin/settings",

  // --- Candidate ---
  CANDIDATE_HOME: "/candidate",
  CANDIDATE_JOBS: "/candidate/jobs",
  CANDIDATE_APPLIED_JOBS: "/candidate/jobs/applied",
  CANDIDATE_SUGGESTED_JOBS: "/candidate/jobs/suggested",
  CANDIDATE_INTERVIEWS: "/candidate/interviews",
  CANDIDATE_PROFILE: "/candidate/profile",

  // --- Recruiter ---
  RECRUITER_HOME: "/recruiter",
  RECRUITER_JOBS: "/recruiter/jobs",
  RECRUITER_JOB_CANDIDATES: "/recruiter/jobs/candidates",
  RECRUITER_SUGGESTED_CANDIDATES: "/recruiter/jobs/suggested-candidates",
  RECRUITER_INTERVIEWS: "/recruiter/interviews",
  RECRUITER_PROFILE: "/recruiter/profile",

  // --- Center (placeholder vì chưa có API) ---
  CENTER_HOME: "/center",
} as const;

export default path;
