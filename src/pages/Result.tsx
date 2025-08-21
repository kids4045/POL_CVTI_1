// src/pages/Result.tsx
import React, { useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";

import { scamTypeProfiles } from "../data/scamTypeProfiles";
import { scamTypeIcons } from "../data/scamTypeIcons";
import { getScamTypeFromCVTI } from "../data/cvtiToScamType";
import ResultCaptureCard from "../components/ResultCaptureCard";

// ✅ Share.tsx와 통일된 배경색
const backgroundColors = {
  감정공감형: "#fce4ec",
  절차맹신형: "#e0f7fa",
  직진반응형: "#fff3e0",
  실험과잉형: "#f3e5f5",
  신뢰우선형: "#ede7f6",
  회피수동형: "#e8f5e9",
  정보과신형: "#e0f2f1",
  선한낙관형: "#f9fbe7",
} as const;

/** 위험도 색상/라벨 헬퍼 */
function riskColor(risk: number) {
  if (risk >= 67) return "#ef4444"; // 높음
  if (risk >= 34) return "#f59e0b"; // 보통
  return "#10b981"; // 낮음
}
function riskLabel(risk: number) {
  if (risk >= 67) return "높음";
  if (risk >= 34) return "보통";
  return "낮음";
}
const clampSafe = (n: unknown, fallback = 60) => {
  const num = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(num)) return fallback;
  return Math.min(100, Math.max(0, num));
};

const Result: React.FC = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  // ✅ URL 파라미터: cvti(필수), o(선택: oAxesCount), risk(선택)
  const cvti = (params.get("cvti") || params.get("mbti") || "").toUpperCase();
  const oParam = params.get("o");
  const oAxesCount =
    oParam != null && oParam !== "" ? Number(oParam) : undefined;

  // ✅ 객체 형태 입력(권장) → 무관심형 판정 안전
  const scamType = useMemo(() => {
    if (!cvti) return "";
    return oAxesCount != null
      ? getScamTypeFromCVTI({ cvti, oAxesCount })
      : getScamTypeFromCVTI(cvti);
  }, [cvti, oAxesCount]);

  const profile = scamTypeProfiles[scamType as keyof typeof scamTypeProfiles];

  const backgroundColor =
    backgroundColors[scamType as keyof typeof backgroundColors] || "#FFF5E4";

  // ✅ 위험도: 쿼리 risk(0~100) 우선, 없으면 profile.riskLevel(0~5) × 20
  const risk = useMemo(() => {
    const fromQuery = params.get("risk");
    if (fromQuery !== null) return clampSafe(fromQuery, 60);
    const fromProfile = (profile?.riskLevel ?? 3) * 20;
    return clampSafe(fromProfile, 60);
  }, [params, profile]);

  // ✅ 슬로건: 데이터에 따옴표가 포함돼 있어도 겹치지 않도록 정리 후 화면에서만 “ ”
  const cleanSlogan = useMemo(() => {
    const raw = String(profile?.slogan ?? "");
    return raw.replace(/^[“"']+|[”"']+$/g, "");
  }, [profile?.slogan]);

  // 필수 데이터 검증
  if (!cvti || !scamType || !profile) {
    return (
      <div style={{ textAlign: "center", padding: "2rem" }}>
        <h2>⚠️ 결과를 불러올 수 없습니다.</h2>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "16px",
            padding: "12px 20px",
            fontSize: "16px",
            backgroundColor: "#FF6B6B",
            color: "#fff",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const riskTextColor = riskColor(risk);
  const riskTextLabel = riskLabel(risk);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: backgroundColor,
        padding: "clamp(20px, 5vw, 40px)",
        display: "flex",
        justifyContent: "center",
        boxSizing: "border-box",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          backgroundColor: "#fff",
          borderRadius: "20px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
          padding: "clamp(24px, 5vw, 40px)",
          maxWidth: "800px",
          width: "100%",
          textAlign: "center",
        }}
      >
        {/* ✅ 결과 캡처 카드 (prop 이름이 mbti라면 그대로 전달) */}
        <ResultCaptureCard
          mbti={cvti}
          scamType={scamType}
          shapeUrl={`${window.location.origin}/share?cvti=${encodeURIComponent(
            cvti
          )}&o=${oAxesCount ?? ""}&scamType=${encodeURIComponent(
            scamType
          )}&risk=${risk}`}
        />

        <h2
          style={{
            fontSize: "clamp(18px, 5vw, 24px)",
            marginBottom: "12px",
            marginTop: 8,
            color: "#FF6B6B",
          }}
        >
          당신의 범죄 취약 PVTI는 <strong>{cvti}</strong>!
        </h2>

        {/* 🔹 CVTI 축 의미 안내 */}
        <div
          style={{
            margin: "12px 0",
            fontSize: "14px",
            color: "#555",
            lineHeight: 1.6,
          }}
        >
          <p>
            <strong>T</strong>: Trust (신뢰 우선형) / <strong>Q</strong>:
            Question (의심 우선형)
          </p>
          <p>
            <strong>S</strong>: Sensing (감각형) / <strong>N</strong>: iNtuition
            (직관형)
          </p>
          <p>
            <strong>P</strong>: Public (정보 개방형) / <strong>G</strong>:
            Guarded (정보 방어형)
          </p>
          <p>
            <strong>J</strong>: Judging (판단형) / <strong>P</strong>:
            Perceiving (인식형)
          </p>
          <p>
            <strong>O</strong>: Unconcern (무관심형)
          </p>
        </div>

        <h3
          style={{ fontSize: "clamp(16px, 4.5vw, 20px)", marginBottom: "24px" }}
        >
          사기 성향 유형: <strong>{scamType}</strong>
        </h3>

        <h3 style={{ fontSize: "20px", marginBottom: "12px" }}>
          <span style={{ fontSize: "28px", marginRight: "8px" }}>
            {scamTypeIcons[scamType]}
          </span>
          <span style={{ verticalAlign: "middle" }}>
            {profile.title.split("–")[0]}
          </span>
        </h3>

        <p
          style={{
            color: "#444",
            lineHeight: "1.6",
            marginBottom: "20px",
            whiteSpace: "pre-line",
          }}
        >
          {profile.summary}
        </p>

        {/* 🧠 반응/취약 지점 */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "20px",
            fontSize: "clamp(14px, 4vw, 16px)",
            lineHeight: "1.6",
          }}
        >
          <h4>🧠 당신의 반응 경향</h4>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {profile.reactions.map((line, i) => (
              <li
                key={i}
                style={{ marginBottom: "8px", whiteSpace: "pre-line" }}
              >
                {line}
              </li>
            ))}
          </ul>

          <h4 style={{ marginTop: "16px" }}>🚨 취약 지점</h4>
          <ul style={{ listStyle: "none", paddingLeft: 0 }}>
            {profile.vulnerabilities.map((line, i) => (
              <li key={i} style={{ marginBottom: "8px" }}>
                {line}
              </li>
            ))}
          </ul>
        </div>

        {/* 📊 위험도: 시각화 막대 + 라벨 */}
        <section
          aria-label="위험도"
          style={{
            margin: "14px auto 18px",
            maxWidth: 680,
            padding: "12px 16px",
            borderRadius: 16,
            background: "rgba(0,0,0,0.035)",
            border: "1px solid rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 8,
            }}
          >
            <strong style={{ fontSize: 16, letterSpacing: "0.01em" }}>
              위험도
            </strong>
            <div style={{ fontSize: 14, opacity: 0.9, color: riskTextColor }}>
              {riskTextLabel} · {risk}%
            </div>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(risk)}
            aria-label="위험도 백분율"
            style={{
              height: 10,
              borderRadius: 999,
              background: "rgba(0,0,0,0.08)",
              overflow: "hidden",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,.06)",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${risk}%` }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              style={{
                height: "100%",
                background: riskTextColor,
              }}
            />
          </div>

          {/* 보조 범례(선택) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 11,
              opacity: 0.7,
              marginTop: 6,
            }}
          >
            <span>낮음</span>
            <span>보통</span>
            <span>높음</span>
          </div>
        </section>

        {/* ✅ 슬로건: 화면에서만 “ … ” 적용 (데이터의 따옴표 제거) */}
        <blockquote
          style={{
            background: "#FFF2F2",
            padding: "16px",
            borderRadius: "12px",
            fontStyle: "italic",
            color: "#E74C3C",
            fontWeight: "bold",
            whiteSpace: "pre-line",
            marginTop: 12,
          }}
        >
          {`“${cleanSlogan}”`}
        </blockquote>

        {/* 🔗 공유 페이지로 이동 (cvti + oAxesCount 동반) */}
        <button
          style={{
            marginTop: "30px",
            padding: "12px 24px",
            fontSize: "clamp(14px, 4vw, 16px)",
            backgroundColor: "#FF6B6B",
            color: "#fff",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
            transition: "0.2s",
            width: "100%",
            maxWidth: "280px",
          }}
          onClick={() =>
            navigate(
              `/share?cvti=${encodeURIComponent(cvti)}&o=${
                oAxesCount ?? ""
              }&scamType=${encodeURIComponent(scamType)}&risk=${risk}`
            )
          }
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = "#e74c3c";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = "#FF6B6B";
          }}
        >
          🔗 결과 공유하러 가기
        </button>

        {/* ✅ 캠페인 문구 + 로고 */}
        <div
  style={{
    textAlign: "center",
    marginTop: "40px",
    fontSize: "14px",
    color: "#444",
    opacity: 0.9,
  }}
>
  <img
    src="/assets/police-logo.png"
    alt="경남경찰청 로고"
    style={{ height: "40px", marginBottom: "6px" }}
  />
  <div>이 캠페인은 경남경찰청과 함께합니다</div>

  {/* ⬇️ 추가 줄 */}
  <div style={{ marginTop: 6, fontSize: "10px", opacity: 0.8 }}>
    [무단 복제, 변경, 배포는 법적 제재를 받을 수 있습니다.]
  </div>
</div>
      </motion.div>
    </div>
  );
};

export default Result;
