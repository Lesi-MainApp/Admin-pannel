// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { store } from "./api/Store";
import "./index.css";

import SignUpPage from "./pages/signup.page";
import SignInPage from "./pages/signin.page";
import OTPPage from "./pages/OTP.page";
import ForgotPassword from "./pages/Forgotpassword";
import HomePage from "./pages/home.page";

import PaperLayout from "./layout/PaperLayout";
import PapersPage from "./pages/papers.page";
import ViewPaperPage from "./pages/ViewPaperPage";

import TeacherLayout from "./layout/TeacherLayout";
import TeacherPage from "./pages/Teacher.page";
import ViewTeacherPage from "./pages/ViewTeacher.page";
import PermissonTeachers from "./pages/PermissionTeachers";

import StudentsPage from "./pages/Students.page";
import GradeSubjectPage from "./pages/Grade.Subject.page";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import LMSLayout from "./layout/LMSLayout";
import ClassPage from "./pages/class.page";
import LMSPage from "./pages/lms.page";
import LivePage from "./pages/Live.page";

import AdminRoute from "./compoments/AdminRoute";
import ProtectedRoute from "./compoments/ProtectedRoute";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* auth */}
          <Route path="/" element={<SignUpPage />} />
          <Route path="/otp" element={<OTPPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/forgotpassword" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* home */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* grade-subject */}
          <Route
            path="/grade-subject"
            element={
              <ProtectedRoute>
                <GradeSubjectPage />
              </ProtectedRoute>
            }
          />

          {/* student */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentsPage />
              </ProtectedRoute>
            }
          />

          {/* paper */}
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
          </Route>

          {/* teacher */}
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

          {/* ✅ LMS (Protected) */}
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

            {/* ✅ Admin-only Class */}
            <Route
              path="class"
              element={
                <AdminRoute>
                  <ClassPage />
                </AdminRoute>
              }
            />

            {/* ✅ Admin-only Live (FIXED: inside /lms) */}
            <Route
              path="live"
              element={
                <AdminRoute>
                  <LivePage />
                </AdminRoute>
              }
            />
          </Route>

          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
