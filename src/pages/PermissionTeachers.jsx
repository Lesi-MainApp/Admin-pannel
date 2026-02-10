import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSearch } from "../api/features/teacherSlice";
import {
  useGetAllUsersQuery,
  useApproveTeacherMutation,
  useRejectTeacherMutation,
} from "../api/teacherApi";

const PermissonTeachers = () => {
  const dispatch = useDispatch();
  const { search } = useSelector((s) => s.teacher);

  const { data, isLoading, isError, error, refetch } = useGetAllUsersQuery();
  const [approveTeacher, { isLoading: approving }] = useApproveTeacherMutation();
  const [rejectTeacher, { isLoading: rejecting }] = useRejectTeacherMutation();

  // ✅ only pending teachers
  const pendingTeachers = useMemo(() => {
    const users = data?.users || [];
    let list = users.filter((u) => u.role === "teacher" && !u.isApproved);

    const q = String(search || "").trim().toLowerCase();
    if (q) {
      list = list.filter((u) => {
        return (
          String(u.name || "").toLowerCase().includes(q) ||
          String(u.email || "").toLowerCase().includes(q) ||
          String(u.phonenumber || "").toLowerCase().includes(q) ||
          String(u.district || "").toLowerCase().includes(q) ||
          String(u.town || "").toLowerCase().includes(q)
        );
      });
    }

    return list;
  }, [data, search]);

  const onApprove = async (id) => {
    try {
      await approveTeacher(id).unwrap();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Approve failed"));
    }
  };

  const onReject = async (id) => {
    const ok = window.confirm("Reject this teacher?");
    if (!ok) return;

    try {
      await rejectTeacher(id).unwrap();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Reject failed"));
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Teacher Pending Requests
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
            onChange={(e) => dispatch(setSearch(e.target.value))}
            placeholder="Search name / email / phone..."
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
              <div className="mt-2 text-sm text-gray-500">
                Make sure you are logged in as <b>admin</b>.
              </div>
            </div>
          ) : pendingTeachers.length === 0 ? (
            <div className="text-center text-gray-500">No pending teacher requests</div>
          ) : (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingTeachers.map((t) => (
                <div
                  key={t._id}
                  className="rounded-2xl bg-white shadow-sm border border-gray-200 overflow-hidden"
                >
                  {/* ✅ make height structure so buttons stick bottom-right */}
                  <div className="p-4 flex flex-col h-full">
                    {/* header */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-lg font-extrabold text-gray-800">{t.name}</div>
                        <div className="text-sm text-gray-600">{t.email}</div>
                        <div className="text-sm text-gray-600">{t.phonenumber}</div>
                      </div>

                      <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-yellow-100 text-yellow-700">
                        PENDING
                      </span>
                    </div>

                    {/* ✅ footer pinned bottom */}
                    <div className="mt-auto pt-4 flex justify-end gap-2">
                      <button
                        onClick={() => onReject(t._id)}
                        disabled={rejecting}
                        className="rounded-xl bg-red-600 px-4 py-2 text-white font-extrabold hover:bg-red-700 transition disabled:opacity-50"
                      >
                        Reject
                      </button>

                      <button
                        onClick={() => onApprove(t._id)}
                        disabled={approving}
                        className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PermissonTeachers;
