// src/compoments/LMSBar.jsx
import React from "react";
import { NavLink } from "react-router-dom";
import { FaEye, FaUsers, FaVideo } from "react-icons/fa";

const LMSBar = () => {
  const menuItemsTop = [
    { icon: FaEye, label: "LMS", path: "/lms/list" },
    { icon: FaUsers, label: "Class", path: "/lms/class" },
    { icon: FaVideo, label: "Live", path: "/lms/live" }, // ✅ NEW
  ];

  return (
    <div className="h-full flex items-center justify-center p-0 sm:p-6 md:p-8">
      <div className="w-[56px] sm:w-[96px] bg-gray-200 rounded-2xl shadow-md flex flex-col items-center py-3 sm:py-6 justify-between">
        <nav className="flex flex-col items-center space-y-3 sm:space-y-6 font-medium">
          {menuItemsTop.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center transition ${
                    isActive ? "text-blue-600" : "text-gray-700 hover:text-blue-600"
                  }`
                }
              >
                <Icon className="text-lg sm:text-2xl mb-1" />
                <span className="text-[8px] sm:text-xs leading-none text-center">
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default LMSBar;
