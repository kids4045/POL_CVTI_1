// /src/App.tsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Question from "./pages/Question";
import Result from "./pages/Result";
import Share from "./pages/Share";
import Stats from "./pages/Stats";
import { AuthProvider } from "./auth";
import RequireAuth from "./components/RequireAuth";
import AdminLogin from "./pages/AdminLogin";
import RequireAdmin from "./components/RequireAdmin";

export default function App() {
  return (
    // ✅ 전역 인증 컨텍스트 제공
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/question" element={<Question />} />
        <Route path="/result" element={<Result />} />
        <Route path="/share" element={<Share />} />

        {/* ✅ 관리자 로그인 페이지 */}
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* ✅ /stats 보호: 로그인(및 Firestore 규칙상 관리자)만 접근 */}
        <Route
          path="/stats"
          element={
            <RequireAdmin>
              <Stats />
            </RequireAdmin>
          }
        />

        {/* 기타 경로는 홈으로 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
