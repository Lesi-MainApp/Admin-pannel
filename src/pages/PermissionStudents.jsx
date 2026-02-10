import React, { useMemo, useState } from "react";
import {
  useApproveEnrollMutation,
  useGetPendingEnrollRequestsQuery,
  useRejectEnrollMutation,
} from "../api/enrollApi";

const PermissionStudents = () => {
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
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Student Pending Requests
        </h1>

        {/* top controls */}
        <div className="mt-4 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <button
            onClick={refetch}
            className="rounded-xl px-4 py-2 font-extrabold bg-gray-100 hover:bg-gray-200 w-fit"
          >
            Refresh
          </button>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name / email / class / subject..."
            className="w-full sm:w-[360px] rounded-xl border border-gray-300 px-3 py-2"
          />
        </div>

        {/* state */}
        <div className="mt-4">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : isError ? (
            <div className="text-center text-red-600 font-bold">
              Error: {String(error?.data?.message || error?.error || "Failed")}
              <div className="mt-2">
                <button
                  onClick={refetch}
                  className="rounded-xl bg-gray-100 hover:bg-gray-200 px-4 py-2 font-extrabold"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="text-center text-gray-500">No pending requests</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingRequests.map((r) => {
                const cd = r?.classDetails || {};
                const teachersText = (cd.teachers || []).join(", ") || "-";

                return (
                  <div
                    key={r._id}
                    className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden"
                  >
                    <div className="p-4 flex flex-col h-full">
                      {/* header */}
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-lg font-extrabold text-gray-800">
                            {r.studentName}
                          </div>
                          <div className="text-sm text-gray-600">{r.studentEmail}</div>
                          <div className="text-sm text-gray-600">{r.studentPhone}</div>
                        </div>

                        <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                          PENDING
                        </span>
                      </div>

                      {/* details */}
                      <div className="mt-3 text-sm text-gray-700 space-y-1">
                        <div>
                          <span className="font-bold">Class:</span> {cd.className || "-"}
                        </div>
                        <div>
                          <span className="font-bold">Grade:</span> {cd.grade ?? "-"}
                        </div>
                        <div>
                          <span className="font-bold">Subject:</span> {cd.subject || "-"}
                        </div>
                        <div>
                          <span className="font-bold">Teacher:</span> {teachersText}
                        </div>
                        <div>
                          <span className="font-bold">Requested:</span>{" "}
                          {r.createdAt ? new Date(r.createdAt).toLocaleString() : "-"}
                        </div>
                      </div>

                      {/* footer pinned bottom */}
                      <div className="mt-auto pt-4 flex justify-end gap-2">
                        <button
                          onClick={() => onReject(r._id)}
                          disabled={rejecting}
                          className="rounded-xl bg-red-600 px-4 py-2 text-white font-extrabold hover:bg-red-700 transition disabled:opacity-50"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => onApprove(r._id)}
                          disabled={approving}
                          className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition disabled:opacity-50"
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
