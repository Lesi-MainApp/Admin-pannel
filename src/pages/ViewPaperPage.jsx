import React, { useMemo } from "react";

const ViewPaperPage = () => {
  // sample data (replace with API later)
  const papers = useMemo(
    () => [
      {
        id: "P-001",
        name: "Grade 6 Maths Term Test",
        grade: "Grade 6",
        subject: "Maths",
        time: "60 Minutes",
        questionCount: 25,
        createdBy: "FM Gamunu",
        createdAt: "2026-01-23 18:45",
      },
      {
        id: "P-002",
        name: "Grade 7 Science Revision",
        grade: "Grade 7",
        subject: "Science",
        time: "45 Minutes",
        questionCount: 20,
        createdBy: "FM Gamunu",
        createdAt: "2026-01-22 20:10",
      },
    ],
    []
  );

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        {/* TITLE */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Paper Details
        </h1>

        {/* TABLE */}
        <div className="mt-6 w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-sm">
                <th className="p-3 text-left w-[6%]">ID</th>
                <th className="p-3 text-left w-[18%]">Paper Name</th>
                <th className="p-3 text-left w-[8%]">Grade</th>
                <th className="p-3 text-left w-[10%]">Subject</th>
                <th className="p-3 text-left w-[8%]">Time</th>
                <th className="p-3 text-left w-[10%]">Question Count</th>
                <th className="p-3 text-left w-[12%]">Created By</th>
                <th className="p-3 text-left w-[16%]">Created Date & Time</th>
                <th className="p-3 text-center w-[12%]">Operation</th>
              </tr>
            </thead>

            <tbody>
              {papers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    No papers found
                  </td>
                </tr>
              ) : (
                papers.map((p) => (
                  <tr key={p.id} className="border-t text-sm">
                    <td className="p-3 truncate">{p.id}</td>
                    <td className="p-3 font-semibold truncate">{p.name}</td>
                    <td className="p-3 truncate">{p.grade}</td>
                    <td className="p-3 truncate">{p.subject}</td>
                    <td className="p-3 truncate">{p.time}</td>
                    <td className="p-3 truncate">{p.questionCount}</td>
                    <td className="p-3 truncate">{p.createdBy}</td>
                    <td className="p-3 truncate">{p.createdAt}</td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700">
                          View
                        </button>
                        <button className="rounded-lg bg-yellow-500 px-3 py-1 text-white text-xs font-bold hover:bg-yellow-600">
                          Edit
                        </button>
                        <button className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700">
                          Delete
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
    </div>
  );
};

export default ViewPaperPage;
