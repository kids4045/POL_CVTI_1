// src/services/results.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { ScamTypeKey } from "../data/cvtiToScamType";

export type ResultPayload = {
  cvti: string;
  scamType: ScamTypeKey | string;
  risk: number; // 0~100
  oAxesCount?: number | null; // ✅ 추가 (없으면 null 저장)
};

// ✅ /share 페이지에서만 저장되도록 게이트
const SAVE_ONLY_ON_PATH = "/share";

export async function saveResult({
  cvti,
  scamType,
  risk,
  oAxesCount, // ✅ 받아오고
}: ResultPayload): Promise<void> {
  const isBrowser = typeof window !== "undefined";
  const onShare =
    isBrowser &&
    window.location &&
    window.location.pathname.startsWith(SAVE_ONLY_ON_PATH);

  if (!onShare) {
    if (isBrowser) console.warn("[saveResult] skipped: not on /share");
    return;
  }

  await addDoc(collection(db, "results"), {
    cvti,
    scamType,
    risk,
    oAxesCount: oAxesCount ?? null, // ✅ 함께 저장
    createdAt: serverTimestamp(),
  });
}
