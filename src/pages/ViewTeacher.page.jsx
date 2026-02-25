// src/pages/ViewTeacher.page.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  useGetTeachersQuery,
  useGetTeacherFormDataQuery,
  useSetTeacherAccessMutation,
} from "../api/teacherAssignmentApi";

const ROWS_PER_PAGE = 20;

const ModalShell = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />
      <div className="relative w-[95vw] max-w-[820px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#F8FAFC] px-4 py-4 sm:px-6">
          <div className="text-base font-semibold text-gray-800">{title}</div>
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
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

const IconButton = ({ onClick, title, children, disabled = false }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-500 transition hover:bg-gray-50 hover:text-gray-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
};

const ViewTeacherPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { data, isLoading, isError, error, refetch } = useGetTeachersQuery({
    status: "all",
  });

  const teachers = useMemo(() => data?.teachers || [], [data]);

  // pagination
  const [currentPage, setCurrentPage] = useState(1);

  // modal teacherId in URL
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
    navigate(`/teacher/view?teacherId=${encodeURIComponent(teacherId)}`);
  };

  const [setTeacherAccess, { isLoading: accessLoading }] =
    useSetTeacherAccessMutation();

  const onToggleAccess = async (teacher) => {
    const nextActive = !(teacher?.isActive === true);
    const ok = window.confirm(
      nextActive
        ? "Enable this teacher access?"
        : "Disable this teacher access? (Teacher cannot login or use system)"
    );
    if (!ok) return;

    try {
      await setTeacherAccess({
        teacherId: teacher._id,
        isActive: nextActive,
      }).unwrap();

      refetch();

      if (
        viewAssignTeacherId &&
        String(viewAssignTeacherId) === String(teacher._id)
      ) {
        refetchAssign();
      }
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Update failed"));
    }
  };

  const rows = useMemo(() => {
    return teachers.map((t) => {
      const disabled = t?.isActive === false;

      return {
        _id: t._id,
        name: t.name || "—",
        email: t.email || "—",
        whatsapp: t.whatsapp || t.phonenumber || "—",
        disabled,
        raw: t,
      };
    });
  }, [teachers]);

  const totalRows = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / ROWS_PER_PAGE));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedRows = useMemo(() => {
    const start = (currentPage - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    return rows.slice(start, end);
  }, [rows, currentPage]);

  const startRecord = totalRows === 0 ? 0 : (currentPage - 1) * ROWS_PER_PAGE + 1;
  const endRecord =
    totalRows === 0 ? 0 : Math.min(currentPage * ROWS_PER_PAGE, totalRows);

  const goToFirstPage = () => setCurrentPage(1);
  const goToPrevPage = () => setCurrentPage((p) => Math.max(1, p - 1));
  const goToNextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const goToLastPage = () => setCurrentPage(totalPages);

  return (
    <div className="flex w-full justify-center ">
      <div className="min-w-0 w-full max-w-[95vw] px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Teacher Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              View teacher details, manage access, and check assigned grades and
              subjects.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={refetch}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={() => navigate("/home")}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
              title="Home"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 10.5 12 3l9 7.5" />
                <path d="M5 9.5V21h14V9.5" />
                <path d="M9 21v-6h6v6" />
              </svg>
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="mt-5 overflow-hidden border border-gray-200 bg-white">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1100px] table-fixed border-separate border-spacing-0">
              <thead>
                <tr className="bg-[#F8FAFC] text-left text-[13px] font-medium text-gray-600">
                  <th className="w-[22%] border-b border-r border-gray-200 px-4 py-3">
                    Teacher Name
                  </th>
                  <th className="w-[26%] border-b border-r border-gray-200 px-4 py-3">
                    Email
                  </th>
                  <th className="w-[18%] border-b border-r border-gray-200 px-4 py-3">
                    WhatsApp
                  </th>
                  <th className="w-[14%] border-b border-r border-gray-200 px-4 py-3">
                    Assignments
                  </th>
                  <th className="w-[20%] border-b border-gray-200 px-4 py-3 text-center">
                    Operation
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white text-sm text-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-red-600">
                      Error: {String(error?.data?.message || error?.error || "Failed")}
                      <div className="mt-3">
                        <button
                          onClick={refetch}
                          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                        >
                          Retry
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : totalRows === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No teachers found
                    </td>
                  </tr>
                ) : (
                  paginatedRows.map((t) => (
                    <tr key={t._id} className="hover:bg-gray-50/70">
                      <td className="border-b border-r border-gray-200 px-4 py-4 align-middle">
                        <div className="flex items-center gap-2">
                          <span
                            className={`truncate font-medium ${
                              t.disabled ? "text-gray-400" : "text-gray-800"
                            }`}
                          >
                            {t.name}
                          </span>

                          {t.disabled && (
                            <span className="rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                              Disabled
                            </span>
                          )}
                        </div>
                      </td>

                      <td
                        className={`border-b border-r border-gray-200 px-4 py-4 align-middle ${
                          t.disabled ? "text-gray-400" : ""
                        }`}
                      >
                        <div className="truncate">{t.email}</div>
                      </td>

                      <td
                        className={`border-b border-r border-gray-200 px-4 py-4 align-middle ${
                          t.disabled ? "text-gray-400" : ""
                        }`}
                      >
                        <div className="truncate">{t.whatsapp}</div>
                      </td>

                      <td className="border-b border-r border-gray-200 px-4 py-4 align-middle">
                        <button
                          type="button"
                          onClick={() => onViewAssign(t._id)}
                          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                        >
                          View
                        </button>
                      </td>

                      <td className="border-b border-gray-200 px-4 py-4 align-middle">
                        <div className="flex items-center justify-center gap-2">
                          <IconButton
                            title="Edit"
                            onClick={() => onEdit(t._id)}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                            </svg>
                          </IconButton>

                          <button
                            type="button"
                            onClick={() => onToggleAccess(t.raw)}
                            disabled={accessLoading}
                            className={`rounded-lg px-3 py-1.5 text-xs font-medium text-white transition disabled:opacity-60 ${
                              t.disabled
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-gray-700 hover:bg-gray-800"
                            }`}
                          >
                            {t.disabled ? "Enable" : "Disable"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              {startRecord} to {endRecord} of {totalRows}
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToFirstPage}
                disabled={currentPage === 1 || totalRows === 0}
                className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {"<<"}
              </button>

              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage === 1 || totalRows === 0}
                className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {"<"}
              </button>

              <span className="px-2 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalRows === 0}
                className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {">"}
              </button>

              <button
                type="button"
                onClick={goToLastPage}
                disabled={currentPage === totalPages || totalRows === 0}
                className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {">>"}
              </button>
            </div>
          </div>
        </div>

        {viewAssignTeacherId && (
          <ModalShell
            title={
              modalTeacher?.name
                ? `Assigned Grades & Subjects - ${modalTeacher.name}`
                : "Assigned Grades & Subjects"
            }
            onClose={closeModal}
          >
            {assignLoading ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : assignIsError ? (
              <div className="text-sm text-red-600">
                Error:{" "}
                {String(
                  assignError?.data?.message ||
                    assignError?.error ||
                    "Failed to load"
                )}
                <div className="mt-3">
                  <button
                    onClick={refetchAssign}
                    className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Retry
                  </button>
                </div>
              </div>
            ) : readableAssignments.length === 0 ? (
              <div className="text-sm text-gray-700">
                No assignments found for this teacher.
              </div>
            ) : (
              <div className="space-y-4">
                {readableAssignments.map((a, idx) => (
                  <div
                    key={`${a.gradeId}-${a.streamId || "none"}-${idx}`}
                    className="border border-gray-200 bg-white"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 bg-[#F8FAFC] px-4 py-3">
                      <div className="text-sm font-medium text-gray-800">
                        Grade {a.grade}
                        {a.stream ? ` - ${a.stream}` : ""}
                      </div>
                      <div className="text-xs text-gray-500">
                        Subjects: {a.subjects?.length || 0}
                      </div>
                    </div>

                    <div className="p-4">
                      {a.subjects?.length ? (
                        <div className="flex flex-wrap gap-2">
                          {a.subjects.map((s) => (
                            <span
                              key={s._id}
                              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-700"
                            >
                              {s.subject}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          No subjects assigned
                        </div>
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