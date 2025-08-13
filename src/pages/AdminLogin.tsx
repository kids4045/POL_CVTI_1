import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate, useLocation } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const loc = useLocation();
  const from = (loc.state as any)?.from?.pathname || "/stats";

  const loginEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    try {
      await signInWithEmailAndPassword(auth, email, pw);
      nav(from, { replace: true });
    } catch (e: any) {
      setErr(e.message || "로그인 실패");
    }
  };
  const loginGoogle = async () => {
    setErr(null);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
      nav(from, { replace: true });
    } catch (e: any) {
      setErr(e.message || "구글 로그인 실패");
    }
  };

  return (
    <div style={{ maxWidth: 360, margin: "40px auto", padding: 20 }}>
      <h2>관리자 로그인</h2>
      <form onSubmit={loginEmail}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="이메일"
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        />
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="비밀번호"
          type="password"
          style={{ width: "100%", padding: 10, marginTop: 10 }}
        />
        <button
          type="submit"
          style={{ width: "100%", padding: 10, marginTop: 12 }}
        >
          이메일로 로그인
        </button>
      </form>
      <button
        onClick={loginGoogle}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      >
        Google로 로그인
      </button>
      <button
        onClick={() => signOut(auth)}
        style={{ width: "100%", padding: 10, marginTop: 10 }}
      >
        로그아웃
      </button>
      {err && <div style={{ color: "crimson", marginTop: 10 }}>{err}</div>}
    </div>
  );
}
