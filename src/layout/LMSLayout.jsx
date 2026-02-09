// src/layout/LMSLayout.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import LMSBar from "../compoments/LMSBar.jsx"; // ✅ include extension (Vite safe)

function LMSLayout() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F6F6]">
      {/* LEFT */}
      <div className="h-full w-[56px] sm:w-[110px] flex justify-start pl-5 sm:pl-0">
        <LMSBar />
      </div>

      {/* RIGHT */}
      <div className="flex flex-col flex-1 h-full min-w-0 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default LMSLayout;
