// src/services/results.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export type ResultPayload = {
  cvti: string;
  scamType: string;
  risk: number;
};

// ✅ /share 페이지에서만 저장되도록 게이트
const SAVE_ONLY_ON_PATH = "/share";

export async function saveResult({
  cvti,
  scamType,
  risk,
}: ResultPayload): Promise<void> {
  const isBrowser = typeof window !== "undefined";
  const onShare =
    isBrowser &&
    window.location &&
    window.location.pathname.startsWith(SAVE_ONLY_ON_PATH);

  if (!onShare) {
    // 다른 페이지(예: /result)에서는 저장 스킵
    if (isBrowser) console.warn("[saveResult] skipped: not on /share");
    return;
  }

  await addDoc(collection(db, "results"), {
    cvti,
    scamType,
    risk,
    createdAt: serverTimestamp(),
  });
}
