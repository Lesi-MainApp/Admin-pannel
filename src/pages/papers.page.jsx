import React from "react";

const PapersPage = () => {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-[#F7F6F6] px-3">
      {/* FORM CARD */}
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-md border border-gray-200 p-6">
        {/* TITLE */}
        <h1 className="text-2xl font-extrabold text-blue-800 text-center mb-6">
          ප්‍රශ්නපත්‍ර එකතු කිරීම
        </h1>

        <form className="space-y-4">
          {/* ශ්‍රේණිය */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ශ්‍රේණිය
            </label>
            <input
              type="text"
              placeholder="ශ්‍රේණිය ඇතුළත් කරන්න"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* ප්‍රශ්නපත්‍ර වර්ගය */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ප්‍රශ්නපත්‍ර වර්ගය
            </label>
            <input
              type="text"
              placeholder="ප්‍රශ්නපත්‍ර වර්ගය ඇතුළත් කරන්න"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* විශය */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              විශය
            </label>
            <input
              type="text"
              placeholder="විශය ඇතුළත් කරන්න"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* ප්‍රශ්නපත්‍රයේ නම */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ප්‍රශ්නපත්‍රයේ නම
            </label>
            <input
              type="text"
              placeholder="ප්‍රශ්නපත්‍රයේ නම ඇතුළත් කරන්න"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* කාලය */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              කාලය
            </label>
            <input
              type="text"
              placeholder="උදා: මිනිත්තු 60"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* ප්‍රශ්න ගණන */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              ප්‍රශ්න ගණන
            </label>
            <input
              type="number"
              placeholder="ප්‍රශ්න ගණන"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* නිර්මාණය කරන ලද්දේ */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              නිර්මාණය කරන ලද්දේ
            </label>
            <input
              type="text"
              placeholder="නිර්මාණය කළ පුද්ගලයාගේ නම"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          {/* SUBMIT BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-700 px-4 py-2 text-white font-extrabold hover:bg-blue-800 transition"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PapersPage;
