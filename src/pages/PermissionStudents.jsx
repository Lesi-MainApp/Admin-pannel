// src/pages/PermissionStudents.page.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useApproveEnrollMutation,
  useGetPendingEnrollRequestsQuery,
  useRejectEnrollMutation,
} from "../api/enrollApi";

const PermissionStudents = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError, error, refetch } =
    useGetPendingEnrollRequestsQuery();

  const [approveEnroll, { isLoading: approving }] = useApproveEnrollMutation();
  const [rejectEnroll, { isLoading: rejecting }] = useRejectEnrollMutation();

  const pendingRequests = useMemo(() => {
    const list = data?.requests || [];
    const q = String(search || "").trim().toLowerCase();
    if (!q) return list;

    return list.filter((r) => {
      const cd = r?.classDetails || {};
      return (
        String(r.studentName || "").toLowerCase().includes(q) ||
        String(r.studentEmail || "").toLowerCase().includes(q) ||
        String(r.studentPhone || "").toLowerCase().includes(q) ||
        String(cd.className || "").toLowerCase().includes(q) ||
        String(cd.subject || "").toLowerCase().includes(q) ||
        String(cd.grade || "").toLowerCase().includes(q) ||
        String((cd.teachers || []).join(" ")).toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const onApprove = async (id) => {
    try {
      await approveEnroll(id).unwrap();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Approve failed"));
    }
  };

  const onReject = async (id) => {
    const ok = window.confirm("Reject this student request?");
    if (!ok) return;

    try {
      await rejectEnroll(id).unwrap();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Reject failed"));
    }
  };

  return (
    <div className="flex w-full justify-center ">
      <div className="min-w-0 w-full max-w-[95vw] px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Student Enrollment Requests
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Review and approve or reject pending student class requests.
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

        {/* top controls */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / email / class / subject..."
            className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300 sm:w-[380px]"
          />
        </div>

        {/* state */}
        <div className="mt-5">
          {isLoading ? (
            <div className="border border-gray-200 bg-white px-6 py-10 text-center text-gray-500">
              Loading...
            </div>
          ) : isError ? (
            <div className="border border-gray-200 bg-white px-6 py-10 text-center">
              <div className="text-red-600">
                Error: {String(error?.data?.message || error?.error || "Failed")}
              </div>
              <div className="mt-3">
                <button
                  onClick={refetch}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="border border-gray-200 bg-white px-6 py-10 text-center text-gray-500">
              No pending requests
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {pendingRequests.map((r) => {
                const cd = r?.classDetails || {};
                const teachersText = (cd.teachers || []).join(", ") || "-";

                return (
                  <div
                    key={r._id}
                    className="border border-gray-200 bg-white"
                  >
                    <div className="flex h-full flex-col p-5">
                      {/* header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-base font-medium text-gray-900">
                            {r.studentName}
                          </div>
                          <div className="mt-1 truncate text-sm text-gray-600">
                            {r.studentEmail}
                          </div>
                          <div className="mt-1 truncate text-sm text-gray-600">
                            {r.studentPhone}
                          </div>
                        </div>

                        <span className="inline-flex items-center rounded-full border border-yellow-200 bg-yellow-50 px-2.5 py-1 text-[11px] font-medium text-yellow-700">
                          Pending
                        </span>
                      </div>

                      {/* details */}
                      <div className="mt-4 space-y-2 text-sm text-gray-700">
                        <div>
                          <span className="font-medium text-gray-800">Class:</span>{" "}
                          {cd.className || "-"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Grade:</span>{" "}
                          {cd.grade ?? "-"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Subject:</span>{" "}
                          {cd.subject || "-"}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Teacher:</span>{" "}
                          {teachersText}
                        </div>
                        <div>
                          <span className="font-medium text-gray-800">Requested:</span>{" "}
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                        </div>
                      </div>

                      {/* footer pinned bottom */}
                      <div className="mt-auto flex justify-end gap-2 pt-5">
                        <button
                          onClick={() => onReject(r._id)}
                          disabled={rejecting}
                          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => onApprove(r._id)}
                          disabled={approving}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissionStudents;