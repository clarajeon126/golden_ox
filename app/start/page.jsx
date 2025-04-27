"use client";

import StartButton from "./components/StartButton";
import { useState } from "react";

export default function StartPage() {
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
      console.log(data); // you can save this to global state if needed
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
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <img src="/logo.png" alt="Golden Ox" style={{ width: "200px", height: "200px", marginBottom: "2rem" }} />
      <h1 style={{ fontSize: "3rem" }}>Golden Ox</h1>
      <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        Steadfast Training for Life’s Critical Moments
      </p>
  
      {/* ✅ Only show StartButton if upload success */}
      {uploadStatus === "✅ PDF uploaded and parsed successfully!" && (
        <StartButton />
      )}
  
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
          width: "300px"
        }}
      >
        <p>📄 Drag and drop your PCR PDF here</p>
        <p style={{ fontSize: "0.9rem", color: "gray" }}>(Only PDFs supported)</p>
        {uploadStatus && <p style={{ marginTop: "10px" }}>{uploadStatus}</p>}
      </div>
    </main>
  );
  
}
