// src/pages/StartPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BG_SRC = `${process.env.PUBLIC_URL}/assets/test-background.png`; // ✅ public 자산 참조

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
    link.setAttribute("fetchpriority", "high");
    document.head.appendChild(link);
    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
    };
  }, []);

  return (
    <div
      className="start-root"
      style={{
        // ✅ 뷰포트에 딱 붙여 좌/상단 검은 테두리 제거
        position: "fixed",
        inset: 0,
        overflowY: "auto",
        overflowX: "hidden",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0b0b0b",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {/* ✅ 이 컴포넌트 전용 보정 CSS */}
      <style>{`
        /* 전역 최소 리셋: iOS Safari 기본 여백 방지 */
        html, body, #root { width: 100%; height: 100%; }
        body { margin: 0; -webkit-text-size-adjust: 100%; text-size-adjust: 100%; }

        :root { --safe-top: env(safe-area-inset-top); --safe-bottom: env(safe-area-inset-bottom); }

        /* 100dvh 지원 시(모바일 주소창 높이 변화 대응) 높이 보정 */
        @supports (height: 100dvh) {
          .start-root { min-height: 100dvh; }
        }

        /* ===== 공통 타이포/레이아웃 ===== */
        .home-hero { text-align: center; }
        .title-eyebrow {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,.18);
          border: 1px solid rgba(255,255,255,.28);
          letter-spacing: 0.35em;
          font-weight: 800;
          color: #fff;
          margin-bottom: 10px;
          text-shadow: 0 1px 2px rgba(0,0,0,.35);
        }
        .page-title {
          margin: 8px 0 6px;
          font-size: clamp(22px, 5.8vw, 36px);
          color: #fff;
          text-shadow: 0 2px 6px rgba(0,0,0,.35);
          font-weight: 800;
          line-height: 1.25;
        }
        .page-subtitle {
          margin: 0 0 12px;
          color: rgba(255,255,255,.95);
          font-size: clamp(14px, 3.6vw, 18px);
          line-height: 1.35;
        }
        .title-divider {
          width: 80px; height: 2px; margin: 10px auto 6px;
          background: rgba(255,255,255,.35); border-radius: 2px;
        }

        .home-callout {
          max-width: 520px;
          padding: 20px 22px;
          border-radius: 18px;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          box-shadow: 0 6px 22px rgba(0,0,0,0.28);
          text-align: center;
          margin: 8px auto 18px;
        }
        .callout-badge {
          font-size: 12px; opacity: 0.9; margin-bottom: 6px; color: #fff;
        }
        .callout-text {
          font-size: 18px; font-weight: 600; color: #fff;
        }
        .callout-text .accent { color: #ffd27d; }

        .cta-row { display: flex; justify-content: center; }
        .cta-primary {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 14px 28px; border-radius: 999px; border: none; cursor: pointer;
          background: radial-gradient(120px 60px at 50% 50%, rgba(255,255,255,0.22), rgba(255,255,255,0.08));
          color: #fff; font-weight: 700; font-size: 16px;
          min-height: 48px;
          box-shadow: 0 8px 28px rgba(0,0,0,.35), inset 0 0 0 1px rgba(255,255,255,.16);
          transition: transform .2s ease;
        }
        .cta-primary:hover { transform: translateY(-1px); }
        .cta-arrow { font-size: 18px; }

        /* ===== 상단 칩/가이드/랜덤문구: 절대배치 제거 → 정상 흐름 ===== */
        .start-header {
          position: relative;               /* 흐름 안에서 배치 */
          z-index: 2;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: calc(var(--safe-top) + 14px) 12px 10px;  /* 노치 여백 + 기본 상단 패딩 */
        }
        .start-top-chips {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 6px;
        }
        .start-guide {
          color: #fff;
          opacity: 0.95;
          font-size: 12px;
          text-shadow: 0 1px 2px rgba(0,0,0,.35);
          text-align: center;
          white-space: pre-line;
          line-height: 1.6;
          max-width: 28rem;
          margin: 0 auto;
          letter-spacing: 0.01em;
        }
        .start-participation {
          color: #fff;
          opacity: 0.95;
          font-size: 13px;
          text-shadow: 0 1px 2px rgba(0,0,0,.35);
          text-align: center;
          width: 100%;
          margin-top: 2px;
        }

        /* 메인 영역: 헤더가 흐름에 있으므로 자연스럽게 아래로 밀림 */
        .start-main {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0 16px 16px;
        }

        /* 하단 고정 푸터(노치 하단 보정 포함) */
        .start-footer {
          position: sticky;                  /* iOS에서 가려지지 않도록 */
          bottom: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          text-align: center;
          font-size: 13px;
          color: #fff;
          z-index: 3;
          padding: 10px 0 calc(var(--safe-bottom) + 10px);
          background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,.25) 60%, rgba(0,0,0,.45) 100%);
          backdrop-filter: blur(3px);
          -webkit-backdrop-filter: blur(3px);
        }

        /* === 모바일 전용 보정 === */
        @media (max-width: 480px) {
          .start-top-chips { margin-bottom: 10px; }
          .start-guide { font-size: 12px; }
          .page-title { font-size: clamp(22px, 6vw, 30px); }
          .page-subtitle { font-size: clamp(14px, 4vw, 18px); }
          /* 중앙 로고 10% 축소 */
          .pol-logo { width: 108px; height: 108px; }
          /* ‘사기 1초전’ 블럭 높이 10% 축소 */
          .home-callout { padding: 18px 20px; }
          .callout-text { font-size: 17px; }
        }
      `}</style>

      {/* 배경 레이어 */}
      <img
        src={BG_SRC}
        alt=""
        aria-hidden
        loading="eager"
        decoding="async"
        // @ts-ignore
        fetchpriority="high"
        onLoad={() => requestAnimationFrame(() => setBgLoaded(true))}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: "center",
          opacity: bgLoaded ? 1 : 0,
          filter: bgLoaded ? "none" : "blur(8px)",
          transition: "opacity 500ms ease, filter 300ms ease",
          willChange: "opacity, filter",
          zIndex: 0,
        }}
      />

      {/* 가독성 오버레이 */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.5) 100%)",
          zIndex: 1,
        }}
      />

      {/* 상단: 칩/가이드/랜덤문구 (정상 흐름) */}
      <div className="start-header">
        {/* 칩 배너 */}
        <div className="start-top-chips">
          {["#전국민 사기예방✨", "👮‍♀️경남경찰청👮‍♂️"].map((label) => (
            <span
              key={label}
              style={{
                padding: "6px 10px",
                borderRadius: 999,
                background: "rgba(255,255,255,.75)",
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
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
        <div className="start-guide">
          {
            "CVTI 테스트란? \nT/Q 신뢰·의심, S/N 감각·직관, P/G 개방·방어, J/P 판단·인식, O 무관심\n5가지 축을 바탕으로 사용자의 범죄취약유형을 예상할 수 있습니다."
          }
        </div>

        {/* 참여 안내 (랜덤 문구) */}
        <div className="start-participation">{participationText}</div>
      </div>

      {/* 메인 콘텐츠 (헤더 아래로 자연스럽게 배치) */}
      <motion.div
        className="start-main"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <header className="home-hero" aria-label="CVTI test title">
          <span className="title-eyebrow">GNPOL</span>
          <h1 className="page-title">피싱 유형 CVTI 테스트</h1>
          <p className="page-subtitle">지금 당신의 CVTI는 얼마나 안전한가요?</p>
          <div className="title-divider" />
        </header>

        {/* 로고 (모바일에서 10% 축소) */}
        <img
          className="pol-logo"
          src={`${process.env.PUBLIC_URL}/assets/thumbnail.png`}
          alt="경남경찰청 로고"
          loading="lazy"
          style={{
            height: "120px",
            width: "120px",
            marginBottom: "20px",
            marginTop: "16px",
          }}
        />

        {/* 콜아웃 + CTA */}
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
            onClick={() => navigate("/guide")}
            aria-label="안내 페이지로 이동"
          >
            시작하기
            <span className="cta-arrow" aria-hidden>
              ⇛
            </span>
          </button>
        </motion.div>
      </motion.div>

      {/* 하단 로고 및 문구 */}
      <div className="start-footer">
        <img
          src={`${process.env.PUBLIC_URL}/assets/police-logo.png`}
          alt="경남경찰청 로고"
          loading="lazy"
          style={{ height: "24px" }}
        />
        <div>이 캠페인은 경남경찰청과 함께합니다</div>
      </div>
    </div>
  );
}
