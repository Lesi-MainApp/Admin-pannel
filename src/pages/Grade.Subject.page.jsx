// src/pages/GradeSubject.page.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetGradesQuery,
  useCreateGradeMutation,
  useDeleteGradeMutation,

  // 1-11 subjects
  useGetSubjectsByGradeQuery,
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
  useDeleteSubjectMutation,

  // 12-13 streams + stream subjects
  useGetStreamsByGradeQuery,
  useCreateStreamMutation,
  useUpdateStreamMutation,
  useDeleteStreamMutation,

  useGetStreamSubjectsQuery,
  useCreateStreamSubjectMutation,
  useUpdateStreamSubjectMutation,
  useDeleteStreamSubjectMutation,
} from "../api/gradeSubjectApi";

const ROWS_PER_PAGE = 20;

/* ---------------------- PROFESSIONAL MODAL ---------------------- */
const Modal = ({ open, title, children, onClose, maxWidth = "max-w-lg" }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-3">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div
        className={`relative w-full ${maxWidth} overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#F8FAFC] px-4 py-4 sm:px-6">
          <div className="text-base font-semibold text-gray-800">{title}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
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

const is12or13 = (n) => n === 12 || n === 13;
const gradeOptions = Array.from({ length: 13 }, (_, i) => i + 1);

/* -------------------- Modal: Grade 1–11 Subjects -------------------- */
function GradeSubjectsModal({ open, grade, onClose }) {
  const gradeId = grade?._id;
  const enabled = open && gradeId;

  const { data, isLoading } = useGetSubjectsByGradeQuery(gradeId, { skip: !enabled });
  const subjects = data?.subjects || [];

  const [createSubject] = useCreateSubjectMutation();
  const [updateSubject] = useUpdateSubjectMutation();
  const [deleteSubject] = useDeleteSubjectMutation();

  const [newSubject, setNewSubject] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const add = async () => {
    const name = newSubject.trim();
    if (!name) return;
    try {
      await createSubject({ gradeId, subject: name }).unwrap();
      setNewSubject("");
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  const startEdit = (s) => {
    setEditId(s._id);
    setEditValue(s.subject);
  };

  const saveEdit = async () => {
    const name = editValue.trim();
    if (!name) return;
    try {
      await updateSubject({ gradeId, subjectId: editId, subject: name }).unwrap();
      setEditId(null);
      setEditValue("");
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  const remove = async (subjectId) => {
    const ok = window.confirm("Delete subject?");
    if (!ok) return;
    try {
      await deleteSubject({ gradeId, subjectId }).unwrap();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  return (
    <Modal open={open} title={`Grade ${grade?.grade} Subjects`} onClose={onClose}>
      <div className="flex gap-2">
        <input
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="New subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <button
          onClick={add}
          className="rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          Add
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : subjects.length === 0 ? (
          <div className="text-sm text-gray-500">No subjects</div>
        ) : (
          subjects.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between gap-2 border border-gray-200 bg-white px-3 py-2"
            >
              {editId === s._id ? (
                <input
                  className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              ) : (
                <span className="text-sm font-medium text-gray-800">{s.subject}</span>
              )}

              <div className="flex gap-2">
                {editId === s._id ? (
                  <button
                    onClick={saveEdit}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(s)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => remove(s._id)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

/* -------------------- Modal: Grade 12–13 Stream Subjects -------------------- */
function StreamSubjectsModal({ open, grade, onClose }) {
  const gradeId = grade?._id;
  const enabled = open && gradeId;

  const { data: streamsData, isLoading: streamsLoading } = useGetStreamsByGradeQuery(gradeId, {
    skip: !enabled,
  });
  const streams = streamsData?.streams || [];

  const [selectedStreamId, setSelectedStreamId] = useState("");

  const { data: streamSubjectsData, isLoading: streamSubjectsLoading } = useGetStreamSubjectsQuery(
    { gradeId, streamId: selectedStreamId },
    { skip: !enabled || !selectedStreamId }
  );

  const subjects = streamSubjectsData?.subjects || [];

  const [createStreamSubject] = useCreateStreamSubjectMutation();
  const [updateStreamSubject] = useUpdateStreamSubjectMutation();
  const [deleteStreamSubject] = useDeleteStreamSubjectMutation();

  const [newSubject, setNewSubject] = useState("");
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const add = async () => {
    if (!selectedStreamId) return alert("Select a stream");
    const name = newSubject.trim();
    if (!name) return;
    try {
      await createStreamSubject({
        gradeId,
        streamId: selectedStreamId,
        subject: name,
      }).unwrap();
      setNewSubject("");
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  const startEdit = (s) => {
    setEditId(s._id);
    setEditValue(s.subject);
  };

  const saveEdit = async () => {
    const name = editValue.trim();
    if (!name) return;
    try {
      await updateStreamSubject({
        gradeId,
        streamId: selectedStreamId,
        subjectId: editId,
        subject: name,
      }).unwrap();
      setEditId(null);
      setEditValue("");
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  const remove = async (subjectId) => {
    const ok = window.confirm("Delete stream subject?");
    if (!ok) return;
    try {
      await deleteStreamSubject({
        gradeId,
        streamId: selectedStreamId,
        subjectId,
      }).unwrap();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  return (
    <Modal open={open} title={`Grade ${grade?.grade} Stream Subjects`} onClose={onClose}>
      <div>
        <label className="block text-sm font-medium text-gray-700">Select Stream</label>
        {streamsLoading ? (
          <div className="mt-2 text-sm text-gray-500">Loading streams...</div>
        ) : (
          <select
            className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
            value={selectedStreamId}
            onChange={(e) => setSelectedStreamId(e.target.value)}
          >
            <option value="">Select Stream</option>
            {streams.map((st) => (
              <option key={st._id} value={st._id}>
                {st.stream}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mt-3 flex gap-2">
        <input
          className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
          placeholder="New subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          disabled={!selectedStreamId}
        />
        <button
          onClick={add}
          disabled={!selectedStreamId}
          className="rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          Add
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {!selectedStreamId ? (
          <div className="text-sm text-gray-500">Select a stream to view subjects</div>
        ) : streamSubjectsLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : subjects.length === 0 ? (
          <div className="text-sm text-gray-500">No subjects</div>
        ) : (
          subjects.map((s) => (
            <div
              key={s._id}
              className="flex items-center justify-between gap-2 border border-gray-200 bg-white px-3 py-2"
            >
              {editId === s._id ? (
                <input
                  className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              ) : (
                <span className="text-sm font-medium text-gray-800">{s.subject}</span>
              )}

              <div className="flex gap-2">
                {editId === s._id ? (
                  <button
                    onClick={saveEdit}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(s)}
                    className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => remove(s._id)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}

/* --------------------- Main Page --------------------- */
const GradeSubjectPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, refetch } = useGetGradesQuery();
  const grades = data?.grades || [];

  const [createGrade] = useCreateGradeMutation();
  const [deleteGrade] = useDeleteGradeMutation();
  const [createSubject] = useCreateSubjectMutation();
  const [createStream] = useCreateStreamMutation();

  // top modal
  const [topOpen, setTopOpen] = useState(false);
  const [topGradeNumber, setTopGradeNumber] = useState("");
  const [topName, setTopName] = useState("");

  // row add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addGradeDoc, setAddGradeDoc] = useState(null);
  const [addValue, setAddValue] = useState("");

  // view modals
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [streamSubjectsOpen, setStreamSubjectsOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  // pagination
  const [page1, setPage1] = useState(1);
  const [page2, setPage2] = useState(1);

  const grade1to11 = useMemo(
    () => grades.filter((g) => g.grade >= 1 && g.grade <= 11),
    [grades]
  );
  const grade12to13 = useMemo(
    () => grades.filter((g) => g.grade === 12 || g.grade === 13),
    [grades]
  );

  const totalPages1 = Math.max(1, Math.ceil(grade1to11.length / ROWS_PER_PAGE));
  const totalPages2 = Math.max(1, Math.ceil(grade12to13.length / ROWS_PER_PAGE));

  const rows1 = useMemo(() => {
    const start = (page1 - 1) * ROWS_PER_PAGE;
    return grade1to11.slice(start, start + ROWS_PER_PAGE);
  }, [grade1to11, page1]);

  const rows2 = useMemo(() => {
    const start = (page2 - 1) * ROWS_PER_PAGE;
    return grade12to13.slice(start, start + ROWS_PER_PAGE);
  }, [grade12to13, page2]);

  const submitTop = async () => {
    const g = Number(topGradeNumber);
    if (!g) return alert("Select grade");

    const name = topName.trim();
    if (!name) return alert(is12or13(g) ? "Stream required" : "Subject required");

    try {
      let gradeDoc = grades.find((x) => x.grade === g);

      if (!gradeDoc) {
        const res = await createGrade({ grade: g }).unwrap();
        gradeDoc = res?.grade;
        await refetch();
      }

      if (!gradeDoc?._id) return alert("Grade create failed");

      if (is12or13(g)) {
        await createStream({ gradeId: gradeDoc._id, stream: name }).unwrap();
      } else {
        await createSubject({ gradeId: gradeDoc._id, subject: name }).unwrap();
      }

      setTopOpen(false);
      setTopGradeNumber("");
      setTopName("");
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  const openAddForRow = (g) => {
    setAddGradeDoc(g);
    setAddValue("");
    setAddOpen(true);
  };

  const submitAddForRow = async () => {
    if (!addGradeDoc) return;
    const g = Number(addGradeDoc.grade);

    const name = addValue.trim();
    if (!name) return alert(is12or13(g) ? "Stream required" : "Subject required");

    try {
      if (is12or13(g)) {
        await createStream({ gradeId: addGradeDoc._id, stream: name }).unwrap();
      } else {
        await createSubject({ gradeId: addGradeDoc._id, subject: name }).unwrap();
      }
      setAddOpen(false);
      setAddGradeDoc(null);
      setAddValue("");
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  const removeGrade = async (g) => {
    const ok = window.confirm(`Delete Grade ${g.grade}?`);
    if (!ok) return;
    try {
      await deleteGrade({ gradeId: g._id }).unwrap();
      await refetch();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  return (
    <div className="flex w-full justify-center ">
      <div className="min-w-0 w-full max-w-[95vw] px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Grade & Subject Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage grades, subjects, streams, and stream subjects.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setTopOpen(true)}
              className="inline-flex h-9 items-center justify-center rounded-lg bg-blue-600 px-3 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              + Add Grade
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

        {/* TABLE 1 */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800">Grades 1 - 11</h2>

          <div className="mt-3 overflow-hidden border border-gray-200 bg-white">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[900px] table-fixed border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#F8FAFC] text-left text-[13px] font-medium text-gray-600">
                    <th className="w-[35%] border-b border-r border-gray-200 px-4 py-3">
                      Grade
                    </th>
                    <th className="w-[25%] border-b border-r border-gray-200 px-4 py-3 text-center">
                      Subject
                    </th>
                    <th className="w-[40%] border-b border-gray-200 px-4 py-3 text-center">
                      Operation
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white text-sm text-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : rows1.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                        No grades
                      </td>
                    </tr>
                  ) : (
                    rows1.map((g) => (
                      <tr key={g._id} className="hover:bg-gray-50/70">
                        <td className="border-b border-r border-gray-200 px-4 py-4 align-middle">
                          <div className="truncate font-medium text-gray-800">
                            Grade {g.grade}
                          </div>
                        </td>

                        <td className="border-b border-r border-gray-200 px-4 py-4 align-middle text-center">
                          <button
                            onClick={() => {
                              setSelectedGrade(g);
                              setSubjectsOpen(true);
                            }}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                          >
                            View
                          </button>
                        </td>

                        <td className="border-b border-gray-200 px-4 py-4 align-middle">
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              onClick={() => openAddForRow(g)}
                              className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                            >
                              Add Subject
                            </button>
                            <button
                              onClick={() => removeGrade(g)}
                              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
                            >
                              Delete Grade
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {grade1to11.length === 0
                  ? "0 to 0 of 0"
                  : `${(page1 - 1) * ROWS_PER_PAGE + 1} to ${Math.min(
                      page1 * ROWS_PER_PAGE,
                      grade1to11.length
                    )} of ${grade1to11.length}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage1(1)}
                  disabled={page1 === 1}
                  className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 disabled:opacity-50"
                >
                  {"<<"}
                </button>
                <button
                  type="button"
                  onClick={() => setPage1((p) => Math.max(1, p - 1))}
                  disabled={page1 === 1}
                  className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 disabled:opacity-50"
                >
                  {"<"}
                </button>
                <span className="px-2 text-sm font-medium text-gray-700">
                  Page {page1} of {totalPages1}
                </span>
                <button
                  type="button"
                  onClick={() => setPage1((p) => Math.min(totalPages1, p + 1))}
                  disabled={page1 === totalPages1}
                  className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 disabled:opacity-50"
                >
                  {">"}
                </button>
                <button
                  type="button"
                  onClick={() => setPage1(totalPages1)}
                  disabled={page1 === totalPages1}
                  className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 disabled:opacity-50"
                >
                  {">>"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABLE 2 */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800">Grades 12 - 13</h2>

          <div className="mt-3 overflow-hidden border border-gray-200 bg-white">
            <div className="w-full overflow-x-auto">
              <table className="w-full min-w-[1100px] table-fixed border-separate border-spacing-0">
                <thead>
                  <tr className="bg-[#F8FAFC] text-left text-[13px] font-medium text-gray-600">
                    <th className="w-[20%] border-b border-r border-gray-200 px-4 py-3">
                      Grade
                    </th>
                    <th className="w-[35%] border-b border-r border-gray-200 px-4 py-3">
                      Stream
                    </th>
                    <th className="w-[20%] border-b border-r border-gray-200 px-4 py-3 text-center">
                      Subjects
                    </th>
                    <th className="w-[25%] border-b border-gray-200 px-4 py-3 text-center">
                      Operation
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white text-sm text-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Loading...
                      </td>
                    </tr>
                  ) : rows2.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        No grades
                      </td>
                    </tr>
                  ) : (
                    rows2.map((g) => (
                      <Grade12Row
                        key={g._id}
                        grade={g}
                        onAdd={() => openAddForRow(g)}
                        onDelete={() => removeGrade(g)}
                        onViewSubjects={() => {
                          setSelectedGrade(g);
                          setStreamSubjectsOpen(true);
                        }}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                {grade12to13.length === 0
                  ? "0 to 0 of 0"
                  : `${(page2 - 1) * ROWS_PER_PAGE + 1} to ${Math.min(
                      page2 * ROWS_PER_PAGE,
                      grade12to13.length
                    )} of ${grade12to13.length}`}
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage2(1)}
                  disabled={page2 === 1}
                  className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 disabled:opacity-50"
                >
                  {"<<"}
                </button>
                <button
                  type="button"
                  onClick={() => setPage2((p) => Math.max(1, p - 1))}
                  disabled={page2 === 1}
                  className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 disabled:opacity-50"
                >
                  {"<"}
                </button>
                <span className="px-2 text-sm font-medium text-gray-700">
                  Page {page2} of {totalPages2}
                </span>
                <button
                  type="button"
                  onClick={() => setPage2((p) => Math.min(totalPages2, p + 1))}
                  disabled={page2 === totalPages2}
                  className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 disabled:opacity-50"
                >
                  {">"}
                </button>
                <button
                  type="button"
                  onClick={() => setPage2(totalPages2)}
                  disabled={page2 === totalPages2}
                  className="inline-flex h-7 min-w-[28px] items-center justify-center rounded border border-gray-200 px-2 disabled:opacity-50"
                >
                  {">>"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TOP ADD MODAL */}
        <Modal
          open={topOpen}
          title="Add Grade & Subject / Stream"
          onClose={() => {
            setTopOpen(false);
            setTopGradeNumber("");
            setTopName("");
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Select Grade
              </label>
              <select
                value={topGradeNumber}
                onChange={(e) => setTopGradeNumber(e.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
              >
                <option value="">Select Grade</option>
                {gradeOptions.map((g) => (
                  <option key={g} value={g}>
                    Grade {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {is12or13(Number(topGradeNumber)) ? "Stream Name" : "Subject Name"}
              </label>
              <input
                value={topName}
                onChange={(e) => setTopName(e.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                placeholder={
                  is12or13(Number(topGradeNumber)) ? "e.g. Maths" : "e.g. Science"
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={() => {
                  setTopOpen(false);
                  setTopGradeNumber("");
                  setTopName("");
                }}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                onClick={submitTop}
              >
                Save
              </button>
            </div>
          </div>
        </Modal>

        {/* ROW ADD MODAL */}
        <Modal
          open={addOpen}
          title={
            addGradeDoc
              ? `Add ${is12or13(addGradeDoc.grade) ? "Stream" : "Subject"} (Grade ${addGradeDoc.grade})`
              : "Add"
          }
          onClose={() => {
            setAddOpen(false);
            setAddGradeDoc(null);
            setAddValue("");
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {addGradeDoc && is12or13(addGradeDoc.grade) ? "Stream Name" : "Subject Name"}
              </label>
              <input
                value={addValue}
                onChange={(e) => setAddValue(e.target.value)}
                className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                placeholder={
                  addGradeDoc && is12or13(addGradeDoc.grade)
                    ? "e.g. Maths"
                    : "e.g. Science"
                }
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                onClick={() => {
                  setAddOpen(false);
                  setAddGradeDoc(null);
                  setAddValue("");
                }}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                onClick={submitAddForRow}
              >
                Add
              </button>
            </div>
          </div>
        </Modal>

        {/* View Modals */}
        <GradeSubjectsModal
          open={subjectsOpen}
          grade={selectedGrade}
          onClose={() => {
            setSubjectsOpen(false);
            setSelectedGrade(null);
          }}
        />

        <StreamSubjectsModal
          open={streamSubjectsOpen}
          grade={selectedGrade}
          onClose={() => {
            setStreamSubjectsOpen(false);
            setSelectedGrade(null);
          }}
        />
      </div>
    </div>
  );
};

/* --------------------- Grade 12/13 Row Component --------------------- */
function Grade12Row({ grade, onAdd, onDelete, onViewSubjects }) {
  const { data, isLoading } = useGetStreamsByGradeQuery(grade._id);
  const streams = data?.streams || [];

  const [updateStream] = useUpdateStreamMutation();
  const [deleteStream] = useDeleteStreamMutation();

  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (st) => {
    setEditingId(st._id);
    setEditValue(st.stream);
  };

  const saveEdit = async () => {
    const name = editValue.trim();
    if (!name) return;
    try {
      await updateStream({
        gradeId: grade._id,
        streamId: editingId,
        stream: name,
      }).unwrap();
      setEditingId(null);
      setEditValue("");
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  const removeStream = async (streamId) => {
    const ok = window.confirm("Delete stream?");
    if (!ok) return;
    try {
      await deleteStream({ gradeId: grade._id, streamId }).unwrap();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  return (
    <tr className="hover:bg-gray-50/70">
      <td className="border-b border-r border-gray-200 px-4 py-4 align-top">
        <div className="truncate font-medium text-gray-800">Grade {grade.grade}</div>
      </td>

      <td className="border-b border-r border-gray-200 px-4 py-4 align-top">
        {isLoading ? (
          <div className="text-sm text-gray-500">Loading...</div>
        ) : streams.length === 0 ? (
          <div className="text-sm text-gray-500">No streams</div>
        ) : (
          <div className="space-y-2">
            {streams.map((st) => (
              <div
                key={st._id}
                className="flex items-center justify-between gap-2 border border-gray-200 bg-white px-3 py-2"
              >
                {editingId === st._id ? (
                  <input
                    className="h-9 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-800">{st.stream}</span>
                )}

                <div className="flex gap-2">
                  {editingId === st._id ? (
                    <button
                      onClick={saveEdit}
                      className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
                    >
                      Save
                    </button>
                  ) : (
                    <IconButton title="Edit" onClick={() => startEdit(st)}>
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
                  )}

                  <IconButton title="Delete" onClick={() => removeStream(st._id)}>
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6" />
                      <path d="M14 11v6" />
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                    </svg>
                  </IconButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </td>

      <td className="border-b border-r border-gray-200 px-4 py-4 align-top text-center">
        <button
          onClick={onViewSubjects}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700"
        >
          View
        </button>
      </td>

      <td className="border-b border-gray-200 px-4 py-4 align-top">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={onAdd}
            className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
          >
            Add Stream
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700"
          >
            Delete Grade
          </button>
        </div>
      </td>
    </tr>
  );
}

export default GradeSubjectPage;