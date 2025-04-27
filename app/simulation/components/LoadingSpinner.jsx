// /app/simulation/components/LoadingSpinner.jsx
"use client";

import styles from "../styles/LoadingSpinner.module.css";

export default function LoadingSpinner() {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}>🐂</div>
      <p>Thinking hard...</p>
    </div>
  );
}
