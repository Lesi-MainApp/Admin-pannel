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
      className="bg-white rounded-2xl shadow-md border border-gray-100 p-2 hover:shadow-lg transition duration-200 cursor-pointer aspect-square active:scale-[0.99]"
    >
      <div className="h-full flex flex-col items-center justify-center text-center">
        <div>
          <img src={img} alt={title} className="w-50 h-50 object-contain" />
        </div>

        <h3 className="text-base font-bold text-gray-900">{title}</h3>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <TopBar />

      <div className="min-h-[calc(50vh-10px)] flex items-center justify-center px-2 py-4">
        <div className="w-full max-w-2xl">
          <div className="flex flex-col gap-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-50">
              <Card img={papers} title="Papers" to="/paper" />
              <Card img={student} title="Students" to="/student" />
            </div>

            {/* Row 2 */}
            <div className="flex justify-center">
              <div className="w-full md:w-[38%]">
                <Card img={lms} title="LMS" to="/lms" />
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-50">
              <Card img={teacher} title="Teacher" to="/teacher" />
              <Card img={subject} title="Grade & Subjects" to="/grade-subject" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
