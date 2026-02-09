// src/pages/Teacher.page.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  useGetTeachersQuery,
  useGetTeacherFormDataQuery,
  useAssignTeacherMutation,
} from "../api/teacherAssignmentApi";

const TeacherPage = () => {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [gradeId, setGradeId] = useState("");
  const [streamId, setStreamId] = useState("");
  const [subjectId, setSubjectId] = useState("");

  // ✅ load approved teachers for dropdown
  const {
    data: teachersData,
    isLoading: teachersLoading,
    isError: teachersError,
    error: teachersErrObj,
    refetch: refetchTeachers,
  } = useGetTeachersQuery({ status: "approved" });

  const teachers = teachersData?.teachers || [];

  // ✅ load form-data for selected teacher (includes teacher + availableGrades)
  const {
    data: formData,
    isLoading: formLoading,
    isError: formError,
    error: formErrObj,
    refetch: refetchForm,
  } = useGetTeacherFormDataQuery(selectedTeacherId, { skip: !selectedTeacherId });

  const teacher = formData?.teacher || null;
  const availableGrades = formData?.availableGrades || [];

  // ✅ helpers
  const selectedGrade = useMemo(() => {
    if (!gradeId) return null;
    return availableGrades.find((g) => String(g._id) === String(gradeId)) || null;
  }, [availableGrades, gradeId]);

  const gradeNumber = Number(selectedGrade?.grade || 0);
  const is12or13 = gradeNumber === 12 || gradeNumber === 13;
  const is1to11 = gradeNumber >= 1 && gradeNumber <= 11;

  const streams = useMemo(() => {
    if (!selectedGrade || !is12or13) return [];
    return selectedGrade.streams || [];
  }, [selectedGrade, is12or13]);

  const selectedStream = useMemo(() => {
    if (!streamId) return null;
    return streams.find((s) => String(s._id) === String(streamId)) || null;
  }, [streams, streamId]);

  const subjects = useMemo(() => {
    if (!selectedGrade) return [];
    if (is1to11) return selectedGrade.subjects || [];
    if (is12or13) return selectedStream?.subjects || [];
    return [];
  }, [selectedGrade, is1to11, is12or13, selectedStream]);

  // ✅ reset dependent fields when selections change
  useEffect(() => {
    setGradeId("");
    setStreamId("");
    setSubjectId("");
  }, [selectedTeacherId]);

  useEffect(() => {
    setStreamId("");
    setSubjectId("");
  }, [gradeId]);

  useEffect(() => {
    setSubjectId("");
  }, [streamId]);

  const [assignTeacher, { isLoading: assigning }] = useAssignTeacherMutation();

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!selectedTeacherId) return alert("Select teacher");
    if (!gradeId) return alert("Select grade");

    if (is12or13 && !streamId) return alert("Select stream");
    if (!subjectId) return alert("Select subject");

    try {
      const payload = {
        assignments: [
          is12or13
            ? { gradeId, streamId, subjectIds: [subjectId] }
            : { gradeId, subjectIds: [subjectId] },
        ],
      };

      await assignTeacher({ teacherId: selectedTeacherId, body: payload }).unwrap();

      alert("Assigned successfully");
      setGradeId("");
      setStreamId("");
      setSubjectId("");
      refetchForm();
    } catch (err) {
      alert(String(err?.data?.message || err?.error || "Assign failed"));
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#F7F6F6] px-3 py-6">
      {/* PAGE TITLE (TOP) */}
      <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center mb-8">
        Teachers Assign the Subjects
      </h1>

      {/* CARD CENTER ONLY */}
      <div className="w-full flex justify-center">
        <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <form className="space-y-4" onSubmit={onSubmit}>
            {/* Teachers name (SELECT) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Teachers name
              </label>

              <div className="flex gap-2">
                <select
                  value={selectedTeacherId}
                  onChange={(e) => setSelectedTeacherId(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">
                    {teachersLoading ? "Loading..." : "Select"}
                  </option>
                  {teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={refetchTeachers}
                  className="rounded-xl px-4 py-2 text-sm font-extrabold bg-gray-100 hover:bg-gray-200"
                >
                  Refresh
                </button>
              </div>

              {teachersError && (
                <div className="mt-2 text-sm text-red-600 font-bold">
                  {String(teachersErrObj?.data?.message || teachersErrObj?.error || "Failed")}
                </div>
              )}
            </div>

            {/* Email (AUTO) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={teacher?.email || ""}
                readOnly
                placeholder={formLoading ? "Loading..." : "Auto fill"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
              {formError && (
                <div className="mt-2 text-sm text-red-600 font-bold">
                  {String(formErrObj?.data?.message || formErrObj?.error || "Failed")}
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={refetchForm}
                      className="rounded-xl px-4 py-2 text-sm font-extrabold bg-gray-100 hover:bg-gray-200"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* WhatsApp (AUTO) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                WhatsApp
              </label>
              <input
                type="text"
                value={teacher?.whatsapp || teacher?.phonenumber || ""}
                readOnly
                placeholder={formLoading ? "Loading..." : "Auto fill"}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50"
              />
            </div>

            {/* Available grade (FROM DB) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Available grade
              </label>
              <select
                value={gradeId}
                onChange={(e) => setGradeId(e.target.value)}
                disabled={!selectedTeacherId || formLoading}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
              >
                <option value="">
                  {!selectedTeacherId ? "Select teacher first" : "Select"}
                </option>
                {availableGrades.map((g) => (
                  <option key={g._id} value={g._id}>
                    Grade {g.grade}
                  </option>
                ))}
              </select>
            </div>

            {/* Stream (ONLY grade 12/13) */}
            {is12or13 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Stream
                </label>
                <select
                  value={streamId}
                  onChange={(e) => setStreamId(e.target.value)}
                  disabled={!gradeId}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
                >
                  <option value="">Select</option>
                  {streams.map((st) => (
                    <option key={st._id} value={st._id}>
                      {st.stream}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Available subjects (FROM DB) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Available subjects
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                disabled={!gradeId || (is12or13 && !streamId)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-50"
              >
                <option value="">Select</option>
                {subjects.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subject}
                  </option>
                ))}
              </select>
            </div>

            {/* SUBMIT */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={assigning}
                className="w-full rounded-xl bg-blue-700 px-4 py-2 text-white font-extrabold hover:bg-blue-800 transition disabled:opacity-60"
              >
                {assigning ? "Submitting..." : "Submit"}
              </button>
            </div>

            {/* small info */}
            {selectedTeacherId && (
              <div className="text-xs text-gray-500 pt-1">
                Grade 1–11: subjects from grade • Grade 12–13: select stream then subjects
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
