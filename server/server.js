import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Groq from "groq-sdk";

dotenv.config(); 

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});


console.log(" GROQ KEY:", process.env.GROQ_API_KEY);

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }

    console.log("Prompt received:", prompt);

   const completion = await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [
    { role: "system", content: "You are a helpful AI assistant." },
    { role: "user", content: prompt },
  ],
});

    const reply = completion.choices[0].message.content;

    res.json({ message: reply });

  } catch (error) {
    console.log(" GROQ ERROR:", error);

    res.status(500).json({
      message: error.message || "Groq API failed",
    });
  }
});

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
