import React from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../compoments/TopBar";

import lms from "../assets/lms.png";
import papers from "../assets/papers.png";
import student from "../assets/student.png";
import teacher from "../assets/teacher.png";
import subject from "../assets/subject.png";
import result from "../assets/result.png";

const HomePage = () => {
  const navigate = useNavigate();

  const cards = [
    { img: papers, title: "Papers", to: "/paper" },
    { img: student, title: "Students", to: "/student" },
    { img: lms, title: "LMS", to: "/lms" },
    { img: teacher, title: "Teacher", to: "/teacher" },
    { img: subject, title: "Grade & Subjects", to: "/grade-subject" },
    { img: result, title: "Result", to: "/result" },
  ];

  const Card = ({ img, title, to }) => (
    <div
      onClick={() => navigate(to)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(to)}
      className="
        group cursor-pointer rounded-2xl border border-gray-200 bg-white
        p-5 sm:p-6 shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:shadow-xl hover:border-blue-200
        active:scale-[0.99]
      "
    >
      <div className="flex min-h-[240px] sm:min-h-[260px] flex-col items-center justify-center text-center">
        {/* Image Box */}
        <div
          className="
            mb-5 flex h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32
            items-center justify-center rounded-2xl
            bg-gradient-to-br from-blue-50 to-indigo-50
            ring-1 ring-gray-100 transition-transform duration-300
            group-hover:scale-105
          "
        >
          <img
            src={img}
            alt={title}
            className="h-14 w-14 object-contain sm:h-16 sm:w-16 md:h-20 md:w-20"
          />
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg md:text-xl font-semibold tracking-tight text-gray-900">
          {title}
        </h3>

        {/* Accent line */}
        <div
          className="
            mt-4 h-1 w-10 rounded-full
            bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500
            transition-all duration-300 group-hover:w-16
          "
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <TopBar />

      <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-110px)] w-full max-w-6xl items-center">
          <div className="w-full">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {cards.map((card) => (
                <Card
                  key={card.title}
                  img={card.img}
                  title={card.title}
                  to={card.to}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;