// src/pages/Teacher.page.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetTeachersQuery,
  useGetTeacherFormDataQuery,
  useAssignTeacherMutation,
} from "../api/teacherAssignmentApi";

const TeacherPage = () => {
  const navigate = useNavigate();
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
    <div className="flex min-h-screen w-full items-center justify-center px-3 py-6">
      <div className="w-full max-w-5xl">
        {/* PAGE TITLE */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Teacher Assignment Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Assign grades, streams, and subjects to teachers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex h-10 w-10 items-center justify-center self-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700 sm:self-auto"
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

        {/* FORM */}
        <div className="border border-gray-200 bg-white p-4 sm:p-6">
          <form className="space-y-5" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {/* Teachers name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Teacher Name
                </label>

                <div className="mt-2 flex gap-2">
                  <select
                    value={selectedTeacherId}
                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                    className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
                  >
                    <option value="">
                      {teachersLoading ? "Loading..." : "Select Teacher"}
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
                    className="rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Refresh
                  </button>
                </div>

                {teachersError && (
                  <div className="mt-2 text-xs text-red-600">
                    {String(
                      teachersErrObj?.data?.message ||
                        teachersErrObj?.error ||
                        "Failed"
                    )}
                  </div>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  value={teacher?.email || ""}
                  readOnly
                  placeholder={formLoading ? "Loading..." : "Auto fill"}
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm outline-none"
                />
                {formError && (
                  <div className="mt-2 text-xs text-red-600">
                    {String(
                      formErrObj?.data?.message || formErrObj?.error || "Failed"
                    )}
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={refetchForm}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        Retry
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* WhatsApp */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  WhatsApp
                </label>
                <input
                  type="text"
                  value={teacher?.whatsapp || teacher?.phonenumber || ""}
                  readOnly
                  placeholder={formLoading ? "Loading..." : "Auto fill"}
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 text-sm outline-none"
                />
              </div>

              {/* Available grade */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Available Grade
                </label>
                <select
                  value={gradeId}
                  onChange={(e) => setGradeId(e.target.value)}
                  disabled={!selectedTeacherId || formLoading}
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                >
                  <option value="">
                    {!selectedTeacherId ? "Select teacher first" : "Select Grade"}
                  </option>
                  {availableGrades.map((g) => (
                    <option key={g._id} value={g._id}>
                      Grade {g.grade}
                    </option>
                  ))}
                </select>
              </div>

              {/* Stream */}
              {is12or13 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Stream
                  </label>
                  <select
                    value={streamId}
                    onChange={(e) => setStreamId(e.target.value)}
                    disabled={!gradeId}
                    className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                  >
                    <option value="">Select Stream</option>
                    {streams.map((st) => (
                      <option key={st._id} value={st._id}>
                        {st.stream}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Available subjects */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Available Subjects
                </label>
                <select
                  value={subjectId}
                  onChange={(e) => setSubjectId(e.target.value)}
                  disabled={!gradeId || (is12or13 && !streamId)}
                  className="mt-2 h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300 disabled:bg-gray-50"
                >
                  <option value="">Select Subject</option>
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* INFO */}
            {selectedTeacherId && (
              <div className="text-center text-xs text-gray-500">
                Grade 1–11: subjects from grade • Grade 12–13: select stream then subjects
              </div>
            )}

            {/* SUBMIT */}
            <div className="flex justify-center pt-2">
              <button
                type="submit"
                disabled={assigning}
                className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-8 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {assigning ? "Submitting..." : "Assign Teacher"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;