import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';

// Adapted parser function to accept a Buffer instead of file path
async function parsePCR(buffer) {
  const pdfData = await pdfParse(buffer);
  const text = pdfData.text;

  const lines = text.split('\n').map(line => line.trim());

  const structuredData = {
    incident_number: null,
    patient: {
      name: null,
      dob: null,
      gender: null,
      race: null,
      home_address: {
        street: null,
      },
      medical_history: [],
      medications: []
    },
    vitals: [],
    treatments: [],
    transport: {
      mode_to_hospital: null,
      priority: null
    },
    narrative_summary: ""
  };

  let narrativeStarted = false;
  let narrativeLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (narrativeStarted) {
      if (line.toLowerCase().includes("prior to leaving")) {
        break; // stop collecting narrative
      }
      narrativeLines.push(line);
      continue;
    }

    if (
      line.toLowerCase().startsWith("subjective") ||
      line.toLowerCase() === "crew member" ||
      line.toLowerCase().startsWith("completing this") ||
      line.toLowerCase().startsWith("report:")
    ) {
      narrativeStarted = true;
      narrativeLines.push(line);
      continue;
    }

    if (line.includes("Incident Number")) {
      structuredData.incident_number = line.split(":")[1]?.trim();
    }

    if (line.includes("Patient Name") && line.includes("DOB")) {
      const parts = line.split("- DOB:");
      if (parts.length === 2) {
        structuredData.patient.name = parts[0].replace("Patient Name:", "").trim();
        structuredData.patient.dob = parts[1].trim();
      }
    }

    if (line.includes("Gender") && line.includes("Race")) {
      const matches = line.match(/Gender:\s*(\w+)\s*Race:\s*(\w+)/);
      if (matches) {
        structuredData.patient.gender = matches[1];
        structuredData.patient.race = matches[2];
      }
    }

    if (line.includes("Home Address:")) {
      const addrParts = line.replace("Home Address:", "").split(",");
      structuredData.patient.home_address.street = addrParts[0]?.trim() || null;
    }

    if (line.includes("Medical History:")) {
      structuredData.patient.medical_history = line.replace("Medical History:", "").split(",").map(x => x.trim());
    }

    if (line.includes("Medications:")) {
      structuredData.patient.medications = line.replace("Medications:", "").split(",").map(x => x.trim());
    }

    if (line.includes("Blood Pressure:")) {
      const bpMatch = line.match(/Blood Pressure:\s*([\d/]+)/);
      const hrMatch = line.match(/Heart Rate:\s*(\d+)/);
      const rrMatch = line.match(/Respiratory Rate:\s*(\d+)/);
      const spo2Match = line.match(/SpO2:\s*(\d+)/);

      const vitals = {};

      if (bpMatch) vitals.bp = bpMatch[1];
      if (hrMatch) vitals.hr = parseInt(hrMatch[1]);
      if (rrMatch) vitals.rr = parseInt(rrMatch[1]);
      if (spo2Match) vitals.spo2 = parseInt(spo2Match[1]);

      if (Object.keys(vitals).length > 0) {
        structuredData.vitals.push(vitals);
      }
    }

    if (line.includes("Treatment:")) {
      structuredData.treatments.push(line.replace("Treatment:", "").trim());
    }

    if (line.includes("Transport Mode")) {
      structuredData.transport.mode_to_hospital = line.split(":")[1]?.trim();
    }

    if (line.includes("Priority")) {
      structuredData.transport.priority = line.split(":")[1]?.trim();
    }
  }

  structuredData.narrative_summary = narrativeLines.join(' ').trim();

  return structuredData;
}

export async function POST(request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  try {
    const parsedData = await parsePCR(buffer);

    console.log(parsedData); //For debugging

    return NextResponse.json(parsedData, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
