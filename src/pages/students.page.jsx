import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  useGetStudentOptionsQuery,
  useGetStudentsQuery,
  useUpdateStudentMutation,
  useBanStudentMutation,
  useUnbanStudentMutation,
  useDeleteStudentMutation,
} from "../api/studentApi";
import { setStudentFilters, resetStudentFilters } from "../api/features/studentSlice";

const levelsToGrades = {
  primary: Array.from({ length: 5 }, (_, i) => String(i + 1)),
  secondary: Array.from({ length: 6 }, (_, i) => String(i + 6)),
  al: ["12", "13"],
};

const Modal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg px-3 py-1 bg-gray-100 hover:bg-gray-200 font-bold"
          >
            ✕
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer ? <div className="px-5 py-4 border-t bg-gray-50">{footer}</div> : null}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder = "" }) => (
  <div className="w-full">
    <label className="text-xs font-semibold text-gray-600">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder = "Select" }) => (
  <div className="w-full">
    <label className="text-xs font-semibold text-gray-600">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
    >
      <option value="">{placeholder}</option>
      {options.map((op) => (
        <option key={String(op.value ?? op)} value={String(op.value ?? op)}>
          {String(op.label ?? op)}
        </option>
      ))}
    </select>
  </div>
);

const Th = ({ children, className = "" }) => (
  <th className={`p-2 text-left text-[12px] font-bold text-gray-800 ${className}`}>{children}</th>
);
const Td = ({ children, className = "" }) => (
  <td className={`p-2 align-top text-[12px] text-gray-700 ${className}`}>{children}</td>
);

const StudentsPage = () => {
  const dispatch = useDispatch();

  // ✅ MUST match store key: student
  const filters = useSelector((s) => s.student.filters);

  const { data: optData } = useGetStudentOptionsQuery();
  const districts = optData?.districts || [];
  const classes = optData?.classes || [];
  const levelOptions = optData?.levels || ["primary", "secondary", "al"];

  const gradeOptions = useMemo(() => {
    const lv = String(filters.level || "").trim();
    return lv ? (levelsToGrades[lv] || []) : [];
  }, [filters.level]);

  // ✅ Auto-load ALL (filters default is empty => backend returns all)
  const { data, isLoading, isFetching, error } = useGetStudentsQuery(filters);
  const rows = data?.rows || [];
  const total = data?.total || 0;

  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [banConfirmOpen, setBanConfirmOpen] = useState(false);
  const [deleteConfirm1Open, setDeleteConfirm1Open] = useState(false);
  const [deleteConfirm2Open, setDeleteConfirm2Open] = useState(false);

  const [selected, setSelected] = useState(null);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phonenumber: "",
    district: "",
    town: "",
    address: "",
    selectedLevel: "",
    selectedGradeNumber: "",
    className: "",
  });

  const [updateStudent, { isLoading: updating }] = useUpdateStudentMutation();
  const [banStudent, { isLoading: banning }] = useBanStudentMutation();
  const [unbanStudent, { isLoading: unbanning }] = useUnbanStudentMutation();
  const [deleteStudent, { isLoading: deleting }] = useDeleteStudentMutation();

  useEffect(() => {
    if (filters.level && filters.grade && !gradeOptions.includes(String(filters.grade))) {
      dispatch(setStudentFilters({ grade: "" }));
    }
  }, [filters.level, filters.grade, gradeOptions, dispatch]);

  const onSearch = (e) => {
    e.preventDefault();
    dispatch(setStudentFilters({ page: 1 }));
  };

  const onReset = () => {
    dispatch(resetStudentFilters());
  };

  const openView = (row) => {
    setSelected(row);
    setViewOpen(true);
  };

  const openEdit = (row) => {
    setSelected(row);
    setEditForm({
      name: row?.name || "",
      email: row?.email || "",
      phonenumber: row?.phonenumber || "",
      district: row?.district || "",
      town: row?.town || "",
      address: row?.address || "",
      selectedLevel: row?.selectedLevel || "",
      selectedGradeNumber: row?.selectedGradeNumber ? String(row.selectedGradeNumber) : "",
      className: row?.className || "",
    });
    setEditOpen(true);
  };

  const openBanConfirm = (row) => {
    setSelected(row);
    setBanConfirmOpen(true);
  };

  const openDeleteConfirm1 = (row) => {
    setSelected(row);
    setDeleteConfirm1Open(true);
  };

  const statusBadge = (isActive) => {
    const active = isActive !== false;
    return (
      <span
        className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${
          active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {active ? "Active" : "Inactive"}
      </span>
    );
  };

  const saveEdit = async () => {
    if (!selected?._id) return;

    const body = {
      name: editForm.name,
      email: editForm.email,
      phonenumber: editForm.phonenumber,
      district: editForm.district,
      town: editForm.town,
      address: editForm.address,
      selectedLevel: editForm.selectedLevel || null,
      selectedGradeNumber: editForm.selectedGradeNumber ? Number(editForm.selectedGradeNumber) : null,
    };

    await updateStudent({ id: selected._id, body }).unwrap();
    setEditOpen(false);
  };

  const doBanToggle = async () => {
    if (!selected?._id) return;
    const active = selected?.isActive !== false;

    if (active) await banStudent(selected._id).unwrap();
    else await unbanStudent(selected._id).unwrap();

    setBanConfirmOpen(false);
  };

  const doDeleteStep1 = () => {
    setDeleteConfirm1Open(false);
    setDeleteConfirm2Open(true);
  };

  const doDeleteFinal = async () => {
    if (!selected?._id) return;
    await deleteStudent(selected._id).unwrap();
    setDeleteConfirm2Open(false);
  };

  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 20);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const goPage = (p) => {
    const target = Math.min(totalPages, Math.max(1, p));
    dispatch(setStudentFilters({ page: target }));
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Students
        </h1>

        {/* FILTER */}
        <form
          onSubmit={onSearch}
          className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
        >
          <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
            <Select
              label="Status"
              value={filters.status}
              onChange={(v) => dispatch(setStudentFilters({ status: v }))}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Non Active" },
              ]}
              placeholder="Select"
            />

            <Input
              label="Email"
              value={filters.email}
              onChange={(v) => dispatch(setStudentFilters({ email: v }))}
              placeholder="example@mail.com"
            />

            <Select
              label="District"
              value={filters.district}
              onChange={(v) => dispatch(setStudentFilters({ district: v }))}
              options={districts}
              placeholder="Select"
            />

            <Select
              label="LEVEL"
              value={filters.level}
              onChange={(v) => dispatch(setStudentFilters({ level: v, grade: "" }))}
              options={levelOptions.map((x) => ({ value: x, label: x.toUpperCase() }))}
              placeholder="Select"
            />

            <Select
              label="Grade"
              value={filters.grade}
              onChange={(v) => dispatch(setStudentFilters({ grade: v }))}
              options={gradeOptions}
              placeholder={filters.level ? "Select" : "Select level first"}
            />

            <Select
              label="ClassName"
              value={filters.classId}
              onChange={(v) => dispatch(setStudentFilters({ classId: v }))}
              options={classes.map((c) => ({ value: c.id, label: c.className }))}
              placeholder="Select"
            />

            <Input
              label="Completed Paper Count"
              value={filters.completedCount}
              onChange={(v) =>
                dispatch(setStudentFilters({ completedCount: v.replace(/[^\d]/g, "") }))
              }
              placeholder="number"
            />
          </div>

          <div className="mt-4 flex flex-col sm:flex-row gap-2 sm:justify-end">
            <button
              type="submit"
              className="rounded-xl bg-blue-700 px-4 py-2 text-white font-extrabold hover:bg-blue-800 transition"
            >
              Search
            </button>

            <button
              type="button"
              onClick={onReset}
              className="rounded-xl bg-gray-200 px-4 py-2 text-gray-800 font-extrabold hover:bg-red-300 transition"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            {isLoading || isFetching ? "Loading..." : `Total: ${total}`}
            {error ? <span className="text-red-600 font-bold"> | Failed to load</span> : null}
          </div>
        </form>

        {/* TABLE */}
        <div className="mt-4 w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-100">
                <Th className="w-[11%]">Student Name</Th>
                <Th className="w-[12%]">Email</Th>
                <Th className="w-[8%]">District</Th>
                <Th className="w-[8%]">Town</Th>
                <Th className="w-[12%]">Address</Th>
                <Th className="w-[7%]">Level</Th>
                <Th className="w-[6%]">Grade</Th>
                <Th className="w-[10%]">ClassName</Th>
                <Th className="w-[10%]">Complete Papers</Th>
                <Th className="w-[7%]">Status</Th>
                <Th className="w-[9%] text-center">Operation</Th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={11}>
                    No students found
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <tr key={s._id} className="border-t">
                    <Td className="truncate font-semibold">{s.name}</Td>
                    <Td className="truncate">{s.email}</Td>
                    <Td className="truncate">{s.district || "-"}</Td>
                    <Td className="truncate">{s.town || "-"}</Td>
                    <Td className="truncate">{s.address || "-"}</Td>
                    <Td className="truncate">{s.selectedLevel || "-"}</Td>
                    <Td className="truncate">
                      {s.selectedGradeNumber ? String(s.selectedGradeNumber) : "-"}
                    </Td>
                    <Td className="truncate">{s.className || "-"}</Td>
                    <Td className="truncate">{String(s.completedPapersCount ?? 0)}</Td>
                    <Td>{statusBadge(s.isActive)}</Td>

                    <Td className="text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <button
                          onClick={() => openView(s)}
                          className="rounded-lg bg-blue-600 px-2 py-1 text-white text-[11px] font-bold hover:bg-blue-700"
                        >
                          View
                        </button>

                        <button
                          onClick={() => openEdit(s)}
                          className="rounded-lg bg-yellow-500 px-2 py-1 text-white text-[11px] font-bold hover:bg-yellow-600"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => openBanConfirm(s)}
                          className="rounded-lg bg-purple-600 px-2 py-1 text-white text-[11px] font-bold hover:bg-purple-700"
                        >
                          {s.isActive === false ? "Unban" : "Ban"}
                        </button>

                        <button
                          onClick={() => openDeleteConfirm1(s)}
                          className="rounded-lg bg-red-600 px-2 py-1 text-white text-[11px] font-bold hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          <div className="p-3 flex items-center justify-between border-t bg-gray-50">
            <div className="text-xs text-gray-600 font-bold">
              Page {page} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button onClick={() => goPage(1)} className="px-3 py-1 rounded-lg bg-white border font-bold text-xs hover:bg-gray-100">
                First
              </button>
              <button onClick={() => goPage(page - 1)} className="px-3 py-1 rounded-lg bg-white border font-bold text-xs hover:bg-gray-100">
                Prev
              </button>
              <button onClick={() => goPage(page + 1)} className="px-3 py-1 rounded-lg bg-white border font-bold text-xs hover:bg-gray-100">
                Next
              </button>
              <button onClick={() => goPage(totalPages)} className="px-3 py-1 rounded-lg bg-white border font-bold text-xs hover:bg-gray-100">
                Last
              </button>
            </div>
          </div>
        </div>

        {/* MODALS (same as your current code) */}
        {/* ✅ Keep all modal code exactly as you pasted (View/Edit/Ban/Delete1/Delete2) */}
        {/* If you want I can paste them again, but they are already correct in your file */}
      </div>
    </div>
  );
};

export default StudentsPage;