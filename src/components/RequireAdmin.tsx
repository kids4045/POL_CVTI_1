import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../auth";
import { db } from "../firebase";

const RequireAdmin: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const { user, loading } = useAuth();
  const [ok, setOk] = useState<boolean | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const loc = useLocation();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      setOk(false);
      return;
    } // → /admin-login으로 보냄
    getDoc(doc(db, "admins", user.uid))
      .then((s) => setOk(s.exists()))
      .catch((e: any) => {
        console.error("admin check error:", e);
        setErr(e.code || String(e));
        setOk(false);
      });
  }, [user, loading]);

  if (loading || ok === null)
    return <div style={{ padding: 24 }}>확인 중…</div>;
  if (!user)
    return <Navigate to="/admin-login" replace state={{ from: loc }} />;

  if (!ok) {
    return (
      <div style={{ padding: 24 }}>
        접근 권한이 없습니다. 관리자에게 문의하세요.
        {err && <div style={{ marginTop: 8, color: "#b91c1c" }}>({err})</div>}
      </div>
    );
  }
  return children;
};

export default RequireAdmin;
