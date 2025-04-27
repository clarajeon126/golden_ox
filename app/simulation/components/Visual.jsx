// /components/Visual.jsx
import { useSimulation } from "../context/SimulationContext";
import styles from "../styles/Visual.module.css";

export default function Visual() {
  const { visual } = useSimulation();

  return (
    <div className={styles.visualContainer}>
      <img src={`/${visual}`} alt="Visual" className={styles.visualImage} />
    </div>
  );
}
