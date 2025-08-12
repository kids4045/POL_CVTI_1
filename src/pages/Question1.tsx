// /src/pages/Question.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../data/questions";
import { calculateCVTI, CVTIImpact } from "../utils/calculateCVTI";
import { motion, AnimatePresence } from "framer-motion";

type ChoiceLike = {
  text?: string;
  label?: string;
  cvtiImpact?: CVTIImpact;
  impact?: CVTIImpact;
  mbtiImpact?: CVTIImpact; // 과거 호환
};

// 홈과 동일 이미지 경로 사용
const QUESTION_BG = "/assets/test-background.png";

const clean = (s?: string) => (s ?? "").replace(/^🤔\s*/, "");

const Question: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<CVTIImpact[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  const q: any = questions[current];
  const total = questions.length;
  const progress = ((current + 1) / total) * 100;
  const qno = String(current + 1).padStart(2, "0");

  const handleChoice = (choice: ChoiceLike, idx: number) => {
    if (isLocked) return;
    setSelectedIdx(idx);
    setIsLocked(true);

    const impact =
      choice?.cvtiImpact ?? choice?.impact ?? choice?.mbtiImpact ?? undefined;

    const updated = impact ? [...answers, impact] : [...answers];
    const isLast = current + 1 >= total;

    // 180ms 하이라이트 후 진행
    setTimeout(() => {
      if (!isLast) {
        setAnswers(updated);
        setCurrent((prev) => prev + 1);
        setSelectedIdx(null);
        setIsLocked(false);
      } else {
        setIsEnding(true);
        const { cvti } = calculateCVTI(updated);
        navigate(`/result?cvti=${encodeURIComponent(cvti)}`);
      }
    }, 180);
  };

  return (
    <div
      style={{
        minHeight: "100svh",
        position: "relative",
        zIndex: 1, // ✅ 콘텐츠를 배경 위로
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* ✅ 전체 화면 고정 배경 (좌우 검은 여백 방지) */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0, // ❗ -1 금지
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url("${QUESTION_BG}")`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <AnimatePresence mode="wait">
        {!isEnding && (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            style={{ width: "100%", maxWidth: 880 }}
          >
            {/* 진행률 바 */}
            <div
              style={{
                height: 8,
                width: "100%",
                backgroundColor: "rgba(255,255,255,0.12)",
                borderRadius: 999,
                overflow: "hidden",
                marginBottom: 16,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
              }}
              aria-label="진행률"
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, rgba(96,165,250,.95), rgba(34,211,238,.95))",
                  transition: "width .3s ease",
                }}
              />
            </div>

            {/* 문제 패널: 글라스 + 네온, 줄바꿈 pre-line */}
            <motion.section
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "relative",
                padding: "24px clamp(16px,3.6vw,32px)",
                borderRadius: 20,
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.10))",
                border: "1px solid rgba(255,255,255,0.32)",
                boxShadow:
                  "inset 0 0 0 1px rgba(255,255,255,0.10), 0 14px 32px rgba(0,0,0,0.28), 0 0 14px var(--neon-outer), 0 0 36px var(--neon-outer)",
                backdropFilter: "blur(10px) saturate(160%)",
                WebkitBackdropFilter: "blur(10px) saturate(160%)",
                marginBottom: "clamp(16px, 3.2vw, 24px)",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  letterSpacing: "0.06em",
                  color: "rgba(255,255,255,0.92)",
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.26)",
                  marginBottom: 10,
                }}
              >
                Q {qno} / {total}
              </div>

              <h2
                style={{
                  fontSize: "clamp(18px, 4.4vw, 28px)",
                  fontWeight: 900,
                  lineHeight: 1.55,
                  letterSpacing: "-0.01em",
                  color: "#fff",
                  textShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  whiteSpace: "pre-line", // ✅ 줄바꿈 유지
                  textAlign: "left",
                }}
              >
                {clean(q?.situation ?? q?.text ?? q?.question)}
              </h2>
            </motion.section>

            {/* 선택지: 중앙 세로 배열, 화살표 제거 */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 12,
                width: "100%",
              }}
            >
              {(q?.choices as ChoiceLike[]).map((choice, idx) => {
                const label = clean(choice?.text ?? choice?.label ?? "");
                const selected = selectedIdx === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChoice(choice, idx)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleChoice(choice, idx);
                      }
                    }}
                    aria-pressed={selected}
                    style={{
                      width: "100%",
                      maxWidth: 640,
                      textAlign: "left",
                      border: selected
                        ? "1px solid rgba(255,255,255,0.45)"
                        : "1px solid rgba(255,255,255,0.26)",
                      borderRadius: 16,
                      padding: "16px 18px",
                      background: selected
                        ? "rgba(255,255,255,0.14)"
                        : "rgba(255,255,255,0.10)",
                      color: "#fff",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      boxShadow: selected
                        ? "0 16px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.28), 0 0 12px var(--neon-inner), 0 0 30px var(--neon-inner)"
                        : "0 10px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.22)",
                      backdropFilter: "blur(8px) saturate(150%)",
                      WebkitBackdropFilter: "blur(8px) saturate(150%)",
                      transition:
                        "transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease",
                      transform: selected ? "translateY(-1px)" : "none",
                      whiteSpace: "pre-line", // ✅ 선택지 줄바꿈
                    }}
                  >
                    <span
                      style={{
                        fontWeight: 800,
                        fontSize: "clamp(15px, 2.8vw, 18px)",
                        lineHeight: 1.55,
                        letterSpacing: "-0.01em",
                        textShadow: "0 1px 2px rgba(0,0,0,0.35)",
                      }}
                    >
                      {label}
                    </span>
                    {/* 요청: 화살표 제거 */}
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {isEnding && (
        <motion.div
          key="ending"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{ color: "#fff", marginTop: 20, opacity: 0.9 }}
        >
          결과 계산 중…
        </motion.div>
      )}
    </div>
  );
};

export default Question;
