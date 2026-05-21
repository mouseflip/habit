import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/analyze", async (req, res) => {
    try {
      const { base64, mimeType } = req.body;
      if (!base64 || !mimeType) {
        return res.status(400).json({ error: "Missing data" });
      }

      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
      }

      const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
      const model = (genAI as any).getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Analyze this workout video/image for form quality. Focus on basketball mechanics if applicable. 
      Provide a score from 0-100 and exactly 3 specific, actionable feedback points. 
      Format: JSON { "score": number, "feedbackPoints": [string, string, string] }`;

      const result = await model.generateContent([
        {
          inlineData: {
            data: base64,
            mimeType
          }
        },
        prompt
      ]);

      const response = await result.response;
      const text = response.text().replace(/```json|```/g, '').trim();
      const data = JSON.parse(text);
      res.json(data);
    } catch (error) {
      console.error("Analysis Error:", error);
      res.status(500).json({ error: "Analysis failed", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/history", async (req, res) => {
    // Return empty array as logs are now client-side only
    res.json([]);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
