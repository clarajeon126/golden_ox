// /components/Hint.jsx
import { useSimulation } from "../context/SimulationContext";
import styles from "../styles/PromptBox.module.css";

export default function Hint() {
  const { hint } = useSimulation();

  return (
    <div className={styles.hint}>
      Hint: {hint}
    </div>
  );
}
