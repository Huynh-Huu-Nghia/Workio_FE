// src/routes/index.tsx

import { createBrowserRouter, Outlet } from "react-router-dom";
import path from "@/constants/path";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

// --- Admin Imports ---
import UserManagementPage from "@/pages/admin/UserManagement";
import CreateCandidate from "@/pages/admin/candidate/CreateCandidate";
import CreateRecruiter from "@/pages/admin/recruiter/CreateRecruiter";
import CandidateList from "@/pages/admin/candidate/CandidateList";
import CandidateView from "@/pages/admin/candidate/CandidateView"; // Code mới từ Main
import CandidateEdit from "@/pages/admin/candidate/CandidateEdit"; // Code mới từ Main

import RecruiterList from "@/pages/admin/recruiter/RecruiterList";
import PendingRecruiters from "@/pages/admin/recruiter/PendingRecruiters";
import JobList from "@/pages/admin/jobs/JobList";
import PendingJobs from "@/pages/admin/jobs/PendingJobs";
import JobCandidates from "@/pages/admin/jobs/JobCandidates";
import SuggestedJobs from "@/pages/admin/jobs/SuggestedJobs";
import CandidateJobs from "@/pages/admin/candidate/CandidateJobs";
import AdminSuggestedCandidates from "@/pages/admin/jobs/SuggestedCandidates"; // Code mới

import InterviewList from "@/pages/admin/interview/InterviewList";
import InterviewsByCandidate from "@/pages/admin/interview/InterviewsByCandidate"; // Code mới
import SocialInsuranceLookup from "@/pages/admin/social/SocialInsuranceLookup";
import ReportOverview from "@/pages/admin/report/ReportOverview";
import Dashboard from "@/pages/admin/Dashboard";

// Các trang mới từ Main (Thay thế cho PlaceholderPage)
import SupportRequests from "@/pages/admin/requests/SupportRequests";
import Industries from "@/pages/admin/categories/Industries";
import Skills from "@/pages/admin/categories/Skills";
import Settings from "@/pages/admin/settings/Settings";

// --- Candidate Imports ---
import CandidateJobBoard from "@/pages/candidate/JobBoard";
import CandidateAppliedJobs from "@/pages/candidate/AppliedJobs";
import CandidateSuggestedJobs from "@/pages/candidate/SuggestedJobs";
import CandidateInterviews from "@/pages/candidate/Interviews";
import CandidateProfile from "@/pages/candidate/Profile";
import CandidateAccountSettings from "@/pages/candidate/AccountSettings"; // Code mới
import CandidateSupportRequests from "@/pages/candidate/SupportRequests"; // Code mới

// --- Recruiter Imports ---
import RecruiterJobPosts from "@/pages/recruiter/JobPosts";
import RecruiterInterviews from "@/pages/recruiter/Interviews";
import RecruiterProfile from "@/pages/recruiter/Profile";
import CandidatesForJob from "@/pages/recruiter/CandidatesForJob";
import SuggestedCandidates from "@/pages/recruiter/SuggestedCandidates";
import RecruiterAccountSettings from "@/pages/recruiter/AccountSettings"; // Code mới
import RecruiterSupportRequests from "@/pages/recruiter/SupportRequests"; // Code mới

// --- Center Imports ---
import CenterDashboard from "@/pages/center/CenterDashboard";
import CenterAccountSettings from "@/pages/center/AccountSettings"; // Code mới
import CenterSupportRequests from "@/pages/center/SupportRequests"; // Code mới

export const AppRouter = createBrowserRouter([
  // --- Backdoor Test UI (Bạn có thể bỏ comment dòng này nếu muốn test lại) ---
  // {
  //   path: "/test-ui",
  //   element: <CandidateJobBoard />,
  // },

  // --- Home ---
  {
    path: path.home,
    element: <div>Trang CHỦ - Móng (Router) OK!</div>,
  },

  // --- Auth ---
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: path.login, element: <Login /> },
      { path: path.forgotPassword, element: <ForgotPassword /> },
      { path: path.resetPassword, element: <ResetPassword /> },
    ],
  },

  // --- Admin ---
  {
    path: path.admin,
    element: <Outlet />,
    children: [
      { path: path.ADMIN_DASHBOARD, element: <Dashboard /> },
      { path: path.ADMIN_USER_MANAGEMENT, element: <UserManagementPage /> },
      { path: path.ADMIN_USER_CANDIDATE_CREATE, element: <CreateCandidate /> },
      { path: path.ADMIN_USER_RECRUITER_CREATE, element: <CreateRecruiter /> },
      { path: path.ADMIN_RECRUITER_LIST, element: <RecruiterList /> },
      { path: path.ADMIN_RECRUITER_PENDING, element: <PendingRecruiters /> },
      { path: path.ADMIN_USER_CANDIDATE_LIST, element: <CandidateList /> },

      // Cập nhật theo cấu trúc mới của Main (View/Edit thay vì Detail cũ)
      { path: path.ADMIN_CANDIDATE_VIEW, element: <CandidateView /> },
      { path: path.ADMIN_CANDIDATE_EDIT, element: <CandidateEdit /> },

      { path: path.ADMIN_JOB_LIST, element: <JobList /> },
      { path: path.ADMIN_JOB_PENDING, element: <PendingJobs /> },
      { path: path.ADMIN_JOB_CANDIDATES, element: <JobCandidates /> },
      { path: path.ADMIN_CANDIDATE_JOBS, element: <CandidateJobs /> },
      { path: path.ADMIN_JOB_SUGGESTED, element: <SuggestedJobs /> },
      {
        path: path.ADMIN_JOB_SUGGESTED_CANDIDATES,
        element: <AdminSuggestedCandidates />,
      },

      { path: path.ADMIN_INTERVIEWS, element: <InterviewList /> },
      {
        path: path.ADMIN_INTERVIEWS_CANDIDATE,
        element: <InterviewsByCandidate />,
      },
      { path: path.ADMIN_SOCIAL, element: <SocialInsuranceLookup /> },
      { path: path.ADMIN_REPORT, element: <ReportOverview /> },

      // Sử dụng trang thật thay vì PlaceholderPage
      { path: path.ADMIN_REQUESTS, element: <SupportRequests /> },
      { path: path.ADMIN_CATEGORIES_INDUSTRIES, element: <Industries /> },
      { path: path.ADMIN_CATEGORIES_SKILLS, element: <Skills /> },
      { path: path.ADMIN_SETTINGS, element: <Settings /> },
    ],
  },

  // --- Candidate ---
  {
    path: path.CANDIDATE_HOME,
    element: <Outlet />,
    children: [
      { path: path.CANDIDATE_JOBS, element: <CandidateJobBoard /> },
      { path: path.CANDIDATE_APPLIED_JOBS, element: <CandidateAppliedJobs /> },
      {
        path: path.CANDIDATE_SUGGESTED_JOBS,
        element: <CandidateSuggestedJobs />,
      },
      { path: path.CANDIDATE_INTERVIEWS, element: <CandidateInterviews /> },
      { path: path.CANDIDATE_PROFILE, element: <CandidateProfile /> },
      { path: path.CANDIDATE_SETTINGS, element: <CandidateAccountSettings /> },
      { path: path.CANDIDATE_SUPPORT, element: <CandidateSupportRequests /> },
    ],
  },

  // --- Recruiter ---
  {
    path: path.RECRUITER_HOME,
    element: <Outlet />,
    children: [
      { path: path.RECRUITER_JOBS, element: <RecruiterJobPosts /> },
      { path: path.RECRUITER_JOB_CANDIDATES, element: <CandidatesForJob /> },
      {
        path: path.RECRUITER_SUGGESTED_CANDIDATES,
        element: <SuggestedCandidates />,
      },
      { path: path.RECRUITER_INTERVIEWS, element: <RecruiterInterviews /> },
      { path: path.RECRUITER_PROFILE, element: <RecruiterProfile /> },
      { path: path.RECRUITER_SETTINGS, element: <RecruiterAccountSettings /> },
      { path: path.RECRUITER_SUPPORT, element: <RecruiterSupportRequests /> },
    ],
  },

  // --- Center ---
  {
    path: path.CENTER_HOME,
    element: <Outlet />,
    children: [
      { path: path.CENTER_HOME, element: <CenterDashboard /> }, // Lưu ý: path.CENTER_HOME dùng 2 lần là do cấu trúc cha-con
      { path: path.CENTER_SETTINGS, element: <CenterAccountSettings /> },
      { path: path.CENTER_SUPPORT, element: <CenterSupportRequests /> },
    ],
  },
]);
