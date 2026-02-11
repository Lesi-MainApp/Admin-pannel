// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { store } from "./api/Store";
import "./index.css";

// auth pages
import SignUpPage from "./pages/signup.page";
import SignInPage from "./pages/signin.page";
import OTPPage from "./pages/OTP.page";
import ForgotPassword from "./pages/Forgotpassword";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// main pages
import HomePage from "./pages/home.page";
import GradeSubjectPage from "./pages/Grade.Subject.page";

// paper module
import PaperLayout from "./layout/PaperLayout";
import PapersPage from "./pages/papers.page";
import ViewPaperPage from "./pages/ViewPaperPage";
import QuestionPage from "./pages/Quesion.page";

// teacher module
import TeacherLayout from "./layout/TeacherLayout";
import TeacherPage from "./pages/Teacher.page";
import ViewTeacherPage from "./pages/ViewTeacher.page";
import PermissonTeachers from "./pages/PermissionTeachers";

// ✅ student module
import StudentLayout from "./layout/StudentLayout";
import StudentsPage from "./pages/students.page";
import PermissionStudents from "./pages/PermissionStudents";

// lms module
import LMSLayout from "./layout/LMSLayout";
import LMSPage from "./pages/lms.page";
import ClassPage from "./pages/class.page";
import LivePage from "./pages/Live.page";

// route guards
import AdminRoute from "./compoments/AdminRoute";
import ProtectedRoute from "./compoments/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* =========================
              AUTH ROUTES
          ========================== */}
          <Route path="/" element={<SignUpPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* =========================
              HOME
          ========================== */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              GRADE-SUBJECT
          ========================== */}
          <Route
            path="/grade-subject"
            element={
              <ProtectedRoute>
                <GradeSubjectPage />
              </ProtectedRoute>
            }
          />

          {/* =========================
              STUDENT MODULE
          ========================== */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/student/list" replace />} />
            <Route path="list" element={<StudentsPage />} />
            <Route
              path="permission"
              element={
                <AdminRoute>
                  <PermissionStudents />
                </AdminRoute>
              }
            />
          </Route>

          {/* =========================
              PAPER MODULE
              ✅ Question page: NO admin access (but still needs login)
          ========================== */}
          <Route
            path="/paper"
            element={
              <ProtectedRoute>
                <PaperLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/paper/papers" replace />} />
            <Route path="papers" element={<PapersPage />} />
            <Route path="view" element={<ViewPaperPage />} />

            {/* ✅ anyone logged-in can access */}
            <Route path="question" element={<QuestionPage />} />
          </Route>

          {/* =========================
              TEACHER MODULE
          ========================== */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute>
                <TeacherLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/teacher/list" replace />} />
            <Route path="list" element={<TeacherPage />} />
            <Route path="view" element={<ViewTeacherPage />} />
            <Route
              path="permission"
              element={
                <AdminRoute>
                  <PermissonTeachers />
                </AdminRoute>
              }
            />
          </Route>

          {/* =========================
              LMS MODULE
          ========================== */}
          <Route
            path="/lms"
            element={
              <ProtectedRoute>
                <LMSLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/lms/list" replace />} />
            <Route path="list" element={<LMSPage />} />

            <Route
              path="class"
              element={
                <AdminRoute>
                  <ClassPage />
                </AdminRoute>
              }
            />

            <Route
              path="live"
              element={
                <AdminRoute>
                  <LivePage />
                </AdminRoute>
              }
            />
          </Route>

          {/* =========================
              FALLBACK
          ========================== */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
