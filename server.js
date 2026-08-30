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

async function generateAnswer(question) {

  const models = [
    "gemini-3.6-flash",
    "gemini-3.5-flash"
  ];

  let lastError = null;

  for (const model of models) {

    for (let attempt = 1; attempt <= 3; attempt++) {

      try {

        console.log(
          `Trying ${model}, attempt ${attempt}`
        );

        const response = await ai.models.generateContent({
          model: model,
          contents: question
        });

        return response.text ||
          "Sorry, I could not generate a response.";

      } catch (error) {

        lastError = error;

        console.error(
          `${model} attempt ${attempt} failed:`,
          error.message
        );

        if (error.status !== 503) {
          throw error;
        }

        await new Promise(resolve =>
          setTimeout(resolve, 2000 * attempt)
        );
      }
    }
  }

  throw lastError;
}

app.post("/ask", async (req, res) => {

  try {

    const question = req.body.question;

    if (!question || !question.trim()) {

      return res.status(400).json({
        answer: "Please ask me something."
      });
    }

    if (!ai) {

      return res.status(500).json({
        answer: "GEMINI_API_KEY is missing on the server."
      });
    }

    const answer =
      await generateAnswer(question.trim());

    console.log("Myra response:", answer);

    res.json({
      answer: answer
    });

  } catch (error) {

    console.error("MYRA FINAL ERROR:", error);

    res.status(500).json({
      answer:
        "Myra AI is temporarily busy. Please try again."
    });
  }
});

app.listen(PORT, () => {

  console.log(
    `Myra AI server running on port ${PORT}`
  );

});
