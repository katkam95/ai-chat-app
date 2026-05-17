const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5050";

export const fetchAIResponse = async (prompt) => {
  if (!prompt || !prompt.trim()) {
    throw new Error("Prompt cannot be empty");
  }

  try {
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: prompt.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Server error");
    }

    return data.message;
  } catch (error) {
    console.log("API error:", error.message);
    throw new Error(error.message || "Network error");
  }
};