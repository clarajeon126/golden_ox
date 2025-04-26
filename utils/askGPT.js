export async function askGPT(messages) {
    try {
      const res = await fetch("/api/ask-gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });
  
      const data = await res.json();
      if (data.success) {
        return data.response;
      } else {
        console.error("GPT Error:", data.error);
        return "Something went wrong.";
      }
    } catch (err) {
      console.error("Fetch error:", err);
      return "Network error.";
    }
  }
  