import React, { useMemo, useState } from "react";

const StudentsPage = () => {
  // ---- filter state ----
  const [status, setStatus] = useState("");
  const [regNo, setRegNo] = useState("");
  const [completePapers, setCompletePapers] = useState("");

  const [district, setDistrict] = useState("");
  const [town, setTown] = useState("");
  const [subject, setSubject] = useState("");

  // ---- dropdown options (replace with API later) ----
  const statusOptions = ["Active", "Inactive", "Blocked"];
  const regNoOptions = ["REG-001", "REG-002", "REG-003"];
  const completePapersOptions = ["0", "1-5", "6-10", "10+"];

  const districtOptions = ["Colombo", "Gampaha", "Kandy"];
  const townOptions = ["Dehiwala", "Maharagama", "Kiribathgoda", "Peradeniya"];
  const subjectOptions = ["Maths", "Science", "English", "ICT", "History"];

  // ---- sample table data (replace with API later) ----
  const rows = useMemo(
    () => [
      {
        regNo: "REG-001",
        name: "Nimal Perera",
        email: "nimal@mail.com",
        district: "Colombo",
        town: "Dehiwala",
        address: "No 12, Galle Road",
        grade: "6",
        subject: "Maths",
        status: "Active",
        lastActive: "2026-01-22",
        completePapers: "6-10",
      },
      {
        regNo: "REG-002",
        name: "Kavindi Silva",
        email: "kavindi@mail.com",
        district: "Gampaha",
        town: "Kiribathgoda",
        address: "No 88, Kandy Road",
        grade: "9",
        subject: "Science",
        status: "Inactive",
        lastActive: "2026-01-10",
        completePapers: "1-5",
      },
      {
        regNo: "REG-003",
        name: "Sahan Jayasooriya",
        email: "sahan@mail.com",
        district: "Kandy",
        town: "Peradeniya",
        address: "No 5, Temple Road",
        grade: "11",
        subject: "English",
        status: "Active",
        lastActive: "2026-01-23",
        completePapers: "10+",
      },
    ],
    []
  );

  // ---- basic filtering ----
  const filteredRows = useMemo(() => {
    return rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (regNo && r.regNo !== regNo) return false;
      if (completePapers && r.completePapers !== completePapers) return false;
      if (district && r.district !== district) return false;
      if (town && r.town !== town) return false;
      if (subject && r.subject !== subject) return false;
      return true;
    });
  }, [rows, status, regNo, completePapers, district, town, subject]);

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleReset = () => {
    setStatus("");
    setRegNo("");
    setCompletePapers("");
    setDistrict("");
    setTown("");
    setSubject("");
  };

  const Select = ({ label, value, onChange, options, placeholder }) => (
    <div className="w-full">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
      >
        <option value="">{placeholder}</option>
        {options.map((op) => (
          <option key={op} value={op}>
            {op}
          </option>
        ))}
      </select>
    </div>
  );

  const Th = ({ children, className = "" }) => (
    <th
      className={`p-2 text-left text-[12px] font-bold text-gray-800 ${className}`}
    >
      {children}
    </th>
  );

  const Td = ({ children, className = "" }) => (
    <td className={`p-2 align-top text-[12px] text-gray-700 ${className}`}>
      {children}
    </td>
  );

  return (
    <div className="w-full flex justify-center">
      {/* ✅ ONLY THIS LINE CHANGED: max-w-7xl -> max-w-[95vw] */}
      <div className="w-full max-w-[95vw] px-3 sm:px-6 py-4 sm:py-6 min-w-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-blue-800 text-center">
          Students
        </h1>

        {/* FILTER BOX (UNCHANGED) */}
        <form
          onSubmit={handleSearch}
          className="mt-5 bg-white rounded-2xl shadow-sm border border-gray-200 p-4"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="Status"
                  value={status}
                  onChange={setStatus}
                  options={statusOptions}
                  placeholder="Select"
                />
                <Select
                  label="RegNo"
                  value={regNo}
                  onChange={setRegNo}
                  options={regNoOptions}
                  placeholder="Select"
                />
                <Select
                  label="Complete Papers"
                  value={completePapers}
                  onChange={setCompletePapers}
                  options={completePapersOptions}
                  placeholder="Select"
                />
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Select
                  label="District"
                  value={district}
                  onChange={setDistrict}
                  options={districtOptions}
                  placeholder="Select"
                />
                <Select
                  label="Town"
                  value={town}
                  onChange={setTown}
                  options={townOptions}
                  placeholder="Select"
                />
                <Select
                  label="Subjects"
                  value={subject}
                  onChange={setSubject}
                  options={subjectOptions}
                  placeholder="Select"
                />
              </div>
            </div>

            <div className="w-full lg:w-44 flex lg:flex-col gap-2 lg:justify-start lg:items-stretch">
              <button
                type="submit"
                className="w-full rounded-xl bg-blue-700 px-4 py-2 text-white font-extrabold hover:bg-blue-800 transition mt-10"
              >
                Search
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-xl bg-gray-200 px-4 py-2 text-gray-800 font-extrabold hover:bg-red-300 transition"
              >
                Reset
              </button>
            </div>
          </div>
        </form>

        {/* TABLE (NO HORIZONTAL SCROLL) */}
        <div className="mt-4 w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full table-fixed">
            <thead>
              <tr className="bg-gray-100">
                <Th className="w-[7%]">RegNo</Th>
                <Th className="w-[10%]">Student Name</Th>
                <Th className="w-[12%]">Email</Th>
                <Th className="w-[7%]">District</Th>
                <Th className="w-[7%]">Town</Th>
                <Th className="w-[12%]">Address</Th>
                <Th className="w-[5%]">Grade</Th>
                <Th className="w-[7%]">Subject</Th>
                <Th className="w-[6%]">Status</Th>
                <Th className="w-[8%]">Last Active</Th>
                <Th className="w-[8%]">Complete Papers</Th>
                <Th className="w-[11%] text-center">Operation</Th>
              </tr>
            </thead>

            <tbody>
              {filteredRows.length === 0 ? (
                <tr>
                  <td className="p-6 text-center text-gray-500" colSpan={12}>
                    No students found
                  </td>
                </tr>
              ) : (
                filteredRows.map((s) => (
                  <tr key={s.regNo} className="border-t">
                    <Td className="truncate">{s.regNo}</Td>
                    <Td className="font-semibold truncate">{s.name}</Td>
                    <Td className="truncate">{s.email}</Td>
                    <Td className="truncate">{s.district}</Td>
                    <Td className="truncate">{s.town}</Td>
                    <Td className="truncate">{s.address}</Td>
                    <Td className="truncate">{s.grade}</Td>
                    <Td className="truncate">{s.subject}</Td>

                    <Td>
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-[11px] font-bold ${
                          s.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : s.status === "Inactive"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {s.status}
                      </span>
                    </Td>

                    <Td className="truncate">{s.lastActive}</Td>
                    <Td className="truncate">{s.completePapers}</Td>

                    <Td className="text-center">
                      <div className="flex justify-center gap-1 flex-wrap">
                        <button className="rounded-lg bg-blue-600 px-2 py-1 text-white text-[11px] font-bold hover:bg-blue-700">
                          View
                        </button>
                        <button className="rounded-lg bg-yellow-500 px-2 py-1 text-white text-[11px] font-bold hover:bg-yellow-600">
                          Edit
                        </button>
                        <button className="rounded-lg bg-red-600 px-2 py-1 text-white text-[11px] font-bold hover:bg-red-700">
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
      </div>
    </div>
  );
};

export default StudentsPage;
