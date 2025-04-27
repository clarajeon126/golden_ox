// /app/simulation/helpers/initGPT.js

export async function initSimulation() {
    try {
      const res = await fetch("/api/init-gpt", {
        method: "GET",
      });
  
      const data = await res.json();
  
      if (data.success) {
        console.log("Init GPT Success:", data);
        return data.data; // <- This contains { path, prompt, etc }
      } else {
        console.error("Init GPT Error:", data.error);
        return null;
      }
    } catch (err) {
      console.error("Network error:", err);
      return null;
    }
  }
  