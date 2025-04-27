// /app/finished/page.jsx
"use client";

import { useRouter } from "next/navigation";
import styles from "../page.module.css"; // reuse Title page styles!

export default function FinishedPage() {
  const router = useRouter();

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>🎉 Congratulations! 🎉</h1>
      <button className={styles.startButton} onClick={() => router.push("/")}>
        Restart
      </button>
    </div>
  );
}
