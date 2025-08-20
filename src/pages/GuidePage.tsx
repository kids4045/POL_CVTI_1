import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const BG_URL = "/assets/test-background.png";

// 홈과 동일 톤의 랜덤 출력 문구
const PHRASES = [
  "안전 점검에 참여하고, 경품 응모에도 참여해보세요!",
  "3분 투자로 피싱 면역력 체크!",
  "한 번 점검하면 가족/지인도 함께 안전해집니다.",
];

export default function GuidePage() {
  const navigate = useNavigate();
  const phrase = useMemo(
    () => PHRASES[Math.floor(Math.random() * PHRASES.length)],
    []
  );

  const handleStart = () => navigate("/question");

  return (
    <div
      role="main"
      aria-label="사기 취약 유형 테스트 안내"
      style={{
        minHeight: "100vh",
        width: "100%",
        backgroundImage: `url(${BG_URL})`,
        backgroundAttachment: "fixed",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 상단(칩 2개 + GNPOL + 랜덤 문구 + 타이틀/부제) */}
      <header className="guide-header">
        {/* 칩 2개 */}
        <motion.div
          className="chips-row"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          aria-label="캠페인 태그"
        >
          <span className="chip">#전국민 사기예방✨</span>
          <span className="chip">👮‍♂️ 경남경찰청</span>
        </motion.div>

        {/* 랜덤 문구 */}
        <motion.div
          className="brand-wrap"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.35 }}
        >
          <div className="brand-line" aria-live="polite">
            {phrase}
          </div>
        </motion.div>

        {/* 타이틀 / 서브타이틀 */}
        <motion.h1
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="guide-title"
        >
          피싱 유형 PVTI 테스트
        </motion.h1>
      </header>

      {/* 중앙 안내 패널 */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            width: "min(720px, 92%)",
            background: "rgba(0,0,0,0.55)",
            color: "#fff",
            borderRadius: 16,
            padding: "28px 22px",
            boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
            backdropFilter: "blur(2px)",
            textAlign: "center",
          }}
        >
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.35 }}
            className="guide-disclaimer"
            style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 18px 0" }}
          >
            {`[본 테스트는 '피싱사기'의 경각심을 높이기 위해 제작되었으며,
최근 알려진 피싱 유형 16가지를 바탕으로 그에 따른 대응 유형을 선택하는 방식으로 구성되었습니다.
결과 도출 및 위험도 선정 등의 항목에서 주관적 요소가 일부 포함될 수 있음을 알려드립니다.]`}
          </motion.p>

          <div style={{ marginTop: 20 }}>
            <button
              className="cvti-neon-btn"
              onClick={handleStart}
              aria-label="테스트 시작하기"
            >
              테스트 시작하기
            </button>
          </div>
        </motion.div>
      </div>

      {/* 하단 고정 문구 */}
      <footer
        aria-label="캠페인 안내"
        style={{
          width: "100%",
          textAlign: "center",
          color: "#fff",
          textShadow: "0 2px 6px rgba(0,0,0,0.5)",
          padding: "18px 10px 24px",
          fontWeight: 600,
        }}
      >
        [본 캠페인은 👮‍♀️경남경찰청👮‍♂️과 함께합니다.]
      </footer>
    </div>
  );
}
