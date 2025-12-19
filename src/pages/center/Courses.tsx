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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">
            Quản lý khóa học của Trung tâm
          </p>
        </header>

        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg grid gap-4 md:grid-cols-2"
        >
          <div>
            <label className="block text-sm font-bold text-gray-800">Tên khóa học *</label>
            <input
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="VD: Lập trình Frontend"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-800">Mô tả</label>
            <input
              value={courseDesc}
              onChange={(e) => setCourseDesc(e.target.value)}
              className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
              placeholder="Thông tin tóm tắt"
            />
          </div>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={createCourse.isPending}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-3 text-sm font-bold text-white shadow-md transition hover:shadow-lg hover:from-orange-600 hover:to-orange-700 disabled:opacity-60"
            >
              {createCourse.isPending ? "Đang tạo..." : "Tạo khóa học"}
            </button>
          </div>
        </form>

        <section className="space-y-4">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="text-lg font-bold text-gray-900">Danh sách khóa học</span>
            {isFetching && <span className="text-orange-600 font-medium">Đang tải...</span>}
          </div>
          {courses.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-12 text-center text-gray-500 shadow-sm">
              Chưa có khóa học.
            </div>
          ) : (
            courses.map((course: any) => (
              <div
                key={course.id}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition hover:shadow-xl space-y-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900">{course.name}</p>
                    {course.description && (
                      <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <input
                      value={selectedCourse === course.id ? candidateId : ""}
                      onChange={(e) => {
                        setSelectedCourse(course.id);
                        setCandidateId(e.target.value);
                      }}
                      placeholder="candidate_id"
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-100"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddStudent(course.id)}
                      className="rounded-lg border-2 border-orange-500 bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm transition hover:bg-orange-50"
                    >
                      Thêm học viên
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50 p-4 text-sm text-gray-700">
                  <p className="mb-3 font-bold text-gray-900">Học viên</p>
                  {course.candidates?.length ? (
                    <div className="space-y-2">
                      {course.candidates.map((c: any) => (
                        <div
                          key={c.candidate_id}
                          className="flex flex-wrap items-center gap-2 rounded-md bg-white px-3 py-2 shadow-sm"
                        >
                          <span className="font-semibold text-gray-800">
                            {c.candidate_id}
                          </span>
                          <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700">
                            {c.status}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(course.id, c.candidate_id, "dang_hoc")}
                            className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Đang học
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateStatus(course.id, c.candidate_id, "da_hoc")}
                            className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50"
                          >
                            Đã học
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">Chưa có học viên.</p>
                  )}
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </CenterLayout>
  );
};

export default CoursesPage;
