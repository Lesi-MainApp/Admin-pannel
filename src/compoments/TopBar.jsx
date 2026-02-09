import React from "react";
import lesiiskole_logo from "../assets/lesiiskole_logo.png";

const TopBar = () => {
  return (
    <div className="w-full bg-[#D9D9D9] h-20 px-4">
      <div className="relative h-full flex items-center">
        {/* Logo - Left */}
        <div className="flex items-center">
          <img
            src={lesiiskole_logo}
            alt="Lesi Iskole Logo"
            className="h-10 w-auto"
          />
        </div>

        {/* Center Text */}
        <div className="absolute left-1/2 transform -translate-x-1/2 text-center leading-tight">
          <h1 className="text-lg font-bold text-blue-900">
            MainApp Admin Panel
          </h1>
          <p className="text-sm text-gray-700">
            Welcome to Lesi Iskole Main App Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
