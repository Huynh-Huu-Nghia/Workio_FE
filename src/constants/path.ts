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
  ADMIN_USER_RECRUITER_CREATE: "/admin/recruiters/create",
  ADMIN_USER_CANDIDATE_LIST: "/admin/candidates/list",
  ADMIN_CANDIDATE_VIEW: "/admin/candidates/view/:id",
  ADMIN_CANDIDATE_EDIT: "/admin/candidates/edit/:id",
  ADMIN_RECRUITER_LIST: "/admin/recruiters",
  // ADMIN_RECRUITER_PENDING: "/admin/recruiters/pending",
  ADMIN_RECRUITER_VIEW: "/admin/recruiters/view/:id",
  ADMIN_CENTER_LIST: "/admin/centers",
  ADMIN_CENTER_CREATE: "/admin/centers/create",
  ADMIN_JOB_LIST: "/admin/jobs",
  ADMIN_JOB_CREATE: "/admin/jobs/create",
  ADMIN_JOB_EDIT: "/admin/jobs/edit/:id",
  ADMIN_JOB_PENDING: "/admin/jobs/pending",
  ADMIN_JOB_CANDIDATES: "/admin/jobs/candidates",
  ADMIN_JOB_SUGGESTED: "/admin/jobs/suggested",
  ADMIN_JOB_SUGGESTED_CANDIDATES: "/admin/jobs/suggested-candidates",
  ADMIN_JOB_VIEW: "/admin/jobs/view/:id",
  ADMIN_CANDIDATE_JOBS: "/admin/candidates/jobs",
  ADMIN_CENTER_VIEW: "/admin/centers/view/:id",
  ADMIN_INTERVIEWS: "/admin/interviews",
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
  CANDIDATE_SETTINGS: "/candidate/settings",
  CANDIDATE_SUPPORT: "/candidate/support",

  // --- Recruiter ---
  RECRUITER_HOME: "/recruiter",
  RECRUITER_JOBS: "/recruiter/jobs",
  RECRUITER_JOB_CREATE: "/recruiter/jobs/create",
  RECRUITER_JOB_EDIT: "/recruiter/jobs/edit/:id",
  RECRUITER_JOB_CANDIDATES: "/recruiter/jobs/candidates",
  RECRUITER_SUGGESTED_CANDIDATES: "/recruiter/jobs/suggested-candidates",
  RECRUITER_INTERVIEWS: "/recruiter/interviews",
  RECRUITER_PROFILE: "/recruiter/profile",
  RECRUITER_SETTINGS: "/recruiter/settings",
  RECRUITER_SUPPORT: "/recruiter/support",

  // --- Center (placeholder vì chưa có API) ---
  CENTER_HOME: "/center",
  CENTER_COURSES: "/center/courses",
  CENTER_SETTINGS: "/center/settings",
  CENTER_SUPPORT: "/center/support",
} as const;

export default path;
