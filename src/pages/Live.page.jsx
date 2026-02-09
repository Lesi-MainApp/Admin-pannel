// src/pages/live.page.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useGetAllClassesQuery } from "../api/classApi";
import {
  useGetAllLivesQuery,
  useCreateLiveMutation,
  useUpdateLiveMutation,
  useDeleteLiveMutation,
  useGetLiveByIdQuery,
} from "../api/liveApi";

const ModalShell = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />
      <div className="relative w-[95vw] max-w-[720px] bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
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

const toDateInput = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toISOString().slice(0, 10);
};

const toTimeInput = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toTimeString().slice(0, 5);
};

const buildScheduledAt = (date, time) => {
  if (!date || !time) return "";
  // local time -> ISO
  const dt = new Date(`${date}T${time}:00`);
  return dt.toISOString();
};

const LivePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const action = searchParams.get("action"); // create | update | view | null
  const liveId = searchParams.get("liveId");

  const goList = () => navigate("/lms/live", { replace: true });

  // ✅ classes for dropdown + autofill
  const {
    data: classRes,
    isLoading: classLoading,
    isError: classError,
  } = useGetAllClassesQuery();

  const classes = classRes?.classes || [];

  // ✅ live list
  const {
    data: liveRes,
    isLoading: liveLoading,
    isError: liveError,
  } = useGetAllLivesQuery();

  const lives = liveRes?.lives || [];

  const [createLive, { isLoading: creating }] = useCreateLiveMutation();
  const [updateLive, { isLoading: updating }] = useUpdateLiveMutation();
  const [deleteLive, { isLoading: deleting }] = useDeleteLiveMutation();

  const {
    data: liveByIdRes,
    isLoading: liveByIdLoading,
    isError: liveByIdError,
  } = useGetLiveByIdQuery(liveId, {
    skip: !(action === "update" || action === "view") || !liveId,
  });

  // ===== form =====
  const [form, setForm] = useState({
    classId: "",
    zoomLink: "",
    date: "",
    time: "",
  });

  const selectedClass = useMemo(() => {
    return classes.find((c) => String(c?._id) === String(form.classId));
  }, [classes, form.classId]);

  const teacherName = useMemo(() => {
    const t = selectedClass?.teacherIds?.[0];
    return t?.name || "—";
  }, [selectedClass]);

  const gradeName = useMemo(() => {
    return selectedClass?.gradeNo ? `Grade ${selectedClass.gradeNo}` : "—";
  }, [selectedClass]);

  const subjectName = useMemo(() => {
    return selectedClass?.subjectName || "—";
  }, [selectedClass]);

  // reset on create
  useEffect(() => {
    if (action === "create") {
      setForm({ classId: "", zoomLink: "", date: "", time: "" });
    }
  }, [action]);

  // prefill on update
  useEffect(() => {
    if (action !== "update") return;
    const live = liveByIdRes?.live;
    if (!live) return;

    setForm({
      classId: live?.classId?._id || live?.classId || "",
      zoomLink: live?.zoomLink || "",
      date: toDateInput(live?.scheduledAt),
      time: toTimeInput(live?.scheduledAt),
    });
  }, [action, liveByIdRes]);

  // table rows
  const rows = useMemo(() => {
    return lives.map((l) => {
      const dt = l?.scheduledAt ? new Date(l.scheduledAt) : null;
      const date = dt && !Number.isNaN(dt.getTime()) ? dt.toISOString().slice(0, 10) : "—";
      const time = dt && !Number.isNaN(dt.getTime()) ? dt.toTimeString().slice(0, 5) : "—";

      return {
        _id: l._id,
        className: l.className || "—",
        teacherName: (l.teacherNames || []).join(", ") || "—",
        grade: l.gradeName ? `Grade ${l.gradeName}` : "—",
        subject: l.subjectName || "—",
        zoomLink: l.zoomLink || "—",
        date,
        time,
      };
    });
  }, [lives]);

  const openCreate = () => navigate("/lms/live?action=create");
  const openUpdate = (id) => navigate(`/lms/live?action=update&liveId=${id}`);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this live?")) return;
    try {
      await deleteLive(id).unwrap();
    } catch (e) {
      alert(e?.data?.message || "Delete failed");
    }
  };

  const submitCreate = async () => {
    if (!form.classId || !form.zoomLink || !form.date || !form.time) {
      alert("class, zoom link, date, time are required");
      return;
    }

    try {
      await createLive({
        classId: form.classId,
        title: `${selectedClass?.className || "Live"}`, // backend requires title
        scheduledAt: buildScheduledAt(form.date, form.time),
        zoomLink: form.zoomLink,
      }).unwrap();
      goList();
    } catch (e) {
      alert(e?.data?.message || "Create failed");
    }
  };

  const submitUpdate = async () => {
    if (!liveId) return;
    if (!form.classId || !form.zoomLink || !form.date || !form.time) {
      alert("class, zoom link, date, time are required");
      return;
    }

    try {
      await updateLive({
        id: liveId,
        body: {
          classId: form.classId,
          title: `${selectedClass?.className || "Live"}`,
          scheduledAt: buildScheduledAt(form.date, form.time),
          zoomLink: form.zoomLink,
        },
      }).unwrap();
      goList();
    } catch (e) {
      alert(e?.data?.message || "Update failed");
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Live
        </h1>

        <div className="mt-4 flex justify-end">
          <button
            className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition"
            onClick={openCreate}
          >
            + Add Live
          </button>
        </div>

        {/* CREATE MODAL */}
        {action === "create" && (
          <ModalShell title="Create Live" onClose={goList}>
            {classLoading ? (
              <div className="text-gray-500 font-bold">Loading...</div>
            ) : classError ? (
              <div className="text-red-600 font-bold">Failed to load classes</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Class Name
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.classId}
                    onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-sm font-extrabold text-gray-800">
                    Teacher Name: <span className="font-bold">{teacherName}</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">
                    Grade: <span className="font-bold">{gradeName}</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">
                    Subject: <span className="font-bold">{subjectName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Zoom Link
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.zoomLink}
                    onChange={(e) => setForm((p) => ({ ...p, zoomLink: e.target.value }))}
                    placeholder="Enter zoom link"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Date
                    </label>
                    <input
                      type="date"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Time
                    </label>
                    <input
                      type="time"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.time}
                      onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-gray-700 px-4 py-2 text-white text-sm font-extrabold hover:bg-gray-800"
                    onClick={goList}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="rounded-lg bg-green-600 px-4 py-2 text-white text-sm font-extrabold hover:bg-green-700"
                    onClick={submitCreate}
                    disabled={creating}
                  >
                    {creating ? "Creating..." : "Create"}
                  </button>
                </div>
              </div>
            )}
          </ModalShell>
        )}

        {/* UPDATE MODAL */}
        {action === "update" && (
          <ModalShell title="Update Live" onClose={goList}>
            {!liveId ? (
              <div className="text-red-600 font-bold">Missing liveId</div>
            ) : liveByIdLoading || classLoading ? (
              <div className="text-gray-500 font-bold">Loading...</div>
            ) : liveByIdError ? (
              <div className="text-red-600 font-bold">Failed to load live</div>
            ) : classError ? (
              <div className="text-red-600 font-bold">Failed to load classes</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Class Name
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.classId}
                    onChange={(e) => setForm((p) => ({ ...p, classId: e.target.value }))}
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="text-sm font-extrabold text-gray-800">
                    Teacher Name: <span className="font-bold">{teacherName}</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">
                    Grade: <span className="font-bold">{gradeName}</span>
                  </div>
                  <div className="text-sm font-extrabold text-gray-800">
                    Subject: <span className="font-bold">{subjectName}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Zoom Link
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.zoomLink}
                    onChange={(e) => setForm((p) => ({ ...p, zoomLink: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Date
                    </label>
                    <input
                      type="date"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.date}
                      onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Time
                    </label>
                    <input
                      type="time"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.time}
                      onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-gray-700 px-4 py-2 text-white text-sm font-extrabold hover:bg-gray-800"
                    onClick={goList}
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-extrabold hover:bg-blue-700"
                    onClick={submitUpdate}
                    disabled={updating}
                  >
                    {updating ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            )}
          </ModalShell>
        )}

        {/* TABLE */}
        <div className="mt-4 w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-sm">
                <th className="p-3 text-left w-[16%]">Class Name</th>
                <th className="p-3 text-left w-[16%]">Teacher Name</th>
                <th className="p-3 text-left w-[10%]">Grade</th>
                <th className="p-3 text-left w-[14%]">Subject</th>
                <th className="p-3 text-left w-[20%]">Zoom Link</th>
                <th className="p-3 text-left w-[10%]">Date</th>
                <th className="p-3 text-left w-[8%]">Time</th>
                <th className="p-3 text-center w-[12%]">Operation</th>
              </tr>
            </thead>

            <tbody>
              {liveLoading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : liveError ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-red-600">
                    Failed to load lives
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    No live records found
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="border-t text-sm">
                    <td className="p-3 truncate font-semibold">{r.className}</td>
                    <td className="p-3 truncate">{r.teacherName}</td>
                    <td className="p-3 truncate">{r.grade}</td>
                    <td className="p-3 truncate">{r.subject}</td>

                    <td className="p-3 truncate">
                      {r.zoomLink !== "—" ? (
                        <a
                          href={r.zoomLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 font-bold hover:underline"
                        >
                          Open Link
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td className="p-3 truncate">{r.date}</td>
                    <td className="p-3 truncate">{r.time}</td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                          onClick={() => openUpdate(r._id)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700"
                          onClick={() => onDelete(r._id)}
                          disabled={deleting}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LivePage;
