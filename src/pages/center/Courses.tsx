import { useState } from "react";
import { pathtotitle } from "@/configs/pagetitle";
import { useLocation } from "react-router-dom";
import {
  useAddStudentToCourseMutation,
  useCenterCoursesQuery,
  useCreateCenterCourseMutation,
  useUpdateStudentStatusMutation,
} from "@/api/center.api";
import { toast } from "react-toastify";
import CenterLayout from "@/layouts/CenterLayout";
import { BookOpen, UserPlus, Users, GraduationCap, CheckCircle2, Clock } from "lucide-react";

const CoursesPage = () => {
  const location = useLocation();
  const title = pathtotitle[location.pathname] || "Khóa học";

  const { data, refetch, isFetching } = useCenterCoursesQuery();
  const courses = data?.data ?? [];

  const createCourse = useCreateCenterCourseMutation();
  const addStudent = useAddStudentToCourseMutation();
  const updateStatus = useUpdateStudentStatusMutation();

  const [courseName, setCourseName] = useState("");
  const [courseDesc, setCourseDesc] = useState("");
  const [candidateId, setCandidateId] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) {
      toast.info("Nhập tên khóa học");
      return;
    }
    try {
      const res = await createCourse.mutateAsync({
        name: courseName.trim(),
        description: courseDesc.trim(),
      });
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã tạo khóa học");
        setCourseName("");
        setCourseDesc("");
        refetch();
      } else {
        toast.error((res as any)?.mes || "Tạo khóa học thất bại");
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.mes || "Tạo khóa học thất bại");
    }
  };

  const handleAddStudent = async (courseId: string) => {
    if (!candidateId.trim()) {
      toast.info("Nhập candidate_id");
      return;
    }
    try {
      const res = await addStudent.mutateAsync({
        courseId,
        candidate_id: candidateId.trim(),
      });
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã thêm học viên");
        setCandidateId("");
        setSelectedCourse("");
        refetch();
      } else toast.error((res as any)?.mes || "Thêm học viên thất bại");
    } catch (err: any) {
      toast.error(err?.response?.data?.mes || "Thêm học viên thất bại");
    }
  };

  const handleUpdateStatus = async (courseId: string, studentId: string, status: string) => {
    try {
      const res = await updateStatus.mutateAsync({
        courseId,
        candidateId: studentId,
        status,
      });
      if ((res as any)?.err === 0) {
        toast.success((res as any)?.mes || "Đã cập nhật trạng thái");
        refetch();
      } else toast.error((res as any)?.mes || "Cập nhật thất bại");
    } catch (err: any) {
      toast.error(err?.response?.data?.mes || "Cập nhật thất bại");
    }
  };

  return (
    <CenterLayout title={title}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="mx-auto max-w-7xl px-6 py-10 space-y-8">
          {/* Header Section */}
          <header className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 shadow-xl ring-4 ring-orange-100">
              <BookOpen className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900">{title}</h1>
              <p className="mt-1 text-base text-gray-600">
                Quản lý khóa học và học viên của Trung tâm
              </p>
            </div>
          </header>

          {/* Create Course Form */}
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-orange-100 to-orange-200">
                <GraduationCap className="h-5 w-5 text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Tạo khóa học mới</h2>
            </div>
            <form onSubmit={handleCreate} className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                  placeholder="VD: Lập trình Frontend với React"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700">Mô tả</label>
                <input
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                  placeholder="Thông tin tóm tắt về khóa học"
                />
              </div>
              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={createCourse.isPending}
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3.5 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BookOpen className="h-5 w-5" />
                  {createCourse.isPending ? "Đang tạo khóa học..." : "Tạo khóa học"}
                </button>
              </div>
            </form>
          </div>

          {/* Courses List Section */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Danh sách khóa học</h2>
                {isFetching && (
                  <div className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-orange-500"></div>
                    <span className="text-sm font-medium text-orange-600">Đang tải...</span>
                  </div>
                )}
              </div>
            </div>
            {courses.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-300 bg-white/50 p-16 text-center backdrop-blur-sm">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                  <BookOpen className="h-10 w-10 text-gray-400" />
                </div>
                <p className="text-lg font-semibold text-gray-600">Chưa có khóa học nào</p>
                <p className="mt-1 text-sm text-gray-500">Tạo khóa học đầu tiên để bắt đầu</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {courses.map((course: any) => (
                  <div
                    key={course.id}
                    className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl"
                  >
                    {/* Course Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                              <BookOpen className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-2xl font-bold text-white">{course.name}</h3>
                              {course.description && (
                                <p className="mt-1 text-sm text-orange-100">{course.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-white/20 px-4 py-2 backdrop-blur-sm">
                          <Users className="h-4 w-4 text-white" />
                          <span className="text-sm font-bold text-white">
                            {course.candidates?.length || 0} học viên
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Add Student Section */}
                    <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 p-6">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                          <UserPlus className="h-5 w-5 text-orange-500" />
                          Thêm học viên
                        </div>
                        <div className="flex flex-1 gap-3">
                          <input
                            value={selectedCourse === course.id ? candidateId : ""}
                            onChange={(e) => {
                              setSelectedCourse(course.id);
                              setCandidateId(e.target.value);
                            }}
                            placeholder="Nhập ID học viên"
                            className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm shadow-sm transition focus:border-orange-400 focus:outline-none focus:ring-4 focus:ring-orange-100"
                          />
                          <button
                            type="button"
                            onClick={() => handleAddStudent(course.id)}
                            className="flex items-center gap-2 rounded-xl border-2 border-orange-500 bg-white px-5 py-2.5 font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50 hover:shadow-md"
                          >
                            <UserPlus className="h-4 w-4" />
                            Thêm
                          </button>
                        </div>
                      </div>
                    </div>
                    {/* Students List */}
                    <div className="p-6">
                      <div className="mb-4 flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-blue-600" />
                        <h4 className="font-bold text-gray-900">Danh sách học viên</h4>
                      </div>
                      {course.candidates?.length ? (
                        <div className="space-y-3">
                          {course.candidates.map((c: any) => (
                            <div
                              key={c.candidate_id}
                              className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-gradient-to-r from-white to-gray-50 p-4 shadow-sm transition hover:shadow-md"
                            >
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
                                <Users className="h-5 w-5 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-bold text-gray-900">
                                  {c.candidate?.name || c.name || c.candidate_name || c.candidate_id}
                                </p>
                                {(c.candidate?.name || c.name || c.candidate_name) && (
                                  <p className="text-xs text-gray-500">ID: {c.candidate_id}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${
                                  c.status === "da_hoc"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}>
                                  {c.status === "da_hoc" ? (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <Clock className="h-3.5 w-3.5" />
                                  )}
                                  {c.status === "da_hoc" ? "Đã hoàn thành" : "Đang học"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(course.id, c.candidate_id, "dang_hoc")}
                                  className="rounded-lg border border-orange-300 bg-white px-3 py-1.5 text-xs font-semibold text-orange-600 transition hover:bg-orange-50"
                                >
                                  Đang học
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateStatus(course.id, c.candidate_id, "da_hoc")}
                                  className="rounded-lg border border-green-300 bg-white px-3 py-1.5 text-xs font-semibold text-green-600 transition hover:bg-green-50"
                                >
                                  Hoàn thành
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 p-8 text-center">
                          <Users className="mb-2 h-8 w-8 text-gray-400" />
                          <p className="text-sm font-medium text-gray-600">Chưa có học viên</p>
                          <p className="mt-1 text-xs text-gray-500">Thêm học viên vào khóa học này</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </CenterLayout>
  );
};

export default CoursesPage;
