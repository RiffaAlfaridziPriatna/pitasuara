/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// API routes
async function generateSpeechAnalysis(audio: string, exerciseText: string, difficulty: string) {
  const models = ["gemini-3-flash-preview", "gemini-3.5-flash"];
  let lastError: any = null;

  for (const modelName of models) {
    let delay = 1000;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`Analyzing speech using model ${modelName} (attempt ${attempt}/3)...`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: {
            parts: [
              {
                inlineData: {
                  mimeType: "audio/wav",
                  data: audio,
                },
              },
              {
                text: `Analyze this voice recording for speech articulation. 
                The user was supposed to say: "${exerciseText}"
                Difficulty: ${difficulty}
                
                Evaluate based on:
                1. Articulatory Precision (Clarity): How clear and accurate are the phonemes?
                2. Intonation & Rhythm: Is the pitch and timing natural and therapy-appropriate?
                
                Provide:
                - A score (0-100)
                - Specific clarity score (0-100)
                - Specific intonation score (0-100)
                - Constructive feedback for improvement (written in the language of the exercise text: either English or Indonesian).
                - XP points to award (suggested allocation between 10-100 based on performance and difficulty).
                
                Respond in strict JSON format.`,
              },
            ],
          },
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { type: Type.NUMBER },
                clarityScore: { type: Type.NUMBER },
                intonationScore: { type: Type.NUMBER },
                feedback: { type: Type.STRING },
                xpEarned: { type: Type.NUMBER },
              },
              required: ["score", "clarityScore", "intonationScore", "feedback", "xpEarned"]
            }
          }
        });

        if (response && response.text) {
          const text = response.text.trim();
          try {
            return JSON.parse(text);
          } catch (jsonErr) {
            console.warn(`Model ${modelName} output is not valid JSON, retrying...`, text);
            throw jsonErr;
          }
        } else {
          throw new Error("No response text received from Gemini API");
        }
      } catch (err: any) {
        lastError = err;
        console.error(`Attempt ${attempt} for model ${modelName} failed. Error:`, err.message || err);
        if (modelName === models[models.length - 1] && attempt === 3) {
          break;
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
      }
    }
  }

  throw lastError || new Error("Failed after retrying all models");
}

app.post('/api/analyze', async (req, res) => {
  try {
    const { audio, exerciseText, difficulty } = req.body;

    if (!audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    const result = await generateSpeechAnalysis(audio, exerciseText, difficulty);
    res.json(result);
  } catch (error: any) {
    console.error('All analysis attempts failed:', error);
    res.status(500).json({ 
      error: 'Failed to analyze speech due to high demand on Gemini services. Please try again.',
      details: error.message || String(error)
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
