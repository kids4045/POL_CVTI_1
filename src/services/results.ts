// src/services/results.ts
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export type ResultPayload = {
  cvti: string; // 예: "TNGJ"
  scamType: string; // 예: "정보과신형"
  risk: number; // 0~100
};

export async function saveResult({ cvti, scamType, risk }: ResultPayload) {
  return await addDoc(collection(db, "results"), {
    cvti,
    scamType,
    risk,
    createdAt: serverTimestamp(), // Firestore 규칙에서 필수
  });
}
