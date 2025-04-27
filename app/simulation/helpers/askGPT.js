// /app/simulation/helpers/askGPT.js

export async function askGPT(jsonPayload) {
  try {
    const res = await fetch("/api/ask-gpt", {  // 🔥 Correct fetch address
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonPayload }),
    });

    const data = await res.json();
    if (data.success) {
      return data.response;
    } else {
      console.error("GPT Error:", data.error);
      return { success: 0, error: "Something went wrong." };
    }
  } catch (err) {
    console.error("Network error:", err);
    return { success: 0, error: "Network error." };
  }
}
