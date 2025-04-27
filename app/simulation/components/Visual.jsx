// /components/Visual.jsx
import { useSimulation } from "../context/SimulationContext";
import styles from "../styles/Visual.module.css";

const res = await fetch("/parsed_pcr.json", { cache: "no-store" });
const scenarioData = await res.json();
const narrative_summary = scenarioData.narrative_summary;

export default function Visual() {
  const { visual } = useSimulation();

  return (
    <div className={styles.visualContainer}>
      <img src={`/${visual}`} alt="Visual" className={styles.visualImage} />
    </div>
  );
}
