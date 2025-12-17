// src/routes/index.tsx

import { createBrowserRouter, Outlet } from "react-router-dom"; // 1. BỎ "RouterProvider" Ở ĐÂY
import path from "@/constants/path";
import AuthLayout from "@/layouts/AuthLayout";
import Login from "@/pages/auth/Login";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import ResetPassword from "@/pages/auth/ResetPassword";

import UserManagementPage from "@/pages/admin/UserManagement";
import CreateCandidate from "@/pages/admin/candidate/CreateCandidate";
import CreateRecruiter from "@/pages/admin/recruiter/CreateRecruiter";
import CandidateList from "@/pages/admin/candidate/CandidateList";
<<<<<<< Updated upstream
import RecruiterList from "@/pages/admin/recruiter/RecruiterList";
import PendingRecruiters from "@/pages/admin/recruiter/PendingRecruiters";
import JobList from "@/pages/admin/jobs/JobList";
import PendingJobs from "@/pages/admin/jobs/PendingJobs";
import InterviewList from "@/pages/admin/interview/InterviewList";
import SocialInsuranceLookup from "@/pages/admin/social/SocialInsuranceLookup";
import ReportOverview from "@/pages/admin/report/ReportOverview";
import Dashboard from "@/pages/admin/Dashboard";
import PlaceholderPage from "@/pages/admin/PlaceholderPage";
import CandidateJobBoard from "@/pages/candidate/JobBoard";
import CandidateInterviews from "@/pages/candidate/Interviews";
import CandidateProfile from "@/pages/candidate/Profile";
import RecruiterJobPosts from "@/pages/recruiter/JobPosts";
import RecruiterInterviews from "@/pages/recruiter/Interviews";
import RecruiterProfile from "@/pages/recruiter/Profile";
import CenterDashboard from "@/pages/center/CenterDashboard";
import JobCandidates from "@/pages/admin/jobs/JobCandidates";
import CandidateJobs from "@/pages/admin/candidate/CandidateJobs";
import SuggestedJobs from "@/pages/admin/jobs/SuggestedJobs";
import CandidateAppliedJobs from "@/pages/candidate/AppliedJobs";
import CandidateSuggestedJobs from "@/pages/candidate/SuggestedJobs";
import CandidatesForJob from "@/pages/recruiter/CandidatesForJob";
import SuggestedCandidates from "@/pages/recruiter/SuggestedCandidates";
=======
import CandidateDetail from "@/pages/admin/candidate/CandidateDetail";
>>>>>>> Stashed changes

// 2. ĐỔI TÊN BIẾN "router" THÀNH "AppRouter" VÀ "EXPORT" NÓ RA
export const AppRouter = createBrowserRouter([
  // --- Luồng Trang Chủ (Home) ---
  {
    path: path.HOME,
    element: <div>Trang CHỦ - Móng (Router) OK!</div>,
  },

  // --- Luồng Auth (Xác thực) ---
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: path.LOGIN,
        element: <Login />,
      },

      {
        path: path.FORGOTPASSWORD,
        element: <ForgotPassword />,
      },
      {
        path: path.RESETPASSWORD,
        element: <ResetPassword />,
      },
    ],
  },

  // --- Luồng Admin ---
  {
    path: path.ADMIN,
    // Lưu ý: AdminLayout cần title và activeMenu props. Ta sẽ đặt giá trị mặc định ở đây
    // và để trang con (UserManagementPage) tự cung cấp props qua HOC (nếu cần),
    // hoặc đơn giản là dùng AdminLayout component trực tiếp trong trang con (như đã làm).
    // Ở đây ta đặt layout ở ngoài để dùng chung cho tất cả luồng admin.
    element: <Outlet />,
    children: [
      {
        path: path.ADMIN_DASHBOARD,
        element: <Dashboard />,
      },
      {
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_MANAGEMENT,
        element: <UserManagementPage />,
      },
      {
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_CANDIDATE_CREATE,
        element: <CreateCandidate />,
      },
      {
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_RECRUITER_CREATE,
        element: <CreateRecruiter />,
      },
      {
        path: path.ADMIN_RECRUITER_LIST,
        element: <RecruiterList />,
      },
      {
        path: path.ADMIN_RECRUITER_PENDING,
        element: <PendingRecruiters />,
      },
      {
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_CANDIDATE_LIST,
        element: <CandidateList />,
      },
      {
<<<<<<< Updated upstream
        path: path.ADMIN_JOB_LIST,
        element: <JobList />,
      },
      {
        path: path.ADMIN_JOB_PENDING,
        element: <PendingJobs />,
      },
      {
        path: path.ADMIN_JOB_CANDIDATES,
        element: <JobCandidates />,
      },
      {
        path: path.ADMIN_CANDIDATE_JOBS,
        element: <CandidateJobs />,
      },
      {
        path: path.ADMIN_JOB_SUGGESTED,
        element: <SuggestedJobs />,
      },
      {
        path: path.ADMIN_INTERVIEWS,
        element: <InterviewList />,
      },
      {
        path: path.ADMIN_SOCIAL,
        element: <SocialInsuranceLookup />,
      },
      {
        path: path.ADMIN_REPORT,
        element: <ReportOverview />,
      },
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
=======
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_CANDIDATE_DETAIL,
        element: <CandidateDetail />,
>>>>>>> Stashed changes
      },
      // Thêm các routes Admin khác tại đây
    ],
  },

  // --- Luồng Candidate ---
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

  // --- Luồng Recruiter ---
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

  // --- Luồng Center (placeholder) ---
  {
    path: path.CENTER_HOME,
    element: <CenterDashboard />,
  },
]);

// 3. XÓA BỎ HOÀN TOÀN HÀM "AppRouter" CŨ VÌ ĐÃ CÓ "App.tsx" LO
// (Không cần gì ở đây nữa)
