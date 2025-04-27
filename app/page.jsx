"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./page.module.css";

export default function Home() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");

  async function handleFileUpload(file) {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data = await res.json();
      console.log(data); // you can store this to global state if needed
      setUploadStatus("✅ PDF uploaded and parsed successfully!");
    } else {
      setUploadStatus("❌ Failed to upload PDF.");
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleFileUpload(file);
    } else {
      setUploadStatus("❌ Please upload a valid PDF file.");
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    setDragActive(true);
  }

  function handleDragLeave() {
    setDragActive(false);
  }

  return (
    <div className={styles.homeContainer}>
      <h1 className={styles.title}>🐂 Golden Ox</h1>

      <button
        className={styles.startButton}
        onClick={() => router.push("/simulation")}
      >
        Start Simulation
      </button>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          marginTop: "40px",
          padding: "40px",
          border: "2px dashed #888",
          backgroundColor: dragActive ? "#f0f0f0" : "#fff",
          borderRadius: "10px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <p>📄 Drag and drop your PCR PDF here</p>
        <p style={{ fontSize: "0.9rem", color: "gray" }}>(Only PDFs supported)</p>
        {uploadStatus && <p style={{ marginTop: "10px" }}>{uploadStatus}</p>}
      </div>
    </div>
  );
}
