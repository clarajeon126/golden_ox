// /components/NavigationArrows.jsx
import styles from "../styles/NavigationArrows.module.css";

export default function NavigationArrows() {
  return (
    <div className={styles.navArrows}>
      <button className={styles.arrow}>⬅️</button>
      <button className={styles.arrow}>➡️</button>
    </div>
  );
}
