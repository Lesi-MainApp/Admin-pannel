import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetQuestionsByPaperQuery } from "../api/questionApi";

const toNums = (v) =>
  Array.isArray(v) ? v.map(Number).filter((n) => Number.isFinite(n)) : [];

const getCorrect = (q) => {
  const multi = toNums(q?.correctAnswerIndexes);
  if (multi.length) return [...new Set(multi)].sort((a, b) => a - b);

  const single = Number(q?.correctAnswerIndex);
  if (Number.isFinite(single)) return [single];

  return [];
};

export default function ViewPaperQuestionsPage() {
  const { paperId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading, isError, error, refetch } =
    useGetQuestionsByPaperQuery(paperId, { skip: !paperId });

  const paper = data?.paper || null;
  const questions = Array.isArray(data?.questions) ? data.questions : [];
  const progress = data?.progress || null;

  const requiredCount = Number(progress?.requiredCount || paper?.questionCount || 0);
  const currentCount = Number(progress?.currentCount || questions.length || 0);

  const sorted = useMemo(
    () => [...questions].sort((a, b) => Number(a.questionNumber) - Number(b.questionNumber)),
    [questions]
  );

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F6F6] px-3">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
          Loading questions...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F6F6] px-3">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-6 w-full max-w-2xl">
          <div className="text-lg font-extrabold text-red-700">Failed to load</div>
          <div className="text-sm text-gray-700 mt-2">
            {error?.data?.message || error?.error || "Unknown error"}
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={() => refetch()}
              className="rounded-xl bg-blue-700 px-4 py-2 text-white font-bold hover:bg-blue-800"
            >
              Retry
            </button>
            <button
              onClick={() => navigate("/paper/papers")}
              className="rounded-xl border border-gray-300 px-4 py-2 font-bold hover:bg-gray-50"
            >
              Back
            </button>
          </div>
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
    <div className="w-full min-h-screen bg-[#F7F6F6] px-3 py-6">
      <div className="mx-auto w-full max-w-4xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-2xl font-extrabold text-blue-800">View Questions</div>
            <div className="text-sm text-gray-700 mt-1">
              Paper: <b>{paper?.paperTitle}</b>
            </div>
            <div className="text-sm text-gray-700">
              Progress: <b>{currentCount}</b> / <b>{requiredCount}</b>
            </div>
            
          </div>

          <div className="flex gap-2">
            
            <button
              onClick={() => navigate("/paper/papers")}
              className="rounded-xl border border-gray-300 px-4 py-2 font-bold hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {sorted.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5 text-gray-700">
              No questions added yet.
            </div>
          ) : (
            sorted.map((q) => {
              const answers = Array.isArray(q?.answers) ? q.answers : [];
              const correctSet = new Set(getCorrect(q));

              return (
                <div key={q._id} className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="p-5 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
                    <div className="text-sm font-extrabold text-gray-900">
                      Question #{q?.questionNumber}
                    </div>

                    {!!q?.lessonName && (
                      <div className="text-xs text-gray-600 mt-1">
                        Lesson: <b>{q.lessonName}</b>
                      </div>
                    )}

                    <div className="text-sm text-gray-800 mt-2 whitespace-pre-wrap">{q?.question}</div>

                    {!!q?.imageUrl && (
                      <div className="mt-4">
                        <img
                          src={q.imageUrl}
                          alt="question"
                          className="max-h-72 rounded-xl border border-gray-200"
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <div className="text-sm font-extrabold text-gray-800 mb-3">Answers</div>

                    <div className="space-y-2">
                      {answers.map((a, idx) => {
                        const isCorrect = correctSet.has(idx);

                        // ✅ FIX "height blu" issue:
                        // use items-stretch + py + min-h so the blue bg covers full height nicely
                        return (
                          <div
                            key={idx}
                            className={[
                              "w-full rounded-xl border px-4 py-3 text-sm flex gap-3 items-stretch",
                              isCorrect
                                ? "border-blue-600 bg-blue-600 text-white font-extrabold"
                                : "border-gray-200 bg-white text-gray-800",
                            ].join(" ")}
                          >
                            <div
                              className={[
                                "w-7 min-h-7 rounded-lg flex items-center justify-center text-xs font-extrabold",
                                isCorrect ? "bg-white text-blue-700" : "bg-gray-100 text-gray-700",
                              ].join(" ")}
                            >
                              {idx + 1}
                            </div>

                            <div className="flex-1 whitespace-pre-wrap leading-6">{a}</div>

                            {isCorrect && (
                              <div className="text-xs font-extrabold uppercase tracking-wide self-center">
                                Correct
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {(q?.explanationVideoUrl || q?.explanationText) && (
                      <div className="mt-5 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                        <div className="text-sm font-extrabold text-gray-800">Explanation</div>

                        {!!q?.explanationVideoUrl && (
                          <div className="text-xs text-blue-700 font-bold mt-2 break-all">
                            Video: {q.explanationVideoUrl}
                          </div>
                        )}

                        {!!q?.explanationText && (
                          <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">
                            {q.explanationText}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
