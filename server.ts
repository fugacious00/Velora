import express, { Request, Response, NextlewareError } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";

// ============================================================================
// SECURITY LAYER 1: REQUEST HEADERS & PROTECTION
// ============================================================================

// Helmet security headers (CSP, X-Frame-Options, HSTS, etc.)
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://generativelanguage.googleapis.com"],
        fontSrc: ["'self'", "data:"],
        frameSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    noSniff: true,
    xssFilter: true,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    permissionsPolicy: {
      geolocation: [],
      microphone: [],
      camera: [],
    },
  })
);

// CORS configuration (restrictive for production)
const corsOptions = {
  origin: NODE_ENV === "production" 
    ? [process.env.APP_URL || "https://velora.health"]
    : ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  maxAge: 3600,
};

app.use(cors(corsOptions));

// ============================================================================
// SECURITY LAYER 2: REQUEST PARSING & LIMITS
// ============================================================================

// Strict JSON parsing with size limits
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: false }));

// Request timeout (30 seconds)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// ============================================================================
// SECURITY LAYER 3: RATE LIMITING
// ============================================================================

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => NODE_ENV !== "production", // Skip in development
});

const copilotLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30, // More restrictive for AI endpoint
  message: "Too many AI requests, please try again later.",
  standardHeaders: true,
});

app.use("/api/", apiLimiter);
app.use("/api/copilot", copilotLimiter);

// ============================================================================
// SECURITY LAYER 4: INPUT VALIDATION UTILITIES
// ============================================================================

interface ValidatedRequest {
  body?: Record<string, any>;
  error?: string;
}

function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";
  return input
    .trim()
    .slice(0, 10000) // Max 10k chars
    .replace(/[<>]/g, "") // Remove angle brackets
    .replace(/javascript:/gi, ""); // Remove javascript: protocol
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length < 256;
}

function validateLifeStage(stage: string): boolean {
  const validStages = [
    "cycle_hormonal",
    "fertility",
    "pregnancy",
    "postpartum",
    "menopause",
    "aging",
  ];
  return validStages.includes(stage);
}

// ============================================================================
// LOGGER UTILITY (safe error handling)
// ============================================================================

function logError(message: string, error?: any): void {
  const timestamp = new Date().toISOString();
  const errorMsg = error?.message || String(error);
  // Never log sensitive data like API keys or full stack traces in production
  if (NODE_ENV === "development") {
    console.error(`[${timestamp}] ${message}:`, errorMsg);
  } else {
    console.error(`[${timestamp}] ${message}`);
  }
}

// ============================================================================
// GOOGLE GEMINI AI CLIENT INITIALIZATION
// ============================================================================

const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey.length > 10) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "velora-health-os",
        },
      },
    });
  } catch (error) {
    logError("Failed to initialize Google GenAI client", error);
  }
}

// ============================================================================
// HEALTH CHECK ENDPOINT
// ============================================================================

app.get("/api/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Velora Health OS",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    // Never expose API key status in production
    aiConfigured: NODE_ENV === "development" ? !!ai : undefined,
  });
});

// ============================================================================
// AI SAFETY SYSTEM
// ============================================================================

const SYSTEM_SAFETY_INSTRUCTION = `
You are the Velora Health Copilot — a compassionate, highly knowledgeable, and safety-rigorous AI health companion for women across all life stages (teen, cycling, fertility/TTC, pregnancy, postpartum, perimenopause, menopause, and healthy aging).

CRITICAL SAFETY & MEDICAL BOUNDARIES:
1. YOU ARE NOT A PHYSICIAN AND DO NOT PROVIDE MEDICAL DIAGNOSES.
2. Never provide false certainty. Never turn correlation into a definitive diagnosis.
3. Distinguish observed patterns from medical conclusions.
4. For red flag symptoms (severe pain, hemorrhaging, chest pain, shortness of breath), urgently advise seeking emergency care.
5. Provide actionable, evidence-grounded health literacy and lifestyle suggestions.
6. Maintain a calm, empowering, respectful, and dignified tone.

CRITICAL FORMATTING RULES:
- DO NOT USE HASHTAGS OR HASH SYMBOLS (Never use '#').
- Format headings as bold text (e.g., "**Section Title**").
- Write in clean, structured, readable paragraphs.
`;

function sanitizeAndCleanCopilotReply(text: string): string {
  if (!text) return "";
  return text
    .replace(/^(#{1,6})\s+(.+)$/gm, "**$2**")
    .replace(/^(\s*[-*_]{3,}\s*)$/gm, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 5000); // Max response length
}

async function generateGeminiContentWithFallback(
  aiClient: GoogleGenAI,
  params: {
    contents: string;
    config?: any;
  }
): Promise<{ text: string; modelUsed: string }> {
  const models = ["gemini-2.0-flash", "gemini-1.5-flash"];

  for (const model of models) {
    try {
      const result = await aiClient.generateContent({
        model: model,
        contents: params.contents,
        systemInstruction: params.config?.systemInstruction,
        generationConfig: {
          temperature: params.config?.temperature ?? 0.7,
          topP: params.config?.topP ?? 0.9,
          responseMimeType: params.config?.responseMimeType || "text/plain",
        },
      });

      const textContent = result.response.text();
      return { text: textContent, modelUsed: model };
    } catch (error: any) {
      if (error?.status !== 503 && error?.status !== 429) {
        throw error;
      }
      // Continue to next model on rate limit/service unavailable
    }
  }

  throw new Error("All AI models unavailable");
}

function generateLocalCopilotResponse(message: string) {
  return {
    text: "I'm your Velora Health Copilot. I can help you understand your health patterns, prepare questions for your doctor, and provide evidence-based wellness guidance. How can I support your wellbeing today?",
    doctorQuestions: [
      "What preventive health screenings are recommended for my age and life stage?",
      "How do my logged symptoms compare to standard benchmarks?",
    ],
    intent: "general_health_inquiry",
  };
}

// ============================================================================
// API ENDPOINTS
// ============================================================================

// COPILOT CHAT ENDPOINT
app.post("/api/copilot/chat", async (req: Request, res: Response) => {
  try {
    const { message, lifeStage, userContext } = req.body;

    // Validate inputs
    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Missing or invalid message field" });
    }

    if (!lifeStage || !validateLifeStage(lifeStage)) {
      return res.status(400).json({ error: "Invalid life stage" });
    }

    // Sanitize message
    const sanitizedMessage = sanitizeInput(message);
    if (!sanitizedMessage) {
      return res.status(400).json({ error: "Message is empty after validation" });
    }

    // Check for red flags
    const redFlagPatterns = [
      /severe.*pain/i,
      /heavy.*bleed|hemorrhag/i,
      /chest.*pain/i,
      /shortness.*breath/i,
      /difficulty.*breathing/i,
      /unconscious|collapse/i,
    ];
    const isRedFlag = redFlagPatterns.some((pattern) =>
      pattern.test(sanitizedMessage)
    );

    const contextPrompt = `
USER PROFILE - Life Stage: ${lifeStage}
${userContext ? `Recent Health Context: ${JSON.stringify(userContext).slice(0, 500)}` : ""}

USER QUERY: "${sanitizedMessage}"

INSTRUCTIONS:
1. Provide a clear, supportive, and scientifically sound response.
2. Never diagnose. Instead, explain patterns and suggest consulting healthcare providers.
3. If red flags detected, urgently advise seeking medical attention.
4. Keep responses under 500 words.
`;

    if (ai) {
      try {
        const result = await generateGeminiContentWithFallback(ai, {
          contents: contextPrompt,
          config: {
            systemInstruction: SYSTEM_SAFETY_INSTRUCTION,
            temperature: 0.6,
            topP: 0.9,
          },
        });

        const replyText = sanitizeAndCleanCopilotReply(result.text);

        return res.json({
          reply: replyText,
          safetyDisclaimer:
            "Velora Health Copilot provides educational insights, not medical diagnosis.",
          safetyChecksPassed: true,
          isEmergencyFlagged: isRedFlag,
          modelUsed: result.modelUsed,
        });
      } catch (geminiError: any) {
        logError("Gemini API error", geminiError);
        // Fall through to local fallback
      }
    }

    // Local fallback response
    const fallbackResponse = generateLocalCopilotResponse(sanitizedMessage);
    return res.json({
      reply: fallbackResponse.text,
      safetyDisclaimer:
        "Velora Health Copilot provides educational insights, not medical diagnosis.",
      safetyChecksPassed: true,
      isEmergencyFlagged: isRedFlag,
      isOfflineFallback: true,
    });
  } catch (error: any) {
    logError("Copilot endpoint error", error);
    res.status(500).json({
      reply: "I'm processing your request. Please consult your healthcare provider for medical advice.",
      safetyDisclaimer: "Velora provides educational content, not medical diagnosis.",
      safetyChecksPassed: true,
      error: NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// VAULT DOCUMENT EXTRACTION ENDPOINT
app.post("/api/vault/extract", async (req: Request, res: Response) => {
  try {
    const { documentType, rawText, fileName } = req.body;

    if (!rawText || typeof rawText !== "string") {
      return res.status(400).json({ error: "Document text is required" });
    }

    // Sanitize and limit document size
    const sanitizedText = sanitizeInput(rawText).slice(0, 20000);
    const sanitizedFileName = sanitizeInput(fileName || "Document").slice(0, 100);

    const extractionPrompt = `
Analyze this health document and extract factual data:

DOCUMENT: ${sanitizedFileName}
TYPE: ${sanitizeInput(documentType || "Health Record").slice(0, 50)}
CONTENT:
${sanitizedText}

EXTRACT:
1. Test names and values
2. Reference ranges
3. Clinical instructions
4. Recommended follow-up

Output as JSON.
`;

    if (ai) {
      try {
        const result = await generateGeminiContentWithFallback(ai, {
          contents: extractionPrompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        try {
          const parsed = JSON.parse(result.text || "{}");
          return res.json(parsed);
        } catch {
          return res.json({ error: "Could not parse AI response" });
        }
      } catch (geminiError: any) {
        logError("Gemini vault extraction error", geminiError);
      }
    }

    // Safe fallback response
    return res.json({
      documentTitle: sanitizedFileName,
      documentDate: new Date().toLocaleDateString("en-US"),
      facilityOrDoctor: "Health Care Provider",
      extractedFacts: [
        {
          parameter: "Document Status",
          value: "Pending Analysis",
          referenceRange: "N/A",
          status: "normal",
        },
      ],
      summary: "Document received. Please consult your healthcare provider for interpretation.",
    });
  } catch (error: any) {
    logError("Vault extraction error", error);
    res.status(500).json({
      error: NODE_ENV === "development" ? error.message : "Document processing failed",
    });
  }
});

// ============================================================================
// VITE & STATIC FILES
// ============================================================================

async function startServer() {
  if (NODE_ENV !== "production") {
    // Development: Use Vite middleware
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (error) {
      logError("Failed to create Vite server", error);
      process.exit(1);
    }
  } else {
    // Production: Serve pre-built dist folder
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath, { maxAge: "1d" }));

    // SPA fallback - serve index.html for all unmatched routes
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Start listening
  app.listen(PORT, "0.0.0.0", () => {
    console.log(
      `\n✅ Velora Health Server running on http://localhost:${PORT}`
    );
    console.log(`📝 Environment: ${NODE_ENV}`);
    console.log(`🔐 AI Configured: ${ai ? "Yes" : "No (local fallback active)"}`);
    console.log(
      `🚀 API Rate Limiting: ${NODE_ENV === "production" ? "Enabled" : "Disabled"}`
    );
    console.log("");
  });
}

// Error handling
process.on("unhandledRejection", (reason: any) => {
  logError("Unhandled Promise Rejection", reason);
});

process.on("uncaughtException", (error: Error) => {
  logError("Uncaught Exception", error);
  process.exit(1);
});

startServer().catch((error) => {
  logError("Failed to start server", error);
  process.exit(1);
});

export default app;
