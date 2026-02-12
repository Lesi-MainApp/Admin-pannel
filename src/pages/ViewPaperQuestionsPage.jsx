import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetQuestionsByPaperQuery,
  useUpdateQuestionMutation,
} from "../api/questionApi";

const norm = (v) => String(v || "").trim();

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-blue-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 border border-gray-300 hover:bg-gray-50 text-sm font-bold"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default function ViewPaperQuestionsPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetQuestionsByPaperQuery(paperId, {
    skip: !paperId,
  });

  const [updateQuestion, { isLoading: isUpdating }] = useUpdateQuestionMutation();

  const paper = data?.paper || null;
  const questions = useMemo(
    () => (Array.isArray(data?.questions) ? data.questions : []),
    [data]
  );

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  const [edit, setEdit] = useState({
    question: "",
    answers: [],
    correctAnswerIndex: 0,
  });

  const openEdit = (q) => {
    setSelected(q);
    setEdit({
      question: q?.question || "",
      answers: Array.isArray(q?.answers) ? q.answers : [],
      correctAnswerIndex: Number(q?.correctAnswerIndex || 0),
    });
    setOpen(true);
  };

  const closeEdit = () => {
    setOpen(false);
    setSelected(null);
  };

  const canSave = useMemo(() => {
    if (!selected?._id) return false;
    if (!norm(edit.question)) return false;

    const cleaned = (edit.answers || []).map(norm).filter(Boolean);
    if (cleaned.length < 1) return false;

    const idx = Number(edit.correctAnswerIndex);
    if (Number.isNaN(idx) || idx < 0 || idx >= cleaned.length) return false;

    return true;
  }, [selected, edit]);

  const onSave = async () => {
    if (!canSave) return;

    const cleanedAnswers = (edit.answers || []).map(norm).filter(Boolean);

    try {
      await updateQuestion({
        questionId: selected._id,
        paperId,
        patch: {
          question: norm(edit.question),
          answers: cleanedAnswers,
          correctAnswerIndex: Number(edit.correctAnswerIndex),
        },
      }).unwrap();

      await refetch();
      closeEdit();
    } catch (e) {
      alert(e?.data?.message || "Failed to update question");
    }
  };

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F6F6] px-3">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          Loading...
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F6F6] px-3">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          Paper not found
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#F7F6F6] px-3 py-8 flex justify-center">
      <div className="w-full max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-extrabold text-blue-800 mb-1">
                View Questions
              </h1>
              <div className="text-sm text-gray-700">
                Paper: <b>{paper.paperTitle}</b>
              </div>
              <div className="text-sm text-gray-700">
                Total: <b>{questions.length}</b>
              </div>
            </div>

            <button
              onClick={() => navigate(`/paper/${paperId}/questions/create`)}
              className="rounded-xl bg-blue-700 px-4 py-2 text-white font-extrabold hover:bg-blue-800 transition"
            >
              Add More
            </button>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {questions.map((q) => (
            <div
              key={q._id}
              className="bg-white rounded-2xl shadow-md border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-extrabold text-gray-800">
                    Question #{q.questionNumber}
                  </div>
                  <div className="mt-2 text-sm text-gray-800 font-semibold">
                    {q.question}
                  </div>

                  {!!q.lessonName && (
                    <div className="mt-2 text-xs text-gray-600">
                      Lesson: <b>{q.lessonName}</b>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => openEdit(q)}
                  className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>

              {!!q.imageUrl && (
                <div className="mt-3">
                  <div className="text-xs text-gray-600 mb-2">Image</div>
                  <img
                    src={q.imageUrl}
                    alt="question"
                    className="max-h-72 rounded-xl border border-gray-200"
                  />
                </div>
              )}

              <div className="mt-4">
                <div className="text-sm font-extrabold text-gray-800 mb-2">
                  Answers
                </div>
                <div className="space-y-2">
                  {(q.answers || []).map((a, i) => {
                    const isCorrect = Number(q.correctAnswerIndex) === i;
                    return (
                      <div
                        key={i}
                        className={[
                          "rounded-xl border px-3 py-2 text-sm",
                          isCorrect
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200 bg-gray-50",
                        ].join(" ")}
                      >
                        <b className="mr-2">{i + 1}.</b>
                        {a}
                        {isCorrect && (
                          <span className="ml-2 text-xs font-extrabold text-green-700">
                            (Correct)
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ✅ SHOW explanation logic + URL */}
              {(!!q.explanationVideoUrl || !!q.explanationText) && (
                <div className="mt-4 bg-gray-50 border border-gray-200 rounded-2xl p-4">
                  <div className="text-sm font-extrabold text-gray-800 mb-2">
                    Explanation
                  </div>

                  {!!q.explanationVideoUrl && (
                    <div className="text-sm text-gray-700">
                      Video URL:{" "}
                      <a
                        className="text-blue-700 font-bold underline"
                        href={q.explanationVideoUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open
                      </a>
                    </div>
                  )}

                  {!!q.explanationText && (
                    <div className="mt-2 text-sm text-gray-800 whitespace-pre-wrap">
                      {q.explanationText}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {questions.length === 0 && (
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 text-center text-sm text-gray-600">
              No questions found.
            </div>
          )}
        </div>

        {/* ✅ Edit Modal */}
        <Modal
          open={open}
          title={`Edit Question #${selected?.questionNumber || ""}`}
          onClose={closeEdit}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Question
              </label>
              <input
                value={edit.question}
                onChange={(e) => setEdit((p) => ({ ...p, question: e.target.value }))}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Answers
              </label>

              <div className="space-y-3">
                {(edit.answers || []).map((val, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 text-sm text-gray-800 font-semibold">
                      Answer {i + 1}
                    </div>

                    <input
                      value={val}
                      onChange={(e) => {
                        const copy = [...(edit.answers || [])];
                        copy[i] = e.target.value;
                        setEdit((p) => ({ ...p, answers: copy }));
                      }}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />

                    <label className="text-xs text-gray-700 flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_edit"
                        checked={Number(edit.correctAnswerIndex) === i}
                        onChange={() =>
                          setEdit((p) => ({ ...p, correctAnswerIndex: i }))
                        }
                      />
                      Correct
                    </label>
                  </div>
                ))}
              </div>

              <div className="mt-3 text-xs text-gray-600">
                (Answer count stays same. Only edit text.)
              </div>
            </div>

            {!canSave && (
              <div className="text-xs text-red-600">
                Please fill question + all answers and select correct answer.
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeEdit}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-bold hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={onSave}
                disabled={!canSave || isUpdating}
                className="rounded-xl bg-blue-700 px-4 py-2 text-white font-extrabold hover:bg-blue-800 transition disabled:opacity-60"
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
}
