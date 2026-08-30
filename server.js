const express = require("express");
const cors = require("cors");
const { GoogleGenAI } = require("@google/genai");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: GEMINI_API_KEY })
  : null;

app.get("/", (req, res) => {
  res.send("Myra AI server is running successfully 🚀");
});

app.post("/ask", async (req, res) => {
  try {
    const question = req.body.question;

    if (!question) {
      return res.status(400).json({
        answer: "Please ask me something."
      });
    }

    if (!ai) {
      return res.status(500).json({
        answer: "GEMINI_API_KEY is missing on the server."
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: question
    });

    res.json({
      answer: response.text
    });

  } catch (error) {
    console.error("Myra AI Error:", error);

    res.status(500).json({
      answer: "Sorry, Myra AI is having a problem right now."
    });
  }
});

app.listen(PORT, () => {
  console.log(`Myra AI server running on port ${PORT}`);
});
