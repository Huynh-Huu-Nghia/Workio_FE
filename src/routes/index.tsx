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
import CandidateView from "@/pages/admin/candidate/CandidateView";
import CandidateEdit from "@/pages/admin/candidate/CandidateEdit";
import RecruiterList from "@/pages/admin/recruiter/RecruiterList";
import PendingRecruiters from "@/pages/admin/recruiter/PendingRecruiters";
import RecruiterView from "@/pages/admin/recruiter/RecruiterView";
import JobList from "@/pages/admin/jobs/JobList";
import JobFormAdmin from "@/pages/admin/jobs/JobForm";
import PendingJobs from "@/pages/admin/jobs/PendingJobs";
import JobView from "@/pages/admin/jobs/JobView";
import InterviewList from "@/pages/admin/interview/InterviewList";
import InterviewsByCandidate from "@/pages/admin/interview/InterviewsByCandidate";
import SocialInsuranceLookup from "@/pages/admin/social/SocialInsuranceLookup";
import ReportOverview from "@/pages/admin/report/ReportOverview";
import Dashboard from "@/pages/admin/Dashboard";
import SupportRequests from "@/pages/admin/requests/SupportRequests";
import Industries from "@/pages/admin/categories/Industries";
import Skills from "@/pages/admin/categories/Skills";
import Settings from "@/pages/admin/settings/Settings";
import CandidateJobBoard from "@/pages/candidate/JobBoard";
import CandidateInterviews from "@/pages/candidate/Interviews";
import CandidateProfile from "@/pages/candidate/Profile";
import CandidateSupportRequests from "@/pages/candidate/SupportRequests";
import CandidateHome from "@/pages/candidate/Home";
import RecruiterJobPosts from "@/pages/recruiter/JobPosts";
import RecruiterInterviews from "@/pages/recruiter/Interviews";
import RecruiterProfile from "@/pages/recruiter/Profile";
import RecruiterAccountSettings from "@/pages/recruiter/AccountSettings";
import RecruiterSupportRequests from "@/pages/recruiter/SupportRequests";
import CenterDashboard from "@/pages/center/CenterDashboard";
import CenterAccountSettings from "@/pages/center/AccountSettings";
import CenterSupportRequests from "@/pages/center/SupportRequests";
import CenterList from "@/pages/admin/center/CenterList";
import CenterCreate from "@/pages/admin/center/CenterCreate";
import JobCandidates from "@/pages/admin/jobs/JobCandidates";
import CandidateJobs from "@/pages/admin/candidate/CandidateJobs";
import SuggestedJobs from "@/pages/admin/jobs/SuggestedJobs";
import AdminSuggestedCandidates from "@/pages/admin/jobs/SuggestedCandidates";
import CenterView from "@/pages/admin/center/CenterView";
import CandidateAppliedJobs from "@/pages/candidate/AppliedJobs";
import CandidatesForJob from "@/pages/recruiter/CandidatesForJob";
import SuggestedCandidates from "@/pages/recruiter/SuggestedCandidates";
import RecruiterJobForm from "@/pages/recruiter/JobForm";
import CenterCourses from "@/pages/center/Courses";

// 2. ĐỔI TÊN BIẾN "router" THÀNH "AppRouter" VÀ "EXPORT" NÓ RA
export const AppRouter = createBrowserRouter([
  // --- Luồng Trang Chủ (Home) ---
  {
    path: path.home,
    element: <div>Trang CHỦ - Móng (Router) OK!</div>,
  },

  // --- Luồng Auth (Xác thực) ---
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      {
        path: path.login,
        element: <Login />,
      },

      {
        path: path.forgotPassword,
        element: <ForgotPassword />,
      },
      {
        path: path.resetPassword,
        element: <ResetPassword />,
      },
    ],
  },

  // --- Luồng Admin ---
  {
    path: path.admin,
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
        path: path.ADMIN_RECRUITER_VIEW,
        element: <RecruiterView />,
      },
      {
        // Khi truy cập /admin/users
        path: path.ADMIN_USER_CANDIDATE_LIST,
        element: <CandidateList />,
      },
      {
        path: path.ADMIN_CANDIDATE_VIEW,
        element: <CandidateView />,
      },
      {
        path: path.ADMIN_CANDIDATE_EDIT,
        element: <CandidateEdit />,
      },
      {
        path: path.ADMIN_JOB_LIST,
        element: <JobList />,
      },
      {
        path: path.ADMIN_JOB_CREATE,
        element: <JobFormAdmin />,
      },
      {
        path: path.ADMIN_JOB_EDIT,
        element: <JobFormAdmin />,
      },
      {
        path: path.ADMIN_JOB_PENDING,
        element: <PendingJobs />,
      },
      {
        path: path.ADMIN_JOB_VIEW,
        element: <JobView />,
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
        path: path.ADMIN_JOB_SUGGESTED_CANDIDATES,
        element: <AdminSuggestedCandidates />,
      },
      {
        path: path.ADMIN_CENTER_VIEW,
        element: <CenterView />,
      },
      {
        path: path.ADMIN_CENTER_LIST,
        element: <CenterList />,
      },
      {
        path: path.ADMIN_CENTER_CREATE,
        element: <CenterCreate />,
      },
      {
        path: path.ADMIN_INTERVIEWS,
        element: <InterviewList />,
      },
      {
        path: path.ADMIN_INTERVIEWS_CANDIDATE,
        element: <InterviewsByCandidate />,
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
        element: <SupportRequests />,
      },
      {
        path: path.ADMIN_CATEGORIES_INDUSTRIES,
        element: <Industries />,
      },
      {
        path: path.ADMIN_CATEGORIES_SKILLS,
        element: <Skills />,
      },
      {
        path: path.ADMIN_SETTINGS,
        element: <Settings />,
      },
      // Thêm các routes Admin khác tại đây
    ],
  },

  // --- Luồng Candidate ---
  {
    path: path.CANDIDATE_HOME,
    element: <Outlet />,
    children: [
      { index: true, element: <CandidateHome /> },
      { path: path.CANDIDATE_HOME, element: <CandidateHome /> },
      { path: path.CANDIDATE_JOBS, element: <CandidateJobBoard /> },
       { path: path.CANDIDATE_APPLIED_JOBS, element: <CandidateAppliedJobs /> },
      { path: path.CANDIDATE_INTERVIEWS, element: <CandidateInterviews /> },
      { path: path.CANDIDATE_PROFILE, element: <CandidateProfile /> },
      { path: path.CANDIDATE_SUPPORT, element: <CandidateSupportRequests /> },
    ],
  },

  // --- Luồng Recruiter ---
  {
    path: path.RECRUITER_HOME,
    element: <Outlet />,
    children: [
      { path: path.RECRUITER_JOBS, element: <RecruiterJobPosts /> },
      { path: path.RECRUITER_JOB_CREATE, element: <RecruiterJobForm /> },
      { path: path.RECRUITER_JOB_EDIT, element: <RecruiterJobForm /> },
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

  // --- Luồng Center (placeholder) ---
  {
    path: path.CENTER_HOME,
    element: <Outlet />,
    children: [
      { index: true, element: <CenterDashboard /> },
      { path: path.CENTER_COURSES, element: <CenterCourses /> },
      { path: path.CENTER_SETTINGS, element: <CenterAccountSettings /> },
      { path: path.CENTER_SUPPORT, element: <CenterSupportRequests /> },
    ],
  },
]);

// 3. XÓA BỎ HOÀN TOÀN HÀM "AppRouter" CŨ VÌ ĐÃ CÓ "App.tsx" LO
// (Không cần gì ở đây nữa)
