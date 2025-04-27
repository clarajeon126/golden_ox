import { NextResponse } from 'next/server';
import pdfParse from 'pdf-parse';
import { OpenAI } from 'openai';
import fs from 'fs/promises'; // Save file after GPT parsing

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function extractTextFromPDF(buffer) {
  const pdfData = await pdfParse(buffer);
  return pdfData.text;
}

async function parseTextWithGPT(rawText) {
  const systemPrompt = `
You are an expert EMT assistant. Given messy text from a Patient Care Report (PCR), extract the data and format it into a structured JSON in this format. Importantly, only return something that 
can be put through JSON.parse() without error. My code is: 
const gptResponse = response.choices[0].message.content;
return JSON.parse(gptResponse);:

{
  "incident_number": string,
  "patient": {
    "name": string,
    "dob": string,
    "gender": string,
    "race": string,
    "home_address": { "street": string },
    "medical_history": [list of strings],
    "medications": [list of strings]
  },
  "vitals": [ { "bp": string, "hr": number, "rr": number, "spo2": number } ],
  "treatments": [list of strings],
  "transport": {
    "mode_to_hospital": string,
    "priority": string
  },
  "narrative_summary": string
}

Only include fields if information is available. If unknown, leave empty string or empty array.

Here is the raw text to parse:
${rawText}
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "system", content: systemPrompt }],
    temperature: 0.1,
  });

  const gptResponse = response.choices[0].message.content;
  console.log(gptResponse);

  return JSON.parse(gptResponse);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const rawText = await extractTextFromPDF(buffer);
    const parsedData = await parseTextWithGPT(rawText);

    await fs.writeFile('./parsed_pcr.json', JSON.stringify(parsedData, null, 2)); // Save

    return NextResponse.json({ success: true, data: parsedData }, { status: 200 });

  } catch (error) {
    console.error("[Server] Upload route error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
