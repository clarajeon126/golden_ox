import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Only POST requests allowed" });
  }

  console.log("Hi");

  const { messages } = req.body;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo", // or "gpt-3.5-turbo"
      messages,
      temperature: 0.3,
    });

    const gptResponse = completion.choices[0].message.content;
    res.status(200).json({ success: true, response: gptResponse });
  } catch (error) {
    console.error(error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.message });
  }
}
