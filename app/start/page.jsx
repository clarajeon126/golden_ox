// /app/start/page.jsx

import StartButton from "./components/StartButton";

export default function StartPage() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <img src="/logo.png" alt="Golden Ox" style={{ width: "200px", height: "200px", marginBottom: "2rem" }} />
      <h1 style={{ fontSize: "3rem"}}>Golden Ox</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>Steadfast Training for Life’s Critical Moments</p>

      <StartButton />
    </main>
  );
}
