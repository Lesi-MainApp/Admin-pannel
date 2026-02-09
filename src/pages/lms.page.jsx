// src/pages/lms.page.jsx
import React, { useEffect, useMemo, useState } from "react";

import {
  useGetAllLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonByIdMutation,
  useDeleteLessonByIdMutation,
} from "../api/lessonApi";

import { useGetAllClassesQuery } from "../api/classApi";

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

const LMSPage = () => {
  // ===== APIs =====
  const {
    data: lessonsRes,
    isLoading: lessonsLoading,
    isError: lessonsError,
  } = useGetAllLessonsQuery();

  const {
    data: classesRes,
    isLoading: classesLoading,
    isError: classesError,
  } = useGetAllClassesQuery();

  const [createLesson, { isLoading: isCreating }] = useCreateLessonMutation();
  const [updateLessonById, { isLoading: isUpdating }] = useUpdateLessonByIdMutation();
  const [deleteLessonById, { isLoading: isDeleting }] = useDeleteLessonByIdMutation();

  const classes = classesRes?.classes || [];
  const lessons = lessonsRes?.lessons || [];

  // ===== UI state (modals) =====
  const [modal, setModal] = useState({ open: false, mode: "create", lessonId: null });

  const openCreate = () => setModal({ open: true, mode: "create", lessonId: null });
  const openEdit = (lesson) => setModal({ open: true, mode: "edit", lessonId: lesson?._id || null });
  const closeModal = () => setModal({ open: false, mode: "create", lessonId: null });

  // ===== Form =====
  const [form, setForm] = useState({
    classId: "",
    grade: "",
    subject: "",
    teacherName: "",
    youtubeUrl: "",
    title: "",
    description: "",
    date: "",
    time: "",
  });

  const selectedClass = useMemo(() => {
    return classes.find((c) => String(c?._id) === String(form.classId));
  }, [classes, form.classId]);

  const autoInfo = useMemo(() => {
    if (!selectedClass) return { grade: "", subject: "", teacherName: "" };

    const grade =
      selectedClass?.gradeNo
        ? `Grade ${selectedClass.gradeNo}`
        : selectedClass?.gradeId?.grade
        ? `Grade ${selectedClass.gradeId.grade}`
        : selectedClass?.grade
        ? `Grade ${selectedClass.grade}`
        : "";

    const subject = selectedClass?.subjectName || selectedClass?.subject || "";

    const teacherName =
      (selectedClass?.teacherIds || [])
        .map((t) => t?.name)
        .filter(Boolean)
        .join(", ") || "No Teacher";

    return { grade, subject, teacherName };
  }, [selectedClass]);

  // Keep grade/subject/teacher auto-filled when class changes
  useEffect(() => {
    if (!form.classId) {
      setForm((p) => ({ ...p, grade: "", subject: "", teacherName: "" }));
      return;
    }
    setForm((p) => ({
      ...p,
      grade: autoInfo.grade,
      subject: autoInfo.subject,
      teacherName: autoInfo.teacherName,
    }));
  }, [form.classId, autoInfo.grade, autoInfo.subject, autoInfo.teacherName]);

  // Reset on open create
  useEffect(() => {
    if (!modal.open) return;
    if (modal.mode === "create") {
      setForm({
        classId: "",
        grade: "",
        subject: "",
        teacherName: "",
        youtubeUrl: "",
        title: "",
        description: "",
        date: "",
        time: "",
      });
    }
  }, [modal.open, modal.mode]);

  // Prefill on edit
  useEffect(() => {
    if (!modal.open || modal.mode !== "edit") return;

    const lesson = lessons.find((l) => String(l?._id) === String(modal.lessonId));
    if (!lesson) return;

    const classId = lesson?.classId || "";

    const grade =
      lesson?.classDetails?.grade ? `Grade ${lesson.classDetails.grade}` : "";

    const subject = lesson?.classDetails?.subject || "";

    const teacherName =
      (lesson?.classDetails?.teachers || []).join(", ") || "No Teacher";

    setForm({
      classId,
      grade,
      subject,
      teacherName,
      youtubeUrl: lesson?.youtubeUrl || "",
      title: lesson?.title || "",
      description: lesson?.description || "",
      date: lesson?.date || "",
      time: lesson?.time || "",
    });
  }, [modal.open, modal.mode, modal.lessonId, lessons]);

  // ===== Table rows (ONLY your fields) =====
  const rows = useMemo(() => {
    return lessons.map((l) => {
      const className = l?.classDetails?.className || "—";
      const grade = l?.classDetails?.grade ? `Grade ${l.classDetails.grade}` : "—";
      const subject = l?.classDetails?.subject || "—";
      const teacher = (l?.classDetails?.teachers || []).join(", ") || "No Teacher";

      return {
        _id: l._id,
        className,
        grade,
        subject,
        teacher,
        youtubeUrl: l.youtubeUrl || "",
        lessonName: l.title || "—",
        description: l.description || "—",
        date: l.date || "—",
        time: l.time || "—",
        raw: l,
      };
    });
  }, [lessons]);

  // ===== Actions =====
  const validate = () => {
    if (!form.classId) {
      alert("Please select a class");
      return false;
    }
    if (!form.title || !form.date || !form.time) {
      alert("Lesson name, date, time are required");
      return false;
    }
    return true;
  };

  const submitCreate = async () => {
    if (!validate()) return;

    try {
      await createLesson({
        classId: form.classId,
        title: form.title,
        date: form.date,
        time: form.time,
        description: form.description || "",
        youtubeUrl: form.youtubeUrl || "",
      }).unwrap();
      closeModal();
    } catch (e) {
      alert(e?.data?.message || "Create failed");
    }
  };

  const submitUpdate = async () => {
    if (!validate()) return;
    if (!modal.lessonId) return;

    try {
      await updateLessonById({
        lessonId: modal.lessonId,
        body: {
          classId: form.classId,
          title: form.title,
          date: form.date,
          time: form.time,
          description: form.description || "",
          youtubeUrl: form.youtubeUrl || "",
        },
      }).unwrap();
      closeModal();
    } catch (e) {
      alert(e?.data?.message || "Update failed");
    }
  };

  const onDelete = async (lessonId) => {
    if (!window.confirm("Delete this lesson?")) return;
    try {
      await deleteLessonById(lessonId).unwrap();
    } catch (e) {
      alert(e?.data?.message || "Delete failed");
    }
  };

  const formLoading = classesLoading || lessonsLoading;

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          LMS
        </h1>

        <div className="mt-4 flex justify-end">
          <button
            className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition"
            onClick={openCreate}
          >
            + Add LMS
          </button>
        </div>

        {/* CREATE / EDIT MODAL */}
        {modal.open && (
          <ModalShell
            title={modal.mode === "create" ? "Create Lesson" : "Edit Lesson"}
            onClose={closeModal}
          >
            {formLoading ? (
              <div className="text-gray-500 font-bold">Loading...</div>
            ) : classesError ? (
              <div className="text-red-600 font-bold">Failed to load classes</div>
            ) : (
              <div className="space-y-4">
                {/* Class dropdown */}
                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Class Name <span className="text-red-600">*</span>
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.classId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, classId: e.target.value }))
                    }
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.className}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Auto fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Grade (Auto)
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none bg-gray-50"
                      value={form.grade}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Subject (Auto)
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none bg-gray-50"
                      value={form.subject}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Teacher Name (Auto)
                    </label>
                    <input
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none bg-gray-50"
                      value={form.teacherName}
                      disabled
                    />
                  </div>
                </div>

                {/* YouTube link */}
                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    YouTube Link
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.youtubeUrl}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, youtubeUrl: e.target.value }))
                    }
                    placeholder="https://youtube.com/..."
                  />
                </div>

                {/* Lesson name */}
                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Lesson Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.title}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, title: e.target.value }))
                    }
                    placeholder="Enter lesson name"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Description
                  </label>
                  <textarea
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 min-h-[90px]"
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Enter description"
                  />
                </div>

                {/* Date + Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Date <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="date"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.date}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, date: e.target.value }))
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-extrabold text-gray-800">
                      Time <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="time"
                      className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                      value={form.time}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, time: e.target.value }))
                      }
                    />
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="rounded-lg bg-gray-700 px-4 py-2 text-white text-sm font-extrabold hover:bg-gray-800"
                    onClick={closeModal}
                  >
                    Cancel
                  </button>

                  {modal.mode === "create" ? (
                    <button
                      type="button"
                      className="rounded-lg bg-green-600 px-4 py-2 text-white text-sm font-extrabold hover:bg-green-700"
                      onClick={submitCreate}
                      disabled={isCreating}
                    >
                      {isCreating ? "Creating..." : "Create"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-extrabold hover:bg-blue-700"
                      onClick={submitUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Updating..." : "Update"}
                    </button>
                  )}
                </div>
              </div>
            )}
          </ModalShell>
        )}

        {/* TABLE (same design, only your fields) */}
        <div className="mt-4 w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-sm">
                <th className="p-3 text-left w-[12%]">Class Name</th>
                <th className="p-3 text-left w-[8%]">Grade</th>
                <th className="p-3 text-left w-[10%]">Subject</th>
                <th className="p-3 text-left w-[12%]">Teacher Name</th>
                <th className="p-3 text-left w-[10%]">YouTube Link</th>
                <th className="p-3 text-left w-[12%]">Lesson Name</th>
                <th className="p-3 text-left w-[16%]">Description</th>
                <th className="p-3 text-left w-[10%]">Date</th>
                <th className="p-3 text-left w-[6%]">Time</th>
                <th className="p-3 text-center w-[10%]">Operation</th>
              </tr>
            </thead>

            <tbody>
              {lessonsLoading ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : lessonsError ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-red-600">
                    Failed to load lessons
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-6 text-center text-gray-500">
                    No LMS records found
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="border-t text-sm">
                    <td className="p-3 truncate">{r.className}</td>
                    <td className="p-3 truncate">{r.grade}</td>
                    <td className="p-3 truncate">{r.subject}</td>
                    <td className="p-3 truncate">{r.teacher}</td>

                    <td className="p-3 truncate">
                      {r.youtubeUrl ? (
                        <a
                          href={r.youtubeUrl}
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

                    <td className="p-3 truncate">{r.lessonName}</td>
                    <td className="p-3 truncate">{r.description}</td>
                    <td className="p-3 truncate">{r.date}</td>
                    <td className="p-3 truncate">{r.time}</td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button
                          className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                          onClick={() => openEdit(r.raw)}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700"
                          onClick={() => onDelete(r._id)}
                          disabled={isDeleting}
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

export default LMSPage;
