"use client"; // ✅ because we are using hooks

import { useRouter } from "next/navigation";
import styles from "../styles/NavigationArrows.module.css";

export default function NavigationArrows() {
  const router = useRouter();

  function handleBack() {
    router.push("/start"); // 🚀 Go back to Start Page
  }

  return (
    <div className={styles.navArrows}>
      <button className={styles.arrow} onClick={handleBack}>
        back to home
      </button>
    </div>
  );
}
