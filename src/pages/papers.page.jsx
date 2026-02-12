import React, { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { useCreatePaperMutation, useGetPaperFormDataQuery } from "../api/paperApi";
import { setLastCreatedPaper } from "../api/features/paperSlice";

const PapersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { data, isLoading } = useGetPaperFormDataQuery();
  const [createPaper, { isLoading: isCreating }] = useCreatePaperMutation();

  const grades = useMemo(() => (Array.isArray(data?.grades) ? data.grades : []), [data]);

  const enums = data?.enums || {};
  const paperTypes = enums?.paperTypes || ["Daily Quiz", "Topic wise paper", "Model paper", "Past paper"];
  const paymentTypes = enums?.paymentTypes || ["free", "paid", "practise"];
  const attemptsAllowed = enums?.attemptsAllowed || [1, 2, 3];
  const answerCounts = useMemo(() => [1, 2, 3, 4, 5, 6], []);

  const [form, setForm] = useState({
    gradeId: "",
    subjectId: "",
    streamId: "",
    streamSubjectId: "",
    paperType: "",
    paperTitle: "",
    timeMinutes: "",
    questionCount: "",
    oneQuestionAnswersCount: 4,
    createdPersonName: "",
    payment: "free",
    amount: "",
    attempts: 1,
  });

  const [errors, setErrors] = useState({});

  const selectedGrade = useMemo(
    () => grades.find((g) => String(g._id) === String(form.gradeId)) || null,
    [grades, form.gradeId]
  );

  const gradeNo = Number(selectedGrade?.grade || 0);
  const isAL = gradeNo === 12 || gradeNo === 13;

  const streamList = useMemo(() => (Array.isArray(selectedGrade?.streams) ? selectedGrade.streams : []), [selectedGrade]);
  const subjectList = useMemo(() => (Array.isArray(selectedGrade?.subjects) ? selectedGrade.subjects : []), [selectedGrade]);

  const selectedStream = useMemo(
    () => streamList.find((s) => String(s._id) === String(form.streamId)) || null,
    [streamList, form.streamId]
  );
  const streamSubjects = useMemo(() => (Array.isArray(selectedStream?.subjects) ? selectedStream.subjects : []), [selectedStream]);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.gradeId) e.gradeId = "Grade is required";

    if (isAL) {
      if (!form.streamId) e.streamId = "Stream is required";
      if (!form.streamSubjectId) e.streamSubjectId = "Stream Subject is required";
    } else {
      if (!form.subjectId) e.subjectId = "Subject is required";
    }

    if (!form.paperType) e.paperType = "Paper Type is required";
    if (!form.paperTitle.trim()) e.paperTitle = "Paper Title is required";

    const time = Number(form.timeMinutes);
    if (!time || time < 1 || time > 180) e.timeMinutes = "Time must be 1..180 minutes";

    const qc = Number(form.questionCount);
    if (!qc || qc < 1 || qc > 50) e.questionCount = "Question Count must be 1..50";

    const ac = Number(form.oneQuestionAnswersCount);
    if (!ac || ac < 1 || ac > 6) e.oneQuestionAnswersCount = "Answer count must be 1..6";

    if (!form.createdPersonName.trim()) e.createdPersonName = "Created Person Name is required";

    if (!paymentTypes.includes(form.payment)) e.payment = "Invalid payment";
    if (form.payment === "paid") {
      const amt = Number(form.amount);
      if (!amt || amt <= 0) e.amount = "Amount must be > 0 for paid papers";
    }

    if (!attemptsAllowed.includes(Number(form.attempts))) e.attempts = "Attempts must be 1,2,3";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;

    const payload = {
      gradeId: form.gradeId,
      subjectId: isAL ? null : form.subjectId,
      streamId: isAL ? form.streamId : null,
      streamSubjectId: isAL ? form.streamSubjectId : null,
      paperType: form.paperType,
      paperTitle: form.paperTitle.trim(),
      timeMinutes: Number(form.timeMinutes),
      questionCount: Number(form.questionCount),
      oneQuestionAnswersCount: Number(form.oneQuestionAnswersCount || 4),
      createdPersonName: form.createdPersonName.trim(),
      payment: form.payment,
      amount: form.payment === "paid" ? Number(form.amount) : 0,
      attempts: Number(form.attempts),
    };

    try {
      const res = await createPaper(payload).unwrap();
      const createdPaper = res?.paper || null;
      dispatch(setLastCreatedPaper(createdPaper));

      const paperId = createdPaper?._id;
      if (paperId) {
        navigate(`/paper/${paperId}/questions/create`);
        return;
      }

      alert("✅ Paper created!");
    } catch (err) {
      alert(err?.data?.message || "❌ Failed to create paper");
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F6F6] px-3">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <h1 className="text-2xl font-extrabold text-blue-800 text-center mb-6">paper creation</h1>

        <form className="space-y-4" onSubmit={onSubmit}>
          {/* Grade */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Grade</label>
            <select
              value={form.gradeId}
              onChange={(e) => {
                const v = e.target.value;
                setField("gradeId", v);
                setField("subjectId", "");
                setField("streamId", "");
                setField("streamSubjectId", "");
              }}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              disabled={isLoading}
            >
              <option value="">{isLoading ? "Loading..." : "Select Grade"}</option>
              {grades.map((g) => (
                <option key={g._id} value={g._id}>
                  Grade {g.grade}
                </option>
              ))}
            </select>
            {errors.gradeId && <p className="text-xs text-red-600 mt-1">{errors.gradeId}</p>}
          </div>

          {/* Paper Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Paper Type</label>
            <select
              value={form.paperType}
              onChange={(e) => setField("paperType", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">Select Paper Type</option>
              {paperTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {errors.paperType && <p className="text-xs text-red-600 mt-1">{errors.paperType}</p>}
          </div>

          {/* Subject / Stream */}
          {!isAL ? (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Subject</label>
              <select
                value={form.subjectId}
                onChange={(e) => setField("subjectId", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                disabled={!form.gradeId}
              >
                <option value="">{form.gradeId ? "Select Subject" : "Select Grade first"}</option>
                {subjectList.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.subject}
                  </option>
                ))}
              </select>
              {errors.subjectId && <p className="text-xs text-red-600 mt-1">{errors.subjectId}</p>}
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stream</label>
                <select
                  value={form.streamId}
                  onChange={(e) => {
                    setField("streamId", e.target.value);
                    setField("streamSubjectId", "");
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={!form.gradeId}
                >
                  <option value="">{form.gradeId ? "Select Stream" : "Select Grade first"}</option>
                  {streamList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.stream}
                    </option>
                  ))}
                </select>
                {errors.streamId && <p className="text-xs text-red-600 mt-1">{errors.streamId}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Stream Subject</label>
                <select
                  value={form.streamSubjectId}
                  onChange={(e) => setField("streamSubjectId", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={!form.streamId}
                >
                  <option value="">{form.streamId ? "Select Stream Subject" : "Select Stream first"}</option>
                  {streamSubjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subject}
                    </option>
                  ))}
                </select>
                {errors.streamSubjectId && <p className="text-xs text-red-600 mt-1">{errors.streamSubjectId}</p>}
              </div>
            </>
          )}

          {/* Paper fields */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Paper Name</label>
            <input
              type="text"
              value={form.paperTitle}
              onChange={(e) => setField("paperTitle", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.paperTitle && <p className="text-xs text-red-600 mt-1">{errors.paperTitle}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
            <input
              type="number"
              value={form.timeMinutes}
              onChange={(e) => setField("timeMinutes", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              min={1}
              max={180}
            />
            {errors.timeMinutes && <p className="text-xs text-red-600 mt-1">{errors.timeMinutes}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Question Count</label>
            <input
              type="number"
              value={form.questionCount}
              onChange={(e) => setField("questionCount", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
              min={1}
              max={50}
            />
            {errors.questionCount && <p className="text-xs text-red-600 mt-1">{errors.questionCount}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Answer Count (One Question)</label>
            <select
              value={form.oneQuestionAnswersCount}
              onChange={(e) => setField("oneQuestionAnswersCount", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            >
              {answerCounts.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
            {errors.oneQuestionAnswersCount && <p className="text-xs text-red-600 mt-1">{errors.oneQuestionAnswersCount}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">created By</label>
            <input
              type="text"
              value={form.createdPersonName}
              onChange={(e) => setField("createdPersonName", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
            {errors.createdPersonName && <p className="text-xs text-red-600 mt-1">{errors.createdPersonName}</p>}
          </div>

          {/* Payment */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Payment</label>
            <select
              value={form.payment}
              onChange={(e) => {
                setField("payment", e.target.value);
                if (e.target.value !== "paid") setField("amount", "");
              }}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            >
              {paymentTypes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            {errors.payment && <p className="text-xs text-red-600 mt-1">{errors.payment}</p>}
          </div>

          {form.payment === "paid" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => setField("amount", e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                min={1}
              />
              {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Attempts</label>
            <select
              value={form.attempts}
              onChange={(e) => setField("attempts", e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            >
              {attemptsAllowed.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            {errors.attempts && <p className="text-xs text-red-600 mt-1">{errors.attempts}</p>}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isCreating || isLoading}
              className="w-full rounded-xl bg-blue-700 px-4 py-2 text-white font-extrabold hover:bg-blue-800 transition disabled:opacity-60"
            >
              {isCreating ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PapersPage;
