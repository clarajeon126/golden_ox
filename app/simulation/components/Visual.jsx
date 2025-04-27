// /app/simulation/components/Visual.jsx
import styles from "../styles/Visual.module.css";

export default function Visual() {
  return (
    <div className={styles.visualContainer}>
      <img src="/visual1.png" alt="Scene Visual" className={styles.visualImage} />
    </div>
  );
}
