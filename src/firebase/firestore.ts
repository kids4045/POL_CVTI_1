// /src/firebase/firestore.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

function must(name: string, v: string | undefined) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

const firebaseConfig = {
  apiKey: must(
    "AIzaSyBE4D8zLNNRLgW307Lqz3Bd_kPlpVZzz60",
    process.env.REACT_APP_FIREBASE_API_KEY
  ),
  authDomain: must(
    "mbti-scam-test.firebaseapp.com",
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN
  ),
  projectId: must("mbti-scam-test", process.env.REACT_APP_FIREBASE_PROJECT_ID),
  storageBucket: must(
    "mbti-scam-test.firebasestorage.app",
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET
  ), // 선택 값일 수 있음
  messagingSenderId: must(
    "127321747324",
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  ),
  appId: must(
    "1:127321747324:web:b33ff2947d1eb5d64cbef9",
    process.env.REACT_APP_FIREBASE_APP_ID
  ),
  measurementId: must(
    "G-8CV382395G",
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  ), // Analytics 옵션
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
