import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../compoments/TopBar";

import lms from "../assets/lms.png";
import papers from "../assets/papers.png";
import student from "../assets/student.png";
import teacher from "../assets/teacher.png";
import subject from "../assets/subject.png";

const HomePage = () => {
  const navigate = useNavigate();

  const Card = ({ img, title, to }) => (
    <div
      onClick={() => navigate(to)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(to)}
      className="group cursor-pointer border border-gray-200 bg-white p-4 sm:p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.99]"
    >
      <div className="flex h-full min-h-[220px] sm:min-h-[250px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex items-center justify-center">
          <img
            src={img}
            alt={title}
            className="h-24 w-24 object-contain sm:h-28 sm:w-28 md:h-32 md:w-32"
          />
        </div>

        <h3 className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg">
          {title}
        </h3>

        
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar />

      <div className="px-3 py-6 sm:px-6 sm:py-8">
        <div className="mx-auto w-full max-w-6xl">
          <div className="mb-6 text-center">
           
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Card img={papers} title="Papers" to="/paper" />
            <Card img={student} title="Students" to="/student" />
            <Card img={lms} title="LMS" to="/lms" />
            <Card img={teacher} title="Teacher" to="/teacher" />
            <Card img={subject} title="Grade & Subjects" to="/grade-subject" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;