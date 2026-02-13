import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  useGetQuestionsByPaperQuery,
  useCreateQuestionMutation,
} from "../api/questionApi";
import { useUploadQuestionImageMutation } from "../api/uploadApi";

const norm = (v) => String(v || "").trim();

const Dropzone = ({ onFile }) => {
  const [drag, setDrag] = useState(false);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) onFile?.(f);
      }}
      className={[
        "w-full rounded-xl border border-dashed px-4 py-4 text-sm",
        drag ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50",
      ].join(" ")}
    >
      <div className="font-semibold text-gray-800">Drag & drop image here</div>
      <div className="text-xs text-gray-600 mt-1">or choose file</div>
      <input
        type="file"
        accept="image/*"
        className="mt-2"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile?.(f);
        }}
      />
    </div>
  );
};

export default function CreatePaperQuestionsPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetQuestionsByPaperQuery(paperId, {
    skip: !paperId,
  });
  const [createQuestion, { isLoading: isSaving }] = useCreateQuestionMutation();

  // ✅ Cloudinary upload
  const [uploadQuestionImage, { isLoading: isUploading }] =
    useUploadQuestionImageMutation();

  const paper = data?.paper || null;
  const questions = Array.isArray(data?.questions) ? data.questions : [];
  const progress = data?.progress || null;

  const requiredCount = Number(
    progress?.requiredCount || paper?.questionCount || 0
  );
  const answerCount = Number(
    progress?.oneQuestionAnswersCount || paper?.oneQuestionAnswersCount || 0
  );

  const nextNumber = useMemo(() => {
    const used = new Set(questions.map((q) => Number(q.questionNumber)));
    for (let i = 1; i <= requiredCount; i++) if (!used.has(i)) return i;
    return requiredCount + 1;
  }, [questions, requiredCount]);

  const isLast = nextNumber === requiredCount;

  const [form, setForm] = useState({
    question: "",
    lessonName: "",
    answers: [],
    correctAnswerIndex: 0,
    explanationVideoUrl: "",
    explanationText: "",
    imageUrl: "",
  });

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      answers: Array.from(
        { length: Math.max(answerCount, 0) },
        (_, i) => prev.answers?.[i] || ""
      ),
      correctAnswerIndex: 0,
    }));
  }, [answerCount]);

  const canSave = useMemo(() => {
    if (!paperId) return false;
    if (!norm(form.question)) return false;

    const cleaned = (form.answers || []).map(norm).filter(Boolean);
    if (cleaned.length !== answerCount) return false;

    const idx = Number(form.correctAnswerIndex);
    if (Number.isNaN(idx) || idx < 0 || idx >= answerCount) return false;

    return true;
  }, [paperId, form, answerCount]);

  const resetForNext = () => {
    setForm({
      question: "",
      lessonName: "",
      answers: Array.from({ length: Math.max(answerCount, 0) }, () => ""),
      correctAnswerIndex: 0,
      explanationVideoUrl: "",
      explanationText: "",
      imageUrl: "",
    });
  };

  // ✅ Cloudinary upload (NO google drive)
  const onUploadImage = async (file) => {
    const fd = new FormData();
    // IMPORTANT: backend expects field name "image"
    fd.append("image", file);

    try {
      const res = await uploadQuestionImage(fd).unwrap();
      setForm((p) => ({ ...p, imageUrl: res?.url || "" }));
    } catch (e) {
      alert(e?.data?.message || "Upload failed");
    }
  };

  const onSave = async () => {
    if (!canSave) return;

    const payload = {
      paperId,
      questionNumber: nextNumber,
      lessonName: norm(form.lessonName),
      question: norm(form.question),
      answers: (form.answers || []).map(norm),
      correctAnswerIndex: Number(form.correctAnswerIndex),
      explanationVideoUrl: norm(form.explanationVideoUrl),
      explanationText: norm(form.explanationText),
      imageUrl: norm(form.imageUrl),
    };

    try {
      await createQuestion(payload).unwrap();
      await refetch();

      if (isLast) navigate(`/paper/${paperId}/questions/view`);
      else resetForNext();
    } catch (e) {
      alert(e?.data?.message || "Failed to save question");
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
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F6F6] px-3">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-800 mb-1">
              Create Questions
            </h1>
            <div className="text-sm text-gray-700">
              Paper: <b>{paper.paperTitle}</b>
            </div>
            <div className="text-sm text-gray-700">
              Progress: <b>{progress?.currentCount || 0}</b> /{" "}
              <b>{requiredCount}</b>
            </div>
            <div className="text-sm text-gray-700">
              Answers per question: <b>{answerCount}</b>
            </div>
          </div>

          <button
            onClick={() => navigate(`/paper/${paperId}/questions/view`)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm font-bold hover:bg-gray-50"
          >
            View All
          </button>
        </div>

        <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl p-5">
          <div className="text-sm font-extrabold text-gray-800">
            Question #{nextNumber} {isLast ? "(Last)" : ""}
          </div>

          {/* Question */}
          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Question
            </label>
            <input
              value={form.question}
              onChange={(e) =>
                setForm((p) => ({ ...p, question: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>

          {/* Lesson name */}
          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Lesson Name
            </label>
            <input
              value={form.lessonName}
              onChange={(e) =>
                setForm((p) => ({ ...p, lessonName: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
            />
          </div>

          {/* Image upload (Cloudinary) */}
          <div className="mt-4">
            <div className="flex items-center justify-between gap-3">
              <label className="block text-sm font-semibold text-gray-700">
                Question Image
              </label>

              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, imageUrl: "" }))}
                className="rounded-xl border border-gray-300 px-3 py-2 text-xs font-bold hover:bg-gray-100"
              >
                Clear
              </button>
            </div>

            <div className="mt-2">
              <Dropzone onFile={onUploadImage} />
              {isUploading && (
                <div className="text-xs text-gray-600 mt-1">Uploading...</div>
              )}
            </div>

            {!!form.imageUrl && (
              <div className="mt-3">
                <div className="text-xs text-gray-600 mb-2">Preview</div>
                <img
                  src={form.imageUrl}
                  alt="question"
                  className="max-h-56 rounded-xl border border-gray-200"
                />
              </div>
            )}
          </div>

          {/* Answers */}
          <div className="mt-5">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Answers
            </label>

            <div className="space-y-3">
              {Array.from({ length: answerCount }, (_, i) => {
                const val = form.answers?.[i] || "";
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-20 text-sm text-gray-800 font-semibold">
                      Answer {i + 1}
                    </div>

                    <input
                      value={val}
                      onChange={(e) => {
                        const copy = [...(form.answers || [])];
                        copy[i] = e.target.value;
                        setForm((p) => ({ ...p, answers: copy }));
                      }}
                      className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                    />

                    <label className="text-xs text-gray-700 flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct"
                        checked={Number(form.correctAnswerIndex) === i}
                        onChange={() =>
                          setForm((p) => ({ ...p, correctAnswerIndex: i }))
                        }
                      />
                      Correct
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explanation URL */}
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Explanation Video URL
            </label>
            <input
              value={form.explanationVideoUrl}
              onChange={(e) =>
                setForm((p) => ({ ...p, explanationVideoUrl: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="https://youtube.com/..."
            />
          </div>

          {/* Explanation Notes */}
          <div className="mt-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Explanation Notes / Logic
            </label>
            <textarea
              rows={4}
              value={form.explanationText}
              onChange={(e) =>
                setForm((p) => ({ ...p, explanationText: e.target.value }))
              }
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              placeholder="Write explanation logic here..."
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onSave}
              disabled={!canSave || isSaving}
              className="rounded-xl bg-blue-700 px-5 py-2 text-white font-extrabold hover:bg-blue-800 transition disabled:opacity-60"
            >
              {isSaving ? "Saving..." : isLast ? "Submit" : "Next Question"}
            </button>
          </div>

          
        </div>
      </div>
    </div>
  );
}
