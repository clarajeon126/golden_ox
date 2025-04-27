// /app/page.jsx
"use client"; // because we'll use hooks!

import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>🐂 Golden Ox</h1>
      <button className={styles.startButton} onClick={() => router.push("/simulation")}>
        Start Simulation
      </button>
    </div>
  );
}
