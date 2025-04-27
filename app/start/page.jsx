"use client";

import { useSimulation } from "../simulation/context/SimulationContext";
import StartButton from "./components/StartButton";
import { useState } from "react";
import { createSteps } from "../simulation/helpers/steps";
import LoadingSpinner from "../simulation/components/LoadingSpinner";
export default function StartPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const {setGeneratedSteps, setCurrentPrompt, setPath, setHint} = useSimulation();
  async function updateSimulationWithPDF(){
    try {
      const res = await fetch("../../../parsed_pcr.json", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Failed to load parsed_pcr.json");
      }
      const parsedPCR = await res.json();
      if (parsedPCR.initial_prompt) {
        const generatedSteps = createSteps({
              isMedical: parsedPCR.isMedical,
              isConscious: parsedPCR.isConscious,
              noBreathing: parsedPCR.noBreathing,
              yesCPR: parsedPCR.yesCPR,
              priority: parsedPCR.priority,
              medications: parsedPCR.medications,
              traumaType: parsedPCR.traumaType,
              patientWeightKg: parsedPCR.patientWeightKg,
              age: parsedPCR.age,
              isPregnant: parsedPCR.isPregnant,
              });
        console.log("Generated Steps:", generatedSteps);
        setGeneratedSteps(generatedSteps);
        setCurrentPrompt(parsedPCR.initial_prompt);
        setHint("");
        setPath({
          outer_id: 0,
          completed_inner_set: [],
        });
        return 1;
      }
    } catch (error) {
      console.error("[StartPage] Failed to fetch parsed_pcr.json:", error);
    }
  }
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
      const response = await updateSimulationWithPDF();
      setLoading(false);
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
      setLoading(true);
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
  }return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <img src="/logo.png" alt="Golden Ox" style={{ width: "200px", height: "200px", marginBottom: "2rem" }} />
      <h1 style={{ fontSize: "3rem" }}>Golden Ox</h1>
      
      <p style={{ fontSize: "1.5rem", marginBottom: "2rem" }}>
        {(uploadStatus === "✅ PDF uploaded and parsed successfully!") ? "Thank you for uploading the PCR. Start the simulation training!":"Steadfast Training for Life’s Critical Moments"}
      </p>
  
      {/* ✅ Only show loading OR StartButton */}
      {loading ? (
        <LoadingSpinner />
      ) : (
        uploadStatus === "✅ PDF uploaded and parsed successfully!" && (
          <StartButton />
        )
      )}
  
      {/* ✅ Upload Box: Only show if not loading */}
      {(!loading && uploadStatus != "✅ PDF uploaded and parsed successfully!") && (
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
      )}
    </main>
  );
  
  
}
