// src/pages/QuestionPage.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  useGetPapersQuery,
  usePublishPaperMutation,
} from "../api/paperApi";

const fmt = (v) => String(v ?? "").trim();

const badgeClass = (status) => {
  if (status === "publish") return "bg-green-100 text-green-800 border-green-200";
  if (status === "complete") return "bg-blue-100 text-blue-800 border-blue-200";
  return "bg-yellow-100 text-yellow-800 border-yellow-200";
};

const statusLabel = (status) => {
  if (status === "publish") return "Published";
  if (status === "complete") return "Complete";
  return "In Progress";
};

export default function QuestionPage() {
  const navigate = useNavigate();
  const { data, isLoading, isFetching, refetch } = useGetPapersQuery();
  const [publishPaper, { isLoading: isPublishing }] = usePublishPaperMutation();

  const papers = useMemo(() => {
    const list = Array.isArray(data?.papers) ? data.papers : [];
    // newest first (backend already sorts, but keep safe)
    return [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data]);

  const onView = (paperId) => navigate(`/paper/${paperId}/questions/view`);
  const onEditQuestions = (paperId) => navigate(`/paper/${paperId}/questions/create`);
  const onEditPaper = (paperId) => navigate(`/paper/${paperId}/edit`);

  const onPublish = async (paperId) => {
    try {
      await publishPaper(paperId).unwrap();
      await refetch();
      alert("Paper published");
    } catch (e) {
      alert(e?.data?.message || "Publish failed");
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

  return (
    <div className="w-full min-h-screen bg-[#F7F6F6] px-3 py-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-blue-800 mb-1">
              Papers (Questions)
            </h1>
            <div className="text-sm text-gray-700">
              Manage paper questions, completion, and publishing.
              {isFetching ? <span className="ml-2 text-xs text-gray-500">Refreshing...</span> : null}
            </div>
          </div>

        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-700">
                <th className="py-3 px-3 border-b">Paper Name</th>
                <th className="py-3 px-3 border-b">Grade</th>
                <th className="py-3 px-3 border-b">Subject / Stream</th>
                <th className="py-3 px-3 border-b">Time</th>
                <th className="py-3 px-3 border-b">Question Count</th>
                <th className="py-3 px-3 border-b">Complete Questions</th>
                <th className="py-3 px-3 border-b">Paper Status</th>
                <th className="py-3 px-3 border-b">Operation</th>
              </tr>
            </thead>

            <tbody>
              {papers.map((p) => {
                const paperId = p?._id;
                const name = fmt(p?.paperTitle) || "-";
                const grade = p?.meta?.grade ?? "-";
                const subject = fmt(p?.meta?.subject);
                const stream = fmt(p?.meta?.stream);
                const subjectStream = stream ? `${stream} / ${subject || "-"}` : subject || "-";

                const time = Number(p?.timeMinutes || 0);
                const questionCount = Number(p?.questionCount || 0);

                const currentCount = Number(p?.progress?.currentCount || 0);
                const requiredCount = Number(p?.progress?.requiredCount || questionCount || 0);

                const status = fmt(p?.status) || "in_progress"; // backend returns status: publish | complete | in_progress

                return (
                  <tr key={paperId} className="text-gray-800">
                    <td className="py-3 px-3 border-b font-semibold">{name}</td>
                    <td className="py-3 px-3 border-b">{grade}</td>
                    <td className="py-3 px-3 border-b">{subjectStream}</td>
                    <td className="py-3 px-3 border-b">{time ? `${time} min` : "-"}</td>
                    <td className="py-3 px-3 border-b">{questionCount || "-"}</td>
                    <td className="py-3 px-3 border-b">
                      <span className="font-semibold">{currentCount}</span>
                      <span className="text-gray-500"> / {requiredCount}</span>
                    </td>
                    <td className="py-3 px-3 border-b">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-extrabold",
                          badgeClass(status),
                        ].join(" ")}
                      >
                        {statusLabel(status)}
                      </span>
                    </td>
                    <td className="py-3 px-3 border-b">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => onView(paperId)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold hover:bg-gray-50"
                        >
                          View
                        </button>

                        <button
                          onClick={() => onEditPaper(paperId)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-bold hover:bg-gray-50"
                        >
                          Edit Paper
                        </button>

                        {/* ✅ Edit Questions allowed for incomplete + complete (NOT published) */}
                        {status !== "publish" && (
                          <button
                            onClick={() => onEditQuestions(paperId)}
                            className="rounded-lg border border-blue-300 text-blue-800 px-3 py-1.5 text-xs font-extrabold hover:bg-blue-50"
                          >
                            {status === "complete" ? "Edit Questions" : "Add Questions"}
                          </button>
                        )}

                        {/* ✅ Publish button only for complete papers */}
                        {status === "complete" && (
                          <button
                            disabled={isPublishing}
                            onClick={() => onPublish(paperId)}
                            className="rounded-lg bg-green-700 px-3 py-1.5 text-xs font-extrabold text-white hover:bg-green-800 disabled:opacity-60"
                          >
                            {isPublishing ? "Publishing..." : "Publish"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {papers.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-gray-600">
                    No papers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
