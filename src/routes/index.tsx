// src/routes/index.tsx

import { createBrowserRouter, Outlet } from "react-router-dom";
import path from "@/constants/path";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import UserManagementPage from "@/pages/admin/UserManagement";
import CreateCandidate from "@/pages/admin/candidate/CreateCandidate";
import CreateRecruiter from "@/pages/admin/recruiter/CreateRecruiter";
import CandidateList from "@/pages/admin/candidate/CandidateList";
import CandidateDetail from "@/pages/admin/candidate/CandidateDetail";

import RecruiterList from "@/pages/admin/recruiter/RecruiterList";
import PendingRecruiters from "@/pages/admin/recruiter/PendingRecruiters";
import JobList from "@/pages/admin/jobs/JobList";
import PendingJobs from "@/pages/admin/jobs/PendingJobs";
import JobCandidates from "@/pages/admin/jobs/JobCandidates";
import SuggestedJobs from "@/pages/admin/jobs/SuggestedJobs";
import CandidateJobs from "@/pages/admin/candidate/CandidateJobs";
import InterviewList from "@/pages/admin/interview/InterviewList";
import SocialInsuranceLookup from "@/pages/admin/social/SocialInsuranceLookup";
import ReportOverview from "@/pages/admin/report/ReportOverview";
import Dashboard from "@/pages/admin/Dashboard";
import PlaceholderPage from "@/pages/admin/PlaceholderPage";

import CandidateJobBoard from "@/pages/candidate/JobBoard";
import CandidateAppliedJobs from "@/pages/candidate/AppliedJobs";
import CandidateSuggestedJobs from "@/pages/candidate/SuggestedJobs";
import CandidateInterviews from "@/pages/candidate/Interviews";
import CandidateProfile from "@/pages/candidate/Profile";

import RecruiterJobPosts from "@/pages/recruiter/JobPosts";
import RecruiterInterviews from "@/pages/recruiter/Interviews";
import RecruiterProfile from "@/pages/recruiter/Profile";
import CandidatesForJob from "@/pages/recruiter/CandidatesForJob";
import SuggestedCandidates from "@/pages/recruiter/SuggestedCandidates";

import CenterDashboard from "@/pages/center/CenterDashboard";

export const AppRouter = createBrowserRouter([
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
      { path: path.ADMIN_USER_CANDIDATE_DETAIL, element: <CandidateDetail /> },

      { path: path.ADMIN_JOB_LIST, element: <JobList /> },
      { path: path.ADMIN_JOB_PENDING, element: <PendingJobs /> },
      { path: path.ADMIN_JOB_CANDIDATES, element: <JobCandidates /> },
      { path: path.ADMIN_CANDIDATE_JOBS, element: <CandidateJobs /> },
      { path: path.ADMIN_JOB_SUGGESTED, element: <SuggestedJobs /> },

      { path: path.ADMIN_INTERVIEWS, element: <InterviewList /> },
      { path: path.ADMIN_SOCIAL, element: <SocialInsuranceLookup /> },
      { path: path.ADMIN_REPORT, element: <ReportOverview /> },

      {
        path: path.ADMIN_REQUESTS,
        element: (
          <PlaceholderPage
            title="Yêu cầu hỗ trợ"
            description="Màn này chưa có API. Hiển thị placeholder để tránh 404."
          />
        ),
      },
      {
        path: path.ADMIN_CATEGORIES_INDUSTRIES,
        element: (
          <PlaceholderPage
            title="Ngành nghề"
            description="Chưa có endpoints từ backend. Bổ sung sau."
          />
        ),
      },
      {
        path: path.ADMIN_CATEGORIES_SKILLS,
        element: (
          <PlaceholderPage
            title="Kỹ năng"
            description="Chưa có endpoints từ backend. Bổ sung sau."
          />
        ),
      },
      {
        path: path.ADMIN_SETTINGS,
        element: (
          <PlaceholderPage
            title="Cài đặt hệ thống"
            description="Cấu hình hệ thống sẽ gắn khi backend sẵn sàng."
          />
        ),
      },
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
    ],
  },

  // --- Center ---
  {
    path: path.CENTER_HOME,
    element: <CenterDashboard />,
  },
]);
