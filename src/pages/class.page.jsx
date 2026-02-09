import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  useDeleteClassMutation,
  useGetAllClassesQuery,
  useCreateClassMutation,
  useGetClassByIdQuery,
  useUpdateClassMutation,
} from "../api/classApi";

import { useGetGradesQuery } from "../api/gradeSubjectApi";
import { useGetTeachersQuery } from "../api/teacherAssignmentApi";

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

const ClassPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const action = searchParams.get("action"); // create | view | update | null
  const classId = searchParams.get("classId");

  // ✅ always navigate using pathname+search (more reliable than string)
  const goList = () => navigate({ pathname: "/lms/class", search: "" }, { replace: true });

  const openCreate = () =>
    navigate({ pathname: "/lms/class", search: "?action=create" });

  const openView = (id) =>
    navigate({
      pathname: "/lms/class",
      search: `?action=view&classId=${encodeURIComponent(id)}`,
    });

  const openUpdate = (id) =>
    navigate({
      pathname: "/lms/class",
      search: `?action=update&classId=${encodeURIComponent(id)}`,
    });

  // ======= class list =======
  const { data, isLoading, isError } = useGetAllClassesQuery();
  const [deleteClass, { isLoading: isDeleting }] = useDeleteClassMutation();

  // ======= create/update =======
  const [createClass, { isLoading: isCreating }] = useCreateClassMutation();
  const [updateClass, { isLoading: isUpdating }] = useUpdateClassMutation();

  // ✅ only call details when view/update AND classId exists
  const shouldLoadDetails = (action === "view" || action === "update") && !!classId;

  const {
    data: classRes,
    isLoading: classLoading,
    isError: classError,
  } = useGetClassByIdQuery(classId, {
    skip: !shouldLoadDetails,
  });

  // ======= grades + subjects =======
  const {
    data: gradesRes,
    isLoading: gradesLoading,
    isError: gradesError,
  } = useGetGradesQuery(undefined, {
    skip: !(action === "create" || action === "update"),
  });

  // ======= teachers =======
  const {
    data: teachersRes,
    isLoading: teachersLoading,
    isError: teachersError,
  } = useGetTeachersQuery(
    { status: "approved" },
    { skip: !(action === "create" || action === "update") }
  );

  const allGrades = gradesRes?.grades || [];
  const teachers = teachersRes?.teachers || [];

  const grades = useMemo(() => {
    return allGrades.filter((g) => Number(g?.grade) >= 1 && Number(g?.grade) <= 11);
  }, [allGrades]);

  const rows = useMemo(() => {
    const list = data?.classes || [];
    return list.map((c) => {
      const teacherName =
        c?.teacherIds?.length > 0 ? c.teacherIds[0]?.name : "No Teacher";

      const created = c?.createdAt ? new Date(c.createdAt) : null;
      const createdDate = created ? created.toISOString().slice(0, 10) : "-";
      const createdTime = created ? created.toTimeString().slice(0, 5) : "-";

      return {
        _id: c._id,
        className: c.className || "—",
        grade: c.gradeNo ? `Grade ${c.gradeNo}` : "—",
        subject: c.subjectName || "—",
        teacherName,
        createdDate,
        createdTime,
        imageUrl: c.imageUrl || "",
      };
    });
  }, [data]);

  // ======= upload state =======
  const [uploading, setUploading] = useState(false);

  const uploadClassImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8080";
    const token = localStorage.getItem("token") || "";

    const res = await fetch(`${BACKEND_URL}/api/upload/class-image`, {
      method: "POST",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
      body: formData,
      credentials: "include",
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json?.message || "Upload failed");
    return json; // { url, publicId }
  };

  // ======= form =======
  const [form, setForm] = useState({
    className: "",
    gradeId: "",
    subjectId: "",
    teacherIds: [],
    imageUrl: "",
    imagePublicId: "",
  });

  const selectedGrade = useMemo(() => {
    return grades.find((g) => String(g?._id) === String(form.gradeId));
  }, [grades, form.gradeId]);

  const subjects = selectedGrade?.subjects || [];

  useEffect(() => {
    if (!form.gradeId) return;
    const valid = new Set(subjects.map((s) => String(s?._id)));
    if (form.subjectId && !valid.has(String(form.subjectId))) {
      setForm((p) => ({ ...p, subjectId: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.gradeId]);

  useEffect(() => {
    if (action === "create") {
      setForm({
        className: "",
        gradeId: "",
        subjectId: "",
        teacherIds: [],
        imageUrl: "",
        imagePublicId: "",
      });
    }
  }, [action]);

  // ✅ prefill when update opens
  useEffect(() => {
    if (action !== "update") return;
    const c = classRes?.class;
    if (!c) return;

    setForm({
      className: c?.className || "",
      gradeId: c?.gradeId?._id || c?.gradeId || "",
      subjectId: c?.subjectId || "",
      teacherIds: (c?.teacherIds || []).map((t) => t?._id).filter(Boolean),
      imageUrl: c?.imageUrl || "",
      imagePublicId: c?.imagePublicId || "",
    });
  }, [action, classRes]);

  const onDelete = async (id) => {
    if (!window.confirm("Delete this class?")) return;
    try {
      await deleteClass(id).unwrap();
    } catch (e) {
      alert(e?.data?.message || "Delete failed");
    }
  };

  const submitCreate = async () => {
    if (!form.className || !form.gradeId || !form.subjectId) {
      alert("className, grade, subject are required");
      return;
    }
    if (!form.teacherIds || form.teacherIds.length === 0) {
      alert("Please select at least one teacher");
      return;
    }

    try {
      await createClass({
        className: form.className,
        gradeId: form.gradeId,
        subjectId: form.subjectId,
        teacherIds: form.teacherIds || [],
        imageUrl: form.imageUrl,
        imagePublicId: form.imagePublicId,
      }).unwrap();
      goList();
    } catch (e) {
      alert(e?.data?.message || "Create failed");
    }
  };

  const submitUpdate = async () => {
    if (!classId) return;
    if (!form.className || !form.gradeId || !form.subjectId) {
      alert("className, grade, subject are required");
      return;
    }
    if (!form.teacherIds || form.teacherIds.length === 0) {
      alert("Please select at least one teacher");
      return;
    }

    try {
      await updateClass({
        classId,
        body: {
          className: form.className,
          gradeId: form.gradeId,
          subjectId: form.subjectId,
          teacherIds: form.teacherIds || [],
          imageUrl: form.imageUrl,
          imagePublicId: form.imagePublicId,
        },
      }).unwrap();
      goList();
    } catch (e) {
      alert(e?.data?.message || "Update failed");
    }
  };

  const ImageUploader = ({ inputId }) => {
    const onPickFile = async (file) => {
      if (!file) return;
      if (!file.type?.startsWith("image/")) {
        alert("Only image files allowed");
        return;
      }

      try {
        setUploading(true);
        const up = await uploadClassImage(file);

        setForm((p) => ({
          ...p,
          imageUrl: up.url || "",
          imagePublicId: up.publicId || "",
        }));
      } catch (err) {
        alert(err?.message || "Upload failed");
      } finally {
        setUploading(false);
      }
    };

    return (
      <div>
        <label className="block text-sm font-extrabold text-gray-800">
          Class Image (Drag & Drop)
        </label>

        <div
          className="mt-2 w-full rounded-xl border-2 border-dashed border-gray-300 p-4 text-center cursor-pointer hover:border-blue-400"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            onPickFile(file);
          }}
          onClick={() => document.getElementById(inputId)?.click()}
        >
          <div className="text-sm font-bold text-gray-700">
            {uploading ? "Uploading..." : "Drop image here or click to upload"}
          </div>

          {form.imageUrl ? (
            <div className="mt-3 flex items-center justify-center gap-3">
              <img
                src={form.imageUrl}
                alt="preview"
                className="w-16 h-16 rounded-lg object-cover border"
              />
              <div className="text-left">
                <div className="text-[11px] font-bold text-gray-700">Uploaded</div>
                <div className="text-[10px] text-gray-500 break-all max-w-[320px]">
                  {form.imageUrl}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            onPickFile(file);
            e.target.value = "";
          }}
        />
      </div>
    );
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Class
        </h1>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition"
            onClick={openCreate}
          >
            + Add Class
          </button>
        </div>

        {/* VIEW MODAL */}
        {action === "view" && (
          <ModalShell title="View Class" onClose={goList}>
            {!classId ? (
              <div className="text-red-600 font-bold">Missing classId</div>
            ) : classLoading ? (
              <div className="text-gray-500 font-bold">Loading...</div>
            ) : classError ? (
              <div className="text-red-600 font-bold">Failed to load class</div>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="font-extrabold text-gray-800">
                  Class Name:{" "}
                  <span className="font-bold">{classRes?.class?.className}</span>
                </div>

                <div className="font-extrabold text-gray-800">
                  Grade:{" "}
                  <span className="font-bold">
                    {classRes?.class?.gradeNo
                      ? `Grade ${classRes.class.gradeNo}`
                      : classRes?.class?.gradeId?.grade
                      ? `Grade ${classRes.class.gradeId.grade}`
                      : "—"}
                  </span>
                </div>

                <div className="font-extrabold text-gray-800">
                  Subject:{" "}
                  <span className="font-bold">
                    {classRes?.class?.subjectName || "—"}
                  </span>
                </div>

                <div className="font-extrabold text-gray-800">
                  Teachers:{" "}
                  <span className="font-bold">
                    {(classRes?.class?.teacherIds || [])
                      .map((t) => t?.name)
                      .filter(Boolean)
                      .join(", ") || "No Teacher"}
                  </span>
                </div>

                <div className="font-extrabold text-gray-800">
                  Image:{" "}
                  {classRes?.class?.imageUrl ? (
                    <div className="mt-2 flex items-center gap-3">
                      <img
                        src={classRes.class.imageUrl}
                        alt="class"
                        className="w-16 h-16 rounded-lg object-cover border"
                      />
                      <a
                        href={classRes.class.imageUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-700 underline break-all"
                      >
                        {classRes.class.imageUrl}
                      </a>
                    </div>
                  ) : (
                    <span className="text-gray-400">No image</span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white text-sm font-extrabold hover:bg-blue-700"
                    onClick={() => openUpdate(classId)}
                  >
                    Update
                  </button>
                </div>
              </div>
            )}
          </ModalShell>
        )}

        {/* UPDATE MODAL */}
        {action === "update" && (
          <ModalShell title="Update Class" onClose={goList}>
            {!classId ? (
              <div className="text-red-600 font-bold">Missing classId</div>
            ) : classLoading || gradesLoading || teachersLoading ? (
              <div className="text-gray-500 font-bold">Loading...</div>
            ) : classError ? (
              <div className="text-red-600 font-bold">Failed to load class</div>
            ) : gradesError ? (
              <div className="text-red-600 font-bold">Failed to load grades</div>
            ) : teachersError ? (
              <div className="text-red-600 font-bold">Failed to load teachers</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Class Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.className}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, className: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Grade
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.gradeId}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        gradeId: e.target.value,
                        subjectId: "",
                      }))
                    }
                  >
                    <option value="">Select Grade</option>
                    {grades.map((g) => (
                      <option key={g._id} value={g._id}>
                        Grade {g.grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Subject
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.subjectId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, subjectId: e.target.value }))
                    }
                    disabled={!form.gradeId}
                  >
                    <option value="">
                      {form.gradeId ? "Select Subject" : "Select grade first"}
                    </option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Teachers
                  </label>
                  <select
                    multiple
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 min-h-[120px]"
                    value={form.teacherIds}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions).map(
                        (o) => o.value
                      );
                      setForm((p) => ({ ...p, teacherIds: values }));
                    }}
                  >
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  <div className="mt-1 text-[11px] text-gray-500 font-bold">
                    (Hold Ctrl / Cmd to select multiple)
                  </div>
                </div>

                <ImageUploader inputId="class-image-input-update" />

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
                    disabled={isUpdating || uploading}
                  >
                    {uploading ? "Uploading..." : isUpdating ? "Updating..." : "Update"}
                  </button>
                </div>
              </div>
            )}
          </ModalShell>
        )}

        {/* CREATE MODAL */}
        {action === "create" && (
          <ModalShell title="Create Class" onClose={goList}>
            {gradesLoading || teachersLoading ? (
              <div className="text-gray-500 font-bold">Loading...</div>
            ) : gradesError ? (
              <div className="text-red-600 font-bold">Failed to load grades</div>
            ) : teachersError ? (
              <div className="text-red-600 font-bold">Failed to load teachers</div>
            ) : (
              <div className="space-y-4">
                {/* same create form as before */}
                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Class Name
                  </label>
                  <input
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.className}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, className: e.target.value }))
                    }
                    placeholder="Enter class name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Grade
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.gradeId}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        gradeId: e.target.value,
                        subjectId: "",
                      }))
                    }
                  >
                    <option value="">Select Grade</option>
                    {grades.map((g) => (
                      <option key={g._id} value={g._id}>
                        Grade {g.grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Subject
                  </label>
                  <select
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300"
                    value={form.subjectId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, subjectId: e.target.value }))
                    }
                    disabled={!form.gradeId}
                  >
                    <option value="">
                      {form.gradeId ? "Select Subject" : "Select grade first"}
                    </option>
                    {subjects.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-extrabold text-gray-800">
                    Teachers
                  </label>
                  <select
                    multiple
                    className="mt-2 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-blue-300 min-h-[120px]"
                    value={form.teacherIds}
                    onChange={(e) => {
                      const values = Array.from(e.target.selectedOptions).map(
                        (o) => o.value
                      );
                      setForm((p) => ({ ...p, teacherIds: values }));
                    }}
                  >
                    {teachers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>

                <ImageUploader inputId="class-image-input-create" />

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
                    disabled={isCreating || uploading}
                  >
                    {uploading ? "Uploading..." : isCreating ? "Creating..." : "Create"}
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
                <th className="p-3 text-left w-[10%]">Grade</th>
                <th className="p-3 text-left w-[14%]">Subject</th>
                <th className="p-3 text-left w-[16%]">Teacher Name</th>
                <th className="p-3 text-left w-[16%]">Image</th>
                <th className="p-3 text-left w-[12%]">Created Date</th>
                <th className="p-3 text-left w-[8%]">Time</th>
                <th className="p-3 text-center w-[8%]">Operation</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-red-600">
                    Failed to load classes
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-gray-500">
                    No class records found
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r._id} className="border-t text-sm">
                    <td className="p-3 truncate font-semibold">{r.className}</td>
                    <td className="p-3 truncate">{r.grade}</td>
                    <td className="p-3 truncate">{r.subject}</td>
                    <td className="p-3 truncate">{r.teacherName}</td>

                    <td className="p-3">
                      {r.imageUrl ? (
                        <div className="flex items-center gap-2">
                          <img
                            src={r.imageUrl}
                            alt="class"
                            className="w-10 h-10 rounded-lg object-cover border"
                          />
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">No image</span>
                      )}
                    </td>

                    <td className="p-3 truncate">{r.createdDate}</td>
                    <td className="p-3 truncate">{r.createdTime}</td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2 whitespace-nowrap">
                        <button
                          type="button"
                          className="rounded-lg bg-indigo-600 px-3 py-1 text-white text-xs font-bold hover:bg-indigo-700"
                          onClick={() => openView(r._id)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                          onClick={() => openUpdate(r._id)}
                        >
                          Update
                        </button>

                        <button
                          type="button"
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

export default ClassPage;
