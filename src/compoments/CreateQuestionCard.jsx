import React, { useMemo, useState } from "react";

/**
 * Props:
 * - answerCount (number) default 5
 * - onNext(payload) => void
 */
export default function CreateQuestionCard({ answerCount = 5, onNext }) {
  const [question, setQuestion] = useState("");
  const [answers, setAnswers] = useState(() => Array(answerCount).fill(""));
  const [correctIndexes, setCorrectIndexes] = useState([]); // ✅ allow 1 or 2
  const [explanationVideoUrl, setExplanationVideoUrl] = useState("");
  const [writtenLogic, setWrittenLogic] = useState("");

  const canSubmit = useMemo(() => {
    const cleanedAnswers = answers.map((a) => String(a || "").trim()).filter(Boolean);
    return (
      String(question || "").trim().length > 0 &&
      cleanedAnswers.length === answerCount &&
      correctIndexes.length >= 1 &&
      correctIndexes.length <= 2
    );
  }, [question, answers, correctIndexes, answerCount]);

  const toggleCorrect = (idx) => {
    setCorrectIndexes((prev) => {
      if (prev.includes(idx)) return prev.filter((x) => x !== idx);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, idx].sort((a, b) => a - b);
    });
  };

  const handleNext = () => {
    if (!canSubmit) return;

    const payload = {
      question: String(question || "").trim(),
      answers: answers.map((a) => String(a || "").trim()),
      correctAnswerIndexes: correctIndexes,
      explanationVideoUrl: String(explanationVideoUrl || "").trim(),
      writtenLogic: String(writtenLogic || "").trim(),
    };

    onNext?.(payload);

    setQuestion("");
    setAnswers(Array(answerCount).fill(""));
    setCorrectIndexes([]);
    setExplanationVideoUrl("");
    setWrittenLogic("");
  };

  return (
    <div className="w-full flex items-center justify-center px-6 sm:px-10 py-10 sm:py-14">
      {/* ✅ wider card */}
      <div className="w-full max-w-2xl bg-[#E6E6E6]/10 border border-gray-200 rounded-2xl shadow-sm p-8 sm:p-10 relative">
        {/* Number Circle */}
        <div className="absolute -top-5 left-1/2 -translate-x-1/2">
          <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white font-extrabold border-4 border-white shadow mt-10">
            1
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-gray-900 mt-4 mb-4">Question</h2>

        {/* Question input */}
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="w-full rounded-xl bg-gray-200 px-4 py-3 outline-none text-sm"
          placeholder=""
        />

        {/* Answers */}
        <div className="mt-5 space-y-4">
          {answers.map((val, idx) => {
            const selected = correctIndexes.includes(idx);

            return (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-800">{idx + 1})answer</div>

                <input
                  value={val}
                  onChange={(e) => {
                    const copy = [...answers];
                    copy[idx] = e.target.value;
                    setAnswers(copy);
                  }}
                  className="flex-1 rounded-xl bg-gray-200 px-4 py-3 outline-none text-sm"
                  placeholder=""
                />

                <button
                  type="button"
                  onClick={() => toggleCorrect(idx)}
                  className="w-7 h-7 flex items-center justify-center"
                  title="Mark correct"
                >
                  <span
                    className={[
                      "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                      selected ? "border-blue-600" : "border-gray-300",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "w-2.5 h-2.5 rounded-full",
                        selected ? "bg-blue-600" : "bg-transparent",
                      ].join(" ")}
                    />
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Explain video url */}
        <div className="mt-6">
          <div className="text-xs text-gray-700 mb-2">explain video url</div>
          <input
            value={explanationVideoUrl}
            onChange={(e) => setExplanationVideoUrl(e.target.value)}
            className="w-full rounded-xl bg-gray-200 px-4 py-3 outline-none text-sm"
            placeholder=""
          />
        </div>

        {/* Written Logic */}
        <div className="mt-4">
          <div className="text-xs text-gray-700 mb-2">written Logic</div>
          <textarea
            value={writtenLogic}
            onChange={(e) => setWrittenLogic(e.target.value)}
            className="w-full rounded-xl bg-gray-200 px-4 py-3 outline-none text-sm min-h-[150px] resize-none"
            placeholder=""
          />
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Select <b>1 or 2</b> correct answers (max 2).
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={!canSubmit}
            className={[
              "px-6 py-2.5 rounded-full text-white text-sm font-bold",
              canSubmit ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed",
            ].join(" ")}
          >
            Next question
          </button>
        </div>
      </div>
    </div>
  );
}
