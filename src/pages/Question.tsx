// /src/pages/Question.tsx
import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { questions } from "../data/questions";
import { calculateCVTI, CVTIImpact } from "../utils/calculateCVTI";
import { motion, AnimatePresence } from "framer-motion";

type ChoiceLike = {
  text?: string;
  label?: string;
  cvtiImpact?: CVTIImpact;
  impact?: CVTIImpact;
  mbtiImpact?: CVTIImpact;
};

// ✅ public/assets 를 PUBLIC_URL로 안전하게 참조
const QUESTION_BG = `${process.env.PUBLIC_URL}/assets/test-background.png`;
const clean = (s?: string) => (s ?? "").replace(/^🤔\s*/, "");

const Question: React.FC = () => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<CVTIImpact[]>([]);
  const [isEnding, setIsEnding] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const navigate = useNavigate();

  const total = questions.length;
  const q = questions[current] as any;
  const progress = useMemo(
    () => ((current + 1) / total) * 100,
    [current, total]
  );
  const qno = useMemo(() => String(current + 1).padStart(2, "0"), [current]);

  // ▶ 다음(선택 시 자동 진행)
  const handleChoice = (choice: ChoiceLike, idx: number) => {
    if (isLocked || isEnding) return;
    setSelectedIdx(idx);
    setIsLocked(true);

    const impact =
      choice?.cvtiImpact ?? choice?.impact ?? choice?.mbtiImpact ?? undefined;
    const updated = impact ? [...answers, impact] : [...answers];
    const isLast = current + 1 >= total;

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

  // ◀ 이전(좌측 하단 버튼 + 키보드 ←)
  const canGoPrev = current > 0 && !isEnding;
  const handlePrev = useCallback(() => {
    if (!canGoPrev) return;
    // 마지막에 추가된 답변 제거하고 이전 문항으로 이동
    setAnswers((prev) => (prev.length ? prev.slice(0, -1) : prev));
    setCurrent((prev) => Math.max(0, prev - 1));
    setSelectedIdx(null);
    setIsLocked(false);
  }, [canGoPrev]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft") return;
      // 입력 포커스 시 방해 금지
      const t = document.activeElement as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA"].includes(t.tagName)) return;
      handlePrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handlePrev]);

  return (
    <div
      className="q-root"
      style={{
        minHeight: "100svh",
        position: "relative",
        zIndex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px 20px",
        boxSizing: "border-box",
      }}
    >
      {/* ✅ 이 화면 전용 보정 CSS */}
      <style>{`
        /* 뱃지를 확실히 가운데로 */
        .q-badge-wrap {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
          width: 100% !important;
        }
        .q-badge {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          letter-spacing: 0.06em;
          color: rgba(255,255,255,0.92);
          background: rgba(255,255,255,0.14);
          border: 1px solid rgba(255,255,255,0.26);
          margin: 0 0 10px; /* 좌우는 래퍼가 센터링 */
          width: fit-content;
        }

        /* 질문 패널 */
        .q-panel {
          position: relative;
          padding: 24px clamp(4px, 0.9vw, 8px);
          border-radius: 20px;
          background: linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.10));
          border: 1px solid rgba(255,255,255,0.32);
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.10),
            0 14px 32px rgba(0,0,0,0.28),
            0 0 14px var(--neon-outer),
            0 0 36px var(--neon-outer);
          backdrop-filter: blur(10px) saturate(160%);
          -webkit-backdrop-filter: blur(10px) saturate(160%);
          margin-bottom: clamp(16px, 3.2vw, 24px);
        }

        /* 모바일: 질문 블럭 상하 여백 축소 */
        @media (max-width: 480px) {
          .q-panel { padding: 18px 12px !important; margin-bottom: 16px !important; }
        }
      `}</style>

      {/* 배경 */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          backgroundImage: `linear-gradient(rgba(0,0,0,.55), rgba(0,0,0,.55)), url(${QUESTION_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* 진행률 바 */}
      <div
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          position: "fixed",
          top: "max(0px, env(safe-area-inset-top))",
          left: 0,
          right: 0,
          height: 8,
          zIndex: 10000,
          backgroundColor: "rgba(255,255,255,0.12)",
          borderRadius: 999,
          overflow: "hidden",
          boxShadow: "inset 0 0 0 1px rgba(255,255,255,.08)",
        }}
      >
        <motion.div
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          style={{
            height: "100%",
            background:
              "linear-gradient(90deg, rgba(96,165,250,.95), rgba(34,211,238,.95))",
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {!isEnding && (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.35 }}
            style={{ width: "100%", maxWidth: 880, marginTop: 16 }}
          >
            {/* 질문 패널 */}
            <motion.section
              className="q-panel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* 문항 번호 배지 - 확정 중앙 */}
              <div className="q-badge-wrap">
                <div className="q-badge">
                  Q {qno} / {total}
                </div>
              </div>

              <h2
                style={{
                  fontSize: "clamp(18px, 4.4vw, 28px)",
                  fontWeight: 900,
                  lineHeight: 1.55,
                  letterSpacing: "-0.01em",
                  color: "#fff",
                  textShadow: "0 2px 6px rgba(0,0,0,0.4)",
                  whiteSpace: "pre-line",
                  textAlign: "center",
                  maxWidth: "40rem",
                  margin: "0 auto",
                  padding: "0 0.25rem",
                }}
              >
                {clean(q?.situation ?? q?.text ?? q?.question)}
              </h2>
            </motion.section>

            {/* 선택지 */}
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
                const disabled = isLocked && !selected;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleChoice(choice, idx)}
                    disabled={disabled}
                    style={{
                      display: "inline-flex",
                      justifyContent: "center",
                      border: selected
                        ? "1px solid rgba(255,255,255,0.45)"
                        : "1px solid rgba(255,255,255,0.26)",
                      borderRadius: 16,
                      padding: "12px 18px",
                      background: selected
                        ? "rgba(255,255,255,0.14)"
                        : "rgba(255,255,255,0.10)",
                      color: "#fff",
                      cursor: "pointer",
                      boxShadow: selected
                        ? "0 16px 36px rgba(0,0,0,0.30), inset 0 1px 0 rgba(255,255,255,0.28)"
                        : "0 10px 24px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.22)",
                      backdropFilter: "blur(8px) saturate(150%)",
                      WebkitBackdropFilter: "blur(8px) saturate(150%)",
                      transition:
                        "transform .16s ease, box-shadow .16s ease, border-color .16s ease, background .16s ease",
                      transform: selected ? "translateY(-1px)" : "none",
                      whiteSpace: "pre-line",
                      width: "auto",
                      maxWidth: "90%",
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

      {/* ◀ 이전 문항 고정 버튼 (좌측 하단) */}
      {!isEnding && (
        <motion.button
          type="button"
          className="q-prev-fab"
          onClick={handlePrev}
          disabled={!canGoPrev}
          aria-label="이전 문항으로 이동"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          /* ▼ CSS가 없어도 보이도록 강제 고정 위치(폴백) */
          style={{
            position: "fixed",
            left: 12,
            bottom: 12,
            zIndex: 10000,
          }}
        >
          ◀ 이전
        </motion.button>
      )}
    </div>
  );
};

export default Question;
