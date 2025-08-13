// src/pages/StartPage.tsx

import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BG_SRC = "../assets/test-background.png"; // 현재 보유한 단일 배경 파일

export default function StartPage() {
  const navigate = useNavigate();

  // 오늘 참여 수 (가벼운 랜덤)
  const todayCount = useMemo(() => 200 + Math.floor(Math.random() * 800), []);

  // 참여 문구 랜덤 (페이지 로드시 1회)
  const participationText = useMemo(() => {
    const templates = [
      () => `사기 예방에 동참하고, 친구에게도 알려보세요!`,
      () => `CVTI 테스트 캠페인은 여러분과 함께합니다❤`,
      () => `안전 점검 참여하고, 경품 응모에도 참여해보세요!`,
      () => `당신은 어떤 범죄에 취약할까요?`,
    ];
    const pick = templates[Math.floor(Math.random() * templates.length)];
    return pick();
  }, [todayCount]);

  // 배경 로딩 상태
  const [bgLoaded, setBgLoaded] = useState(false);

  // JS로도 프리로드(초기 렌더 직후 요청 우선순위 확보)
  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = BG_SRC;
    link.setAttribute("fetchpriority", "high"); // 타입 안전

    document.head.appendChild(link);

    return () => {
      if (link.parentNode) {
        link.parentNode.removeChild(link); // ✅ 아무 값도 반환하지 않음
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#0b0b0b", // 초기 톤 맞춤
      }}
    >
      {/* 배경 레이어: PNG 하나로 onLoad 이후 페이드 인 */}
      <img
        src={BG_SRC}
        alt=""
        aria-hidden
        loading="eager"
        decoding="async"
        // @ts-ignore
        fetchpriority="high"
        onLoad={() => {
          // 첫 페인트 시 블러+투명 → 로드 완료 후 부드럽게 표시
          requestAnimationFrame(() => setBgLoaded(true));
        }}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          // 로드 전: 살짝 블러/어두운 오버레이 느낌, 로드 후: 선명하게
          opacity: bgLoaded ? 1 : 0,
          filter: bgLoaded ? "none" : "blur(8px)",
          transition: "opacity 500ms ease, filter 300ms ease",
          willChange: "opacity, filter",
          zIndex: 0,
        }}
      />

      {/* 가독성 향상을 위한 어두운 오버레이 */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.5) 100%)",
          zIndex: 1,
        }}
      />

      {/* 상단 고정 헤더(혜택 칩 + 미니 가이드 + 참여 문구) */}
      <div
        style={{
          position: "absolute",
          top: 18,
          left: 0,
          right: 0,
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
        }}
      >
        {/* 칩 배너 */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["#전국민 사기예방✨", "👮‍♀️경남경찰청👮‍♂️"].map((label) => (
            <span
              key={label}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,.75)",
                backdropFilter: "blur(4px)",
                fontSize: 12,
                color: "#111827",
                boxShadow: "0 2px 6px rgba(0,0,0,.08)",
              }}
            >
              {label}
            </span>
          ))}
        </div>

        {/* CVTI 축 미니 가이드 */}
        <div
          style={{
            color: "#fff",
            opacity: 0.95,
            fontSize: 12,
            textShadow: "0 1px 2px rgba(0,0,0,.35)",
            textAlign: "center",
            whiteSpace: "pre-line",
            // ✅ 추가: 가독성 향상
            lineHeight: 1.6,
            maxWidth: "28rem",
            margin: "0 auto",
            letterSpacing: "0.01em",
          }}
        >
          {
            "CVTI 테스트란? \nT/Q 신뢰·의심, S/N 감각·직관, P/G 개방·방어, J/P 판단·인식, O 무관심\n5가지 축을 바탕으로 사용자의 범죄취약유형을 예상할 수 있습니다."
          }
        </div>

        {/* 참여 안내: 중앙 정렬 + 랜덤 문구 */}
        <div
          style={{
            color: "#fff",
            opacity: 0.95,
            fontSize: 13,
            textShadow: "0 1px 2px rgba(0,0,0,.35)",
            textAlign: "center",
            width: "100%",
            marginTop: 2,
          }}
        >
          {participationText}
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 16px",
        }}
      >
        <header className="home-hero" aria-label="CVTI test title">
          <span className="title-eyebrow">GNPOL</span>
          <h1 className="page-title">사기 유형 CVTI 테스트</h1>
          <p className="page-subtitle">지금 당신의 CVTI는 얼마나 안전한가요?</p>
          <div className="title-divider" />
        </header>

        {/* 로고 */}
        <img
          src="/assets/thumbnail.png"
          alt="경남경찰청 로고"
          loading="lazy"
          style={{
            height: "120px",
            width: "120px",
            marginBottom: "20px",
            marginTop: "16px",
          }}
        />

        {/* 👇 제목 아래 콜아웃 + CTA */}
        <motion.section
          className="home-callout"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          aria-label="사기1초전 콜아웃"
        >
          <div className="callout-badge">#사기1초전</div>
          <p className="callout-text">
            나도 혹시 <span className="accent">사기 1초 전</span>…?
          </p>
        </motion.section>

        <motion.div
          className="cta-row"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
        >
          <button
            className="cta-primary"
            onClick={() => navigate("/question")}
            aria-label="테스트 시작하기"
          >
            시작하기
            <span className="cta-arrow" aria-hidden>
              ⇛
            </span>
          </button>
        </motion.div>
      </motion.div>

      {/* 하단 로고 및 문구 */}
      <div
        style={{
          position: "absolute",
          bottom: "14px",
          textAlign: "center",
          fontSize: "13px",
          color: "#fff",
          zIndex: 3,
        }}
      >
        <img
          src="/assets/police-logo.png"
          alt="경남경찰청 로고"
          loading="lazy"
          style={{ height: "24px", marginBottom: "4px" }}
        />
        <div>이 캠페인은 경남경찰청과 함께합니다</div>
      </div>
    </div>
  );
}
