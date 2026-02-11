import React, { useMemo, useState } from "react";
import {
  useDeletePaperMutation,
  useGetPaperFormDataQuery,
  useGetPapersQuery,
  useUpdatePaperMutation,
} from "../api/paperApi";

const fmtDate = (d) => {
  const x = new Date(d);
  if (Number.isNaN(x.getTime())) return "-";
  return x.toLocaleString();
};

const Modal = ({ open, title, children, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-3">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-extrabold text-blue-800">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 text-sm font-bold bg-gray-100 hover:bg-gray-200"
          >
            X
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const ViewPaperPage = () => {
  const { data, isLoading, isFetching } = useGetPapersQuery();
  const { data: formData } = useGetPaperFormDataQuery();

  const [deletePaper] = useDeletePaperMutation();
  const [updatePaper, { isLoading: saving }] = useUpdatePaperMutation();

  const papers = useMemo(() => (Array.isArray(data?.papers) ? data.papers : []), [data]);

  const rows = useMemo(() => {
    return papers.map((p) => {
      const meta = p?.meta || {};
      return {
        _id: p._id,
        raw: p,
        name: p.paperTitle,
        grade: meta?.grade ? `Grade ${meta.grade}` : "-",
        subject: meta?.stream ? `${meta.stream} - ${meta.subject || "-"}` : meta?.subject || "-",
        time: p.timeMinutes ? `${p.timeMinutes} Minutes` : "-",
        questionCount: p.questionCount ?? "-",
        createdBy: p.createdPersonName || "-",
        createdAt: fmtDate(p.createdAt),
      };
    });
  }, [papers]);

  // modal state
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selected, setSelected] = useState(null);

  // edit form state
  const enums = formData?.enums || {};
  const paperTypes = enums.paperTypes || ["Daily Quiz", "Topic wise paper", "Model paper", "Past paper"];
  const paymentTypes = enums.paymentTypes || ["free", "paid", "practise"];
  const attemptsAllowed = enums.attemptsAllowed || [1, 2, 3];

  const [form, setForm] = useState({
    paperType: "",
    paperTitle: "",
    timeMinutes: "",
    questionCount: "",
    oneQuestionAnswersCount: 5,
    createdPersonName: "",
    payment: "free",
    amount: "",
    attempts: 1,
    isActive: true,
  });

  const [errors, setErrors] = useState({});

  const openView = (paper) => {
    setSelected(paper);
    setViewOpen(true);
  };

  const openEdit = (paper) => {
    setSelected(paper);
    setForm({
      paperType: paper.paperType || "",
      paperTitle: paper.paperTitle || "",
      timeMinutes: paper.timeMinutes ?? "",
      questionCount: paper.questionCount ?? "",
      oneQuestionAnswersCount: paper.oneQuestionAnswersCount ?? 5,
      createdPersonName: paper.createdPersonName || "",
      payment: paper.payment || "free",
      amount: paper.payment === "paid" ? String(paper.amount ?? "") : "",
      attempts: paper.attempts ?? 1,
      isActive: paper.isActive !== false,
    });
    setErrors({});
    setEditOpen(true);
  };

  const validate = () => {
    const e = {};

    if (!form.paperType) e.paperType = "Paper Type is required";
    if (!String(form.paperTitle || "").trim()) e.paperTitle = "Paper Title is required";

    const t = Number(form.timeMinutes);
    if (!t || t < 1 || t > 180) e.timeMinutes = "Time must be 1..180 minutes";

    const qc = Number(form.questionCount);
    if (!qc || qc < 1 || qc > 50) e.questionCount = "Question Count must be 1..50";

    const oq = Number(form.oneQuestionAnswersCount);
    if (!oq || oq < 2 || oq > 10) e.oneQuestionAnswersCount = "Answers per question must be 2..10";

    if (!String(form.createdPersonName || "").trim()) e.createdPersonName = "Created Person Name is required";

    if (!paymentTypes.includes(String(form.payment))) e.payment = "Invalid payment";

    if (String(form.payment) === "paid") {
      const a = Number(form.amount);
      if (!a || a <= 0) e.amount = "Amount must be > 0 for paid papers";
    }

    const att = Number(form.attempts);
    if (!attemptsAllowed.includes(att)) e.attempts = "Attempts must be 1,2,3";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const setField = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  const onDelete = async (paperId) => {
    if (!window.confirm("Delete this paper?")) return;
    try {
      await deletePaper(paperId).unwrap();
      alert("✅ Paper deleted");
    } catch (err) {
      alert(err?.data?.message || "❌ Failed to delete");
    }
  };

  const onSaveEdit = async (e) => {
    e.preventDefault();
    if (!selected?._id) return;
    if (!validate()) return;

    try {
      const patch = {
        paperType: form.paperType,
        paperTitle: String(form.paperTitle).trim(),
        timeMinutes: Number(form.timeMinutes),
        questionCount: Number(form.questionCount),
        oneQuestionAnswersCount: Number(form.oneQuestionAnswersCount),
        createdPersonName: String(form.createdPersonName).trim(),
        payment: form.payment,
        amount: form.payment === "paid" ? Number(form.amount) : 0,
        attempts: Number(form.attempts),
        isActive: Boolean(form.isActive),
      };

      await updatePaper({ paperId: selected._id, patch }).unwrap();
      alert("✅ Paper updated");
      setEditOpen(false);
    } catch (err) {
      alert(err?.data?.message || "❌ Failed to update");
    }
  };

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
              {isLoading || isFetching ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-500">
                    No papers found
                  </td>
                </tr>
              ) : (
                rows.map((p, idx) => (
                  <tr key={p._id} className="border-t text-sm">
                    <td className="p-3 truncate">{String(idx + 1)}</td>
                    <td className="p-3 font-semibold truncate">{p.name}</td>
                    <td className="p-3 truncate">{p.grade}</td>
                    <td className="p-3 truncate">{p.subject}</td>
                    <td className="p-3 truncate">{p.time}</td>
                    <td className="p-3 truncate">{p.questionCount}</td>
                    <td className="p-3 truncate">{p.createdBy}</td>
                    <td className="p-3 truncate">{p.createdAt}</td>

                    <td className="p-3">
                      <div className="flex justify-center gap-2 flex-wrap">
                        <button
                          onClick={() => openView(p.raw)}
                          className="rounded-lg bg-blue-600 px-3 py-1 text-white text-xs font-bold hover:bg-blue-700"
                        >
                          View
                        </button>

                        <button
                          onClick={() => openEdit(p.raw)}
                          className="rounded-lg bg-yellow-500 px-3 py-1 text-white text-xs font-bold hover:bg-yellow-600"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => onDelete(p._id)}
                          className="rounded-lg bg-red-600 px-3 py-1 text-white text-xs font-bold hover:bg-red-700"
                        >
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

        {/* ✅ VIEW MODAL */}
        <Modal
          open={viewOpen}
          title="Paper View"
          onClose={() => {
            setViewOpen(false);
            setSelected(null);
          }}
        >
          {!selected ? (
            <p className="text-center text-gray-500">No data</p>
          ) : (
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="font-bold">Paper Title:</span>
                <span className="text-right">{selected.paperTitle}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Paper Type:</span>
                <span className="text-right">{selected.paperType}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Grade:</span>
                <span className="text-right">
                  {selected?.meta?.grade ? `Grade ${selected.meta.grade}` : "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Subject:</span>
                <span className="text-right">
                  {selected?.meta?.stream
                    ? `${selected.meta.stream} - ${selected.meta.subject || "-"}`
                    : selected?.meta?.subject || "-"}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Time:</span>
                <span className="text-right">{selected.timeMinutes} Minutes</span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Question Count:</span>
                <span className="text-right">{selected.questionCount}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Answers per Question:</span>
                <span className="text-right">{selected.oneQuestionAnswersCount}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Payment:</span>
                <span className="text-right">
                  {selected.payment} {selected.payment === "paid" ? `(Rs. ${selected.amount})` : ""}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Attempts:</span>
                <span className="text-right">{selected.attempts}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Created By:</span>
                <span className="text-right">{selected.createdPersonName}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-bold">Created At:</span>
                <span className="text-right">{fmtDate(selected.createdAt)}</span>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => {
                    setViewOpen(false);
                    openEdit(selected);
                  }}
                  className="w-full rounded-xl bg-yellow-500 px-4 py-2 text-white font-extrabold hover:bg-yellow-600 transition"
                >
                  Edit
                </button>
              </div>
            </div>
          )}
        </Modal>

        {/* ✅ EDIT MODAL */}
        <Modal
          open={editOpen}
          title="Edit Paper"
          onClose={() => {
            setEditOpen(false);
            setSelected(null);
          }}
        >
          {!selected ? (
            <p className="text-center text-gray-500">No data</p>
          ) : (
            <form className="space-y-4" onSubmit={onSaveEdit}>
              {/* Paper Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Paper Type
                </label>
                <select
                  value={form.paperType}
                  onChange={(e) => setField("paperType", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="">Select Paper Type</option>
                  {paperTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.paperType && <p className="text-xs text-red-600 mt-1">{errors.paperType}</p>}
              </div>

              {/* Paper Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Paper Name
                </label>
                <input
                  type="text"
                  placeholder="please enter paper name"
                  value={form.paperTitle}
                  onChange={(e) => setField("paperTitle", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.paperTitle && <p className="text-xs text-red-600 mt-1">{errors.paperTitle}</p>}
              </div>

              {/* Time */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Time
                </label>
                <input
                  type="number"
                  placeholder="ex : 20 minites"
                  min={1}
                  max={180}
                  value={form.timeMinutes}
                  onChange={(e) => setField("timeMinutes", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.timeMinutes && <p className="text-xs text-red-600 mt-1">{errors.timeMinutes}</p>}
              </div>

              {/* Question Count */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Question Count
                </label>
                <input
                  type="number"
                  placeholder="Question Count"
                  min={1}
                  max={50}
                  value={form.questionCount}
                  onChange={(e) => setField("questionCount", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.questionCount && <p className="text-xs text-red-600 mt-1">{errors.questionCount}</p>}
              </div>

              {/* Answers per question */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Answers per Question
                </label>
                <input
                  type="number"
                  min={2}
                  max={10}
                  value={form.oneQuestionAnswersCount}
                  onChange={(e) => setField("oneQuestionAnswersCount", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.oneQuestionAnswersCount && (
                  <p className="text-xs text-red-600 mt-1">{errors.oneQuestionAnswersCount}</p>
                )}
              </div>

              {/* created By */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  created By
                </label>
                <input
                  type="text"
                  placeholder="please enter creator name"
                  value={form.createdPersonName}
                  onChange={(e) => setField("createdPersonName", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
                {errors.createdPersonName && (
                  <p className="text-xs text-red-600 mt-1">{errors.createdPersonName}</p>
                )}
              </div>

              {/* Payment */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Payment
                </label>
                <select
                  value={form.payment}
                  onChange={(e) => {
                    const v = e.target.value;
                    setField("payment", v);
                    if (v !== "paid") setField("amount", "");
                  }}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {paymentTypes.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {errors.payment && <p className="text-xs text-red-600 mt-1">{errors.payment}</p>}
              </div>

              {/* Amount */}
              {form.payment === "paid" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    min={1}
                    value={form.amount}
                    onChange={(e) => setField("amount", e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount}</p>}
                </div>
              )}

              {/* Attempts */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Attempts
                </label>
                <select
                  value={form.attempts}
                  onChange={(e) => setField("attempts", e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
                >
                  {attemptsAllowed.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
                {errors.attempts && <p className="text-xs text-red-600 mt-1">{errors.attempts}</p>}
              </div>

              {/* SUBMIT */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-xl bg-blue-700 px-4 py-2 text-white font-extrabold hover:bg-blue-800 transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Update"}
                </button>
              </div>
            </form>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default ViewPaperPage;
