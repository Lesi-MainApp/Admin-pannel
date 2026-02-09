import React, { useMemo, useState } from "react";
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

/* ---------------------- SIMPLE MODAL (YOUR STYLE) ---------------------- */
const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-extrabold text-gray-800">{title}</h3>
          <button onClick={onClose} className="px-2 py-1 rounded-lg hover:bg-gray-100">
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
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
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
          placeholder="New subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
        />
        <button
          onClick={add}
          className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition"
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
            <div key={s._id} className="border rounded-xl p-2 flex items-center justify-between gap-2">
              {editId === s._id ? (
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              ) : (
                <span className="text-sm font-bold">{s.subject}</span>
              )}

              <div className="flex gap-2">
                {editId === s._id ? (
                  <button
                    onClick={saveEdit}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(s)}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => remove(s._id)}
                  className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700"
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
      await createStreamSubject({ gradeId, streamId: selectedStreamId, subject: name }).unwrap();
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
      await deleteStreamSubject({ gradeId, streamId: selectedStreamId, subjectId }).unwrap();
    } catch (e) {
      alert(String(e?.data?.message || e?.error || "Failed"));
    }
  };

  return (
    <Modal open={open} title={`Grade ${grade?.grade} Stream Subjects`} onClose={onClose}>
      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700">Select Stream</label>
        {streamsLoading ? (
          <div className="text-sm text-gray-500">Loading streams...</div>
        ) : (
          <select
            className="w-full rounded-xl border border-gray-300 px-3 py-2"
            value={selectedStreamId}
            onChange={(e) => setSelectedStreamId(e.target.value)}
          >
            <option value="">-- Select --</option>
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
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
          placeholder="New subject"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          disabled={!selectedStreamId}
        />
        <button
          onClick={add}
          disabled={!selectedStreamId}
          className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition disabled:opacity-50"
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
            <div key={s._id} className="border rounded-xl p-2 flex items-center justify-between gap-2">
              {editId === s._id ? (
                <input
                  className="w-full rounded-xl border border-gray-300 px-3 py-1"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                />
              ) : (
                <span className="text-sm font-bold">{s.subject}</span>
              )}

              <div className="flex gap-2">
                {editId === s._id ? (
                  <button
                    onClick={saveEdit}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Save
                  </button>
                ) : (
                  <button
                    onClick={() => startEdit(s)}
                    className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                  >
                    Edit
                  </button>
                )}

                <button
                  onClick={() => remove(s._id)}
                  className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700"
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

/* --------------------- Main Page (Two Tables + Grade Select) --------------------- */
const GradeSubjectPage = () => {
  const { data, isLoading, refetch } = useGetGradesQuery();
  const grades = data?.grades || [];

  const [createGrade] = useCreateGradeMutation();
  const [deleteGrade] = useDeleteGradeMutation();
  const [createSubject] = useCreateSubjectMutation();
  const [createStream] = useCreateStreamMutation();

  // top modal
  const [topOpen, setTopOpen] = useState(false);
  const [topGradeNumber, setTopGradeNumber] = useState(""); // NOW SELECT
  const [topName, setTopName] = useState("");

  // row add modal
  const [addOpen, setAddOpen] = useState(false);
  const [addGradeDoc, setAddGradeDoc] = useState(null);
  const [addValue, setAddValue] = useState("");

  // view modals
  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [streamSubjectsOpen, setStreamSubjectsOpen] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const grade1to11 = useMemo(() => grades.filter((g) => g.grade >= 1 && g.grade <= 11), [grades]);
  const grade12to13 = useMemo(() => grades.filter((g) => g.grade === 12 || g.grade === 13), [grades]);

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
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Grade & Subjects
        </h1>

        {/* TOP BUTTON */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setTopOpen(true)}
            className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition"
          >
            + Add Grade & Subject
          </button>
        </div>

        {/* TABLE 1: 1-11 */}
        <div className="mt-6">
          <h2 className="text-lg font-extrabold text-gray-800">Grades 1 - 11</h2>

          <div className="mt-3 w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-100 text-gray-800 text-sm">
                  <th className="p-3 text-left w-[35%]">Grade</th>
                  <th className="p-3 text-center w-[25%]">Subject</th>
                  <th className="p-3 text-center w-[40%]">Operation</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={3} className="p-6 text-center text-gray-500">Loading...</td></tr>
                ) : grade1to11.length === 0 ? (
                  <tr><td colSpan={3} className="p-6 text-center text-gray-500">No grades</td></tr>
                ) : (
                  grade1to11.map((g) => (
                    <tr key={g._id} className="border-t text-sm">
                      <td className="p-3 font-semibold truncate">Grade {g.grade}</td>
                      <td className="p-3">
                        <div className="flex justify-center">
                          <button
                            onClick={() => { setSelectedGrade(g); setSubjectsOpen(true); }}
                            className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                          >
                            View
                          </button>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <button
                            onClick={() => openAddForRow(g)}
                            className="rounded-lg bg-green-600 px-3 py-1 text-white text-xs font-bold hover:bg-green-700"
                          >
                            Add Subject
                          </button>
                          <button
                            onClick={() => removeGrade(g)}
                            className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700"
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
        </div>

        {/* TABLE 2: 12-13 */}
        <div className="mt-8">
          <h2 className="text-lg font-extrabold text-gray-800">Grades 12 - 13</h2>

          <div className="mt-3 w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full table-fixed">
              <thead>
                <tr className="bg-gray-100 text-gray-800 text-sm">
                  <th className="p-3 text-left w-[20%]">Grade</th>
                  <th className="p-3 text-center w-[35%]">Stream</th>
                  <th className="p-3 text-center w-[20%]">Subjects</th>
                  <th className="p-3 text-center w-[25%]">Operation</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">Loading...</td></tr>
                ) : grade12to13.length === 0 ? (
                  <tr><td colSpan={4} className="p-6 text-center text-gray-500">No grades</td></tr>
                ) : (
                  grade12to13.map((g) => (
                    <Grade12Row
                      key={g._id}
                      grade={g}
                      onAdd={() => openAddForRow(g)}
                      onDelete={() => removeGrade(g)}
                      onViewSubjects={() => { setSelectedGrade(g); setStreamSubjectsOpen(true); }}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TOP ADD MODAL (GRADE SELECT) */}
        <Modal
          open={topOpen}
          title="Add Grade & Subject / Stream"
          onClose={() => { setTopOpen(false); setTopGradeNumber(""); setTopName(""); }}
        >
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Select Grade (1–13)</label>

            <select
              value={topGradeNumber}
              onChange={(e) => setTopGradeNumber(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
            >
              <option value="">-- Select Grade --</option>
              {gradeOptions.map((g) => (
                <option key={g} value={g}>
                  Grade {g}
                </option>
              ))}
            </select>

            <label className="block text-sm font-bold text-gray-700">
              {is12or13(Number(topGradeNumber)) ? "Stream Name" : "Subject Name"}
            </label>
            <input
              value={topName}
              onChange={(e) => setTopName(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              placeholder={is12or13(Number(topGradeNumber)) ? "e.g. Maths" : "e.g. Science"}
            />

            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl px-4 py-2 font-extrabold bg-gray-100 hover:bg-gray-200"
                onClick={() => { setTopOpen(false); setTopGradeNumber(""); setTopName(""); }}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition"
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
          onClose={() => { setAddOpen(false); setAddGradeDoc(null); setAddValue(""); }}
        >
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              {addGradeDoc && is12or13(addGradeDoc.grade) ? "Stream Name" : "Subject Name"}
            </label>

            <input
              value={addValue}
              onChange={(e) => setAddValue(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2"
              placeholder={addGradeDoc && is12or13(addGradeDoc.grade) ? "e.g. Maths" : "e.g. Science"}
            />

            <div className="flex justify-end gap-2">
              <button
                className="rounded-xl px-4 py-2 font-extrabold bg-gray-100 hover:bg-gray-200"
                onClick={() => { setAddOpen(false); setAddGradeDoc(null); setAddValue(""); }}
              >
                Cancel
              </button>
              <button
                className="rounded-xl bg-green-600 px-4 py-2 text-white font-extrabold hover:bg-green-700 transition"
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
          onClose={() => { setSubjectsOpen(false); setSelectedGrade(null); }}
        />

        <StreamSubjectsModal
          open={streamSubjectsOpen}
          grade={selectedGrade}
          onClose={() => { setStreamSubjectsOpen(false); setSelectedGrade(null); }}
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
      await updateStream({ gradeId: grade._id, streamId: editingId, stream: name }).unwrap();
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
    <tr className="border-t text-sm align-top">
      <td className="p-3 font-semibold truncate">Grade {grade.grade}</td>

      <td className="p-3">
        {isLoading ? (
          <div className="text-xs text-gray-500 text-center">Loading...</div>
        ) : streams.length === 0 ? (
          <div className="text-xs text-gray-500 text-center">No streams</div>
        ) : (
          <div className="space-y-2">
            {streams.map((st) => (
              <div key={st._id} className="border rounded-xl p-2">
                {editingId === st._id ? (
                  <div className="flex gap-2">
                    <input
                      className="w-full rounded-xl border border-gray-300 px-3 py-1 text-xs"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                    <button
                      onClick={saveEdit}
                      className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold">{st.stream}</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(st)}
                        className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => removeStream(st._id)}
                        className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </td>

      <td className="p-3">
        <div className="flex justify-center">
          <button
            onClick={onViewSubjects}
            className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
          >
            View
          </button>
        </div>
      </td>

      <td className="p-3">
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={onAdd}
            className="rounded-lg bg-green-600 px-3 py-1 text-white text-xs font-bold hover:bg-green-700"
          >
            Add Stream
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700"
          >
            Delete Grade
          </button>
        </div>
      </td>
    </tr>
  );
}

export default GradeSubjectPage;
