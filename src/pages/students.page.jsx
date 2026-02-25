// src/pages/Students.page.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
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
      <div className="w-full max-w-2xl overflow-hidden border border-gray-200 bg-white shadow-lg">
        <div className="flex items-center justify-between border-b border-gray-200 bg-[#F8FAFC] px-5 py-4">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Close
          </button>
        </div>

        <div className="p-5">{children}</div>

        {footer ? (
          <div className="border-t border-gray-200 bg-[#F8FAFC] px-5 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder = "" }) => (
  <div className="w-full">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
    />
  </div>
);

const Select = ({ label, value, onChange, options, placeholder = "Select" }) => (
  <div className="w-full">
    <label className="text-xs font-medium text-gray-600">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:ring-2 focus:ring-blue-300"
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
  <th
    className={`border-b border-r border-gray-200 bg-[#F8FAFC] px-4 py-3 text-left text-[13px] font-medium text-gray-600 ${className}`}
  >
    {children}
  </th>
);

const Td = ({ children, className = "" }) => (
  <td
    className={`border-b border-r border-gray-200 px-4 py-4 align-top text-sm text-gray-700 ${className}`}
  >
    {children}
  </td>
);

const StudentsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const filters = useSelector((s) => s.student.filters);

  const { data: optData } = useGetStudentOptionsQuery();
  const districts = optData?.districts || [];
  const classes = optData?.classes || [];
  const levelOptions = optData?.levels || ["primary", "secondary", "al"];

  const gradeOptions = useMemo(() => {
    const lv = String(filters.level || "").trim();
    return lv ? levelsToGrades[lv] || [] : [];
  }, [filters.level]);

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
      selectedGradeNumber: row?.selectedGradeNumber
        ? String(row.selectedGradeNumber)
        : "",
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
        className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${
          active
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
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
      selectedGradeNumber: editForm.selectedGradeNumber
        ? Number(editForm.selectedGradeNumber)
        : null,
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
  const limit = 20;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const goPage = (p) => {
    const target = Math.min(totalPages, Math.max(1, p));
    dispatch(setStudentFilters({ page: target }));
  };

  return (
    <div className="flex w-full justify-center">
      <div className="min-w-0 w-full max-w-[95vw] px-3 py-4 sm:px-6 sm:py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
              Student Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Search, review, edit, and manage student records.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/home")}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 hover:text-red-700"
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

        <form
          onSubmit={onSearch}
          className="mt-5 border border-gray-200 bg-white p-4 sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Select
              label="Status"
              value={filters.status}
              onChange={(v) => dispatch(setStudentFilters({ status: v }))}
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
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
              label="Level"
              value={filters.level}
              onChange={(v) => dispatch(setStudentFilters({ level: v, grade: "" }))}
              options={levelOptions.map((x) => ({
                value: x,
                label: x.toUpperCase(),
              }))}
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
              label="Class Name"
              value={filters.classId}
              onChange={(v) => dispatch(setStudentFilters({ classId: v }))}
              options={classes.map((c) => ({
                value: c.id,
                label: c.className,
              }))}
              placeholder="Select"
            />

            <Input
              label="Completed Paper Count"
              value={filters.completedCount}
              onChange={(v) =>
                dispatch(
                  setStudentFilters({
                    completedCount: v.replace(/[^\d]/g, ""),
                  })
                )
              }
              placeholder="Number"
            />
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Search
            </button>

            <button
              type="button"
              onClick={onReset}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Reset
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            {isLoading || isFetching ? "Loading..." : `Total: ${total}`}
            {error ? (
              <span className="font-medium text-red-600"> | Failed to load</span>
            ) : null}
          </div>
        </form>

        <div className="mt-5 overflow-hidden border border-gray-200 bg-white">
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[1500px] table-fixed border-separate border-spacing-0">
              <thead>
                <tr>
                  <Th className="w-[11%]">Student Name</Th>
                  <Th className="w-[12%]">Email</Th>
                  <Th className="w-[8%]">District</Th>
                  <Th className="w-[8%]">Town</Th>
                  <Th className="w-[12%]">Address</Th>
                  <Th className="w-[7%]">Level</Th>
                  <Th className="w-[6%]">Grade</Th>
                  <Th className="w-[10%]">Class Name</Th>
                  <Th className="w-[10%]">Complete Papers</Th>
                  <Th className="w-[7%]">Status</Th>
                  <Th className="w-[9%] border-r-0 text-center">Operation</Th>
                </tr>
              </thead>

              <tbody className="bg-white">
                {rows.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-center text-gray-500" colSpan={11}>
                      No students found
                    </td>
                  </tr>
                ) : (
                  rows.map((s) => (
                    <tr key={s._id} className="hover:bg-gray-50/70">
                      <Td className="truncate font-medium text-gray-800">
                        {s.name}
                      </Td>
                      <Td className="truncate">{s.email}</Td>
                      <Td className="truncate">{s.district || "-"}</Td>
                      <Td className="truncate">{s.town || "-"}</Td>
                      <Td className="truncate">{s.address || "-"}</Td>
                      <Td className="truncate">{s.selectedLevel || "-"}</Td>
                      <Td className="truncate">
                        {s.selectedGradeNumber ? String(s.selectedGradeNumber) : "-"}
                      </Td>
                      <Td className="truncate">{s.className || "-"}</Td>
                      <Td className="truncate">
                        {String(s.completedPapersCount ?? 0)}
                      </Td>
                      <Td>{statusBadge(s.isActive)}</Td>

                      <Td className="border-r-0 text-center">
                        <div className="flex flex-wrap justify-center gap-2">
                          <button
                            onClick={() => openView(s)}
                            className="rounded-lg bg-blue-600 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-blue-700"
                          >
                            View
                          </button>

                          <button
                            onClick={() => openEdit(s)}
                            className="rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-amber-600"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => openBanConfirm(s)}
                            className="rounded-lg bg-purple-600 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-purple-700"
                          >
                            {s.isActive === false ? "Unban" : "Ban"}
                          </button>

                          <button
                            onClick={() => openDeleteConfirm1(s)}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-red-700"
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
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-3 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Page {page} of {totalPages}
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => goPage(1)}
                className="inline-flex h-8 items-center justify-center rounded border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                First
              </button>

              <button
                onClick={() => goPage(page - 1)}
                className="inline-flex h-8 items-center justify-center rounded border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Prev
              </button>

              <button
                onClick={() => goPage(page + 1)}
                className="inline-flex h-8 items-center justify-center rounded border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Next
              </button>

              <button
                onClick={() => goPage(totalPages)}
                className="inline-flex h-8 items-center justify-center rounded border border-gray-200 px-3 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Last
              </button>
            </div>
          </div>
        </div>

        <Modal
          open={viewOpen}
          title="Student Details"
          onClose={() => setViewOpen(false)}
          footer={
            <div className="flex justify-end">
              <button
                onClick={() => setViewOpen(false)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          }
        >
          {!selected ? (
            <div className="text-sm text-gray-500">No data</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <div className="text-xs font-medium text-gray-500">Name</div>
                <div className="mt-1 text-sm text-gray-800">{selected.name || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Email</div>
                <div className="mt-1 text-sm text-gray-800">{selected.email || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Phone</div>
                <div className="mt-1 text-sm text-gray-800">
                  {selected.phonenumber || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">District</div>
                <div className="mt-1 text-sm text-gray-800">
                  {selected.district || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Town</div>
                <div className="mt-1 text-sm text-gray-800">{selected.town || "-"}</div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Address</div>
                <div className="mt-1 text-sm text-gray-800">
                  {selected.address || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Level</div>
                <div className="mt-1 text-sm text-gray-800">
                  {selected.selectedLevel || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Grade</div>
                <div className="mt-1 text-sm text-gray-800">
                  {selected.selectedGradeNumber || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Class Name</div>
                <div className="mt-1 text-sm text-gray-800">
                  {selected.className || "-"}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Completed Papers</div>
                <div className="mt-1 text-sm text-gray-800">
                  {selected.completedPapersCount ?? 0}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-gray-500">Status</div>
                <div className="mt-1">{statusBadge(selected.isActive)}</div>
              </div>
            </div>
          )}
        </Modal>

        <Modal
          open={editOpen}
          title="Edit Student"
          onClose={() => setEditOpen(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={updating}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {updating ? "Saving..." : "Save"}
              </button>
            </div>
          }
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              value={editForm.name}
              onChange={(v) => setEditForm((p) => ({ ...p, name: v }))}
            />
            <Input
              label="Email"
              value={editForm.email}
              onChange={(v) => setEditForm((p) => ({ ...p, email: v }))}
            />
            <Input
              label="Phone Number"
              value={editForm.phonenumber}
              onChange={(v) => setEditForm((p) => ({ ...p, phonenumber: v }))}
            />
            <Input
              label="District"
              value={editForm.district}
              onChange={(v) => setEditForm((p) => ({ ...p, district: v }))}
            />
            <Input
              label="Town"
              value={editForm.town}
              onChange={(v) => setEditForm((p) => ({ ...p, town: v }))}
            />
            <Input
              label="Address"
              value={editForm.address}
              onChange={(v) => setEditForm((p) => ({ ...p, address: v }))}
            />
            <Input
              label="Level"
              value={editForm.selectedLevel}
              onChange={(v) => setEditForm((p) => ({ ...p, selectedLevel: v }))}
            />
            <Input
              label="Grade"
              value={editForm.selectedGradeNumber}
              onChange={(v) =>
                setEditForm((p) => ({ ...p, selectedGradeNumber: v }))
              }
            />
            <Input
              label="Class Name"
              value={editForm.className}
              onChange={(v) => setEditForm((p) => ({ ...p, className: v }))}
            />
          </div>
        </Modal>

        <Modal
          open={banConfirmOpen}
          title={selected?.isActive === false ? "Unban Student" : "Ban Student"}
          onClose={() => setBanConfirmOpen(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setBanConfirmOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={doBanToggle}
                disabled={banning || unbanning}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:opacity-60"
              >
                {banning || unbanning
                  ? "Processing..."
                  : selected?.isActive === false
                  ? "Unban"
                  : "Ban"}
              </button>
            </div>
          }
        >
          <div className="text-sm text-gray-700">
            {selected?.isActive === false
              ? "Are you sure you want to unban this student?"
              : "Are you sure you want to ban this student?"}
          </div>
        </Modal>

        <Modal
          open={deleteConfirm1Open}
          title="Delete Student"
          onClose={() => setDeleteConfirm1Open(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm1Open(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={doDeleteStep1}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          }
        >
          <div className="text-sm text-gray-700">
            This action will permanently remove the student record.
          </div>
        </Modal>

        <Modal
          open={deleteConfirm2Open}
          title="Confirm Delete"
          onClose={() => setDeleteConfirm2Open(false)}
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm2Open(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={doDeleteFinal}
                disabled={deleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          }
        >
          <div className="text-sm text-gray-700">
            Please confirm again. This action cannot be undone.
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default StudentsPage;