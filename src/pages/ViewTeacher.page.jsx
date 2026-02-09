// src/pages/ViewTeacher.page.jsx
import React, { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetTeachersQuery,
  useGetTeacherFormDataQuery,
  useSetTeacherAccessMutation,
} from "../api/teacherAssignmentApi";

const ModalShell = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />
      <div className="relative w-[95vw] max-w-[820px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
          <div className="font-extrabold text-blue-800">{title}</div>
          <button
            type="button"
            className="rounded-lg bg-gray-700 px-3 py-1 text-white text-xs font-bold hover:bg-gray-800"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
};

const ViewTeacherPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data, isLoading, isError, error, refetch } = useGetTeachersQuery({
    status: "all",
  });

  const teachers = useMemo(() => data?.teachers || [], [data]);

  // ✅ modal teacherId in URL
  const viewAssignTeacherId = searchParams.get("viewAssignTeacherId");

  const {
    data: formData,
    isLoading: assignLoading,
    isError: assignIsError,
    error: assignError,
    refetch: refetchAssign,
  } = useGetTeacherFormDataQuery(viewAssignTeacherId, {
    skip: !viewAssignTeacherId,
  });

  useEffect(() => {
    if (viewAssignTeacherId) refetchAssign();
  }, [viewAssignTeacherId, refetchAssign]);

  const readableAssignments = formData?.readableAssignments || [];
  const modalTeacher = formData?.teacher;

  const closeModal = () => navigate("/teacher/view", { replace: true });

  const onViewAssign = (teacherId) => {
    navigate(`/teacher/view?viewAssignTeacherId=${encodeURIComponent(teacherId)}`);
  };

  const onEdit = (teacherId) => {
    // ✅ keep your existing edit route/page
    navigate(`/teacher/view?teacherId=${encodeURIComponent(teacherId)}`);
  };

  const [setTeacherAccess, { isLoading: accessLoading }] = useSetTeacherAccessMutation();

  const onToggleAccess = async (teacher) => {
    const nextActive = !(teacher?.isActive === true);
    const ok = window.confirm(
      nextActive
        ? "Enable this teacher access?"
        : "Disable this teacher access? (Teacher cannot login or use system)"
    );
    if (!ok) return;

    try {
      await setTeacherAccess({ teacherId: teacher._id, isActive: nextActive }).unwrap();
      refetch();
      // also refresh modal if open for same teacher
      if (viewAssignTeacherId && String(viewAssignTeacherId) === String(teacher._id)) {
        refetchAssign();
      }
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Update failed"));
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Teachers
        </h1>

        <div className="mt-4 w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-sm">
                <th className="p-3 text-left w-[18%]">Teacher Name</th>
                <th className="p-3 text-left w-[22%]">Email</th>
                <th className="p-3 text-left w-[16%]">WhatsApp</th>
                <th className="p-3 text-left w-[12%]">View Grade & Subjects</th>
                <th className="p-3 text-center w-[14%]">Operation</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-red-600 font-bold">
                    Error: {String(error?.data?.message || error?.error || "Failed")}
                    <div className="mt-2">
                      <button
                        onClick={refetch}
                        className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 font-extrabold text-sm"
                      >
                        Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-gray-500">
                    No teachers found
                  </td>
                </tr>
              ) : (
                teachers.map((t) => {
                  const disabled = t?.isActive === false;

                  return (
                    <tr key={t._id} className="border-t text-sm">
                      <td className="p-3 font-semibold truncate">
                        <div className="flex items-center gap-2">
                          <span className={disabled ? "text-gray-400" : ""}>{t.name}</span>
                          {disabled && (
                            <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-extrabold border border-red-200">
                              Disabled
                            </span>
                          )}
                        </div>
                      </td>

                      <td className={`p-3 truncate ${disabled ? "text-gray-400" : ""}`}>
                        {t.email}
                      </td>

                      <td className={`p-3 truncate ${disabled ? "text-gray-400" : ""}`}>
                        {t.whatsapp || t.phonenumber}
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          onClick={() => onViewAssign(t._id)}
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-white text-xs font-bold hover:bg-indigo-700"
                        >
                          View
                        </button>
                      </td>

                      <td className="p-3">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => onEdit(t._id)}
                            className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleAccess(t)}
                            disabled={accessLoading}
                            className={`rounded-lg px-3 py-1 text-white text-xs font-bold disabled:opacity-60 ${
                              disabled ? "bg-green-600 hover:bg-green-700" : "bg-gray-700 hover:bg-gray-800"
                            }`}
                          >
                            {disabled ? "Enable" : "Disable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={refetch}
            className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 font-extrabold text-sm"
          >
            Refresh
          </button>
        </div>

        {viewAssignTeacherId && (
          <ModalShell
            title={modalTeacher?.name ? `Grade & Subjects - ${modalTeacher.name}` : "Grade & Subjects"}
            onClose={closeModal}
          >
            {assignLoading ? (
              <div className="text-gray-500 font-bold">Loading...</div>
            ) : assignIsError ? (
              <div className="text-red-600 font-bold">
                Error: {String(assignError?.data?.message || assignError?.error || "Failed to load")}
                <div className="mt-2">
                  <button
                    onClick={refetchAssign}
                    className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 font-extrabold text-sm"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : readableAssignments.length === 0 ? (
              <div className="text-gray-700 font-extrabold">No assignments found for this teacher.</div>
            ) : (
              <div className="space-y-4">
                {readableAssignments.map((a, idx) => (
                  <div
                    key={`${a.gradeId}-${a.streamId || "none"}-${idx}`}
                    className="w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-gray-50 border-b flex items-center justify-between flex-wrap gap-2">
                      <div className="font-extrabold text-blue-800">
                        Grade {a.grade}
                        {a.stream ? ` - ${a.stream}` : ""}
                      </div>
                      <div className="text-xs font-bold text-gray-600">
                        Subjects: {a.subjects?.length || 0}
                      </div>
                    </div>

                    <div className="p-4">
                      {a.subjects?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {a.subjects.map((s) => (
                            <span
                              key={s._id}
                              className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-xs font-extrabold border border-gray-200"
                            >
                              {s.subject}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-gray-500 font-bold">No subjects assigned</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ModalShell>
        )}
      </div>
    </div>
  );
};

export default ViewTeacherPage;
