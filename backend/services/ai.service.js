/**
 * AI Service
 * Constructs structured prompts from repo data and fetches JSON analysis via Groq.
 */

import Groq from "groq-sdk";
import NodeCache from "node-cache";
import { logger } from "../utils/logger.js";

let groqClient = null;

// TTL-based in-memory cache: 30 minutes, checked every 5 minutes.
// Using NodeCache (same as github.service) prevents unbounded memory growth
// and ensures consistent eviction policy across both caches.
const analysisCache = new NodeCache({ stdTTL: 1800, checkperiod: 300 });

// Timeout for AI requests (90 seconds)
const AI_TIMEOUT_MS = 90_000;

function getClient() {
  if (!groqClient) {
    if (!process.env.GROQ_API_KEY) {
      const err = new Error(
        "GROQ_API_KEY is not configured. Please add it to your .env file."
      );
      err.statusCode = 503;
      err.errorType = "AI_UNAVAILABLE";
      throw err;
    }
    // Do NOT log any portion of the API key
    groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
    logger.info("Groq client initialized.");
  }
  return groqClient;
}

function buildPrompt(repoData, isLightweight = false) {
  const { metadata, languages, readme, tree, configFiles } = repoData;

  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const langBreakdown = totalBytes
    ? Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .map(([lang, bytes]) => `- ${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`)
      .join("\n")
    : "Not detected";

  let promptText = `You are a Staff Engineer performing a technical due diligence review of a GitHub repository. Analyze this repository and return ONLY a valid JSON object — no markdown, no commentary.

Repository: ${metadata.fullName}
Description: ${metadata.description || "N/A"}
Stars: ${metadata.stars || 0} | Forks: ${metadata.forks || 0} | Open Issues: ${metadata.openIssues || 0}
License: ${metadata.license || "None"} | Default Branch: ${metadata.defaultBranch || "main"}
Created: ${metadata.createdAt || "N/A"} | Last Updated: ${metadata.updatedAt || "N/A"}
Topics: ${(metadata.topics || []).join(", ") || "None"}

Languages:
${langBreakdown}
`;

  if (!isLightweight) {
    promptText += `\nFile Tree:\n${tree || "N/A"}\n`;
    promptText += `\nREADME (first 1200 chars):\n${readme ? readme.substring(0, 1200) : "N/A"}\n`;
    const configSection = configFiles && configFiles.length
      ? configFiles.map((f) => `--- ${f.path} ---\n${f.content.substring(0, 400)}`).join("\n")
      : "N/A";
    promptText += `\nConfig Files:\n${configSection}\n`;
  }

  promptText += `
Return ONLY this exact JSON structure (no extra keys, no comments):
{
  "summary": "2-3 sentence executive summary of what this repository does and its primary value proposition. Be specific to this repo.",
  "repositoryPurpose": "Detailed explanation of the repository's purpose, target audience, and problem it solves. 3-5 sentences.",
  "architectureAnalysis": "Technical analysis of the repository architecture. Mention specific patterns, layers, and structural decisions observed in the file tree and configs. 4-6 sentences.",
  "engineeringDecisions": "Analysis of notable engineering decisions: choice of language, framework, build tools, testing approach, database. Be specific about what was found. 3-5 sentences.",
  "productionReadiness": "Assessment of production readiness: does it have proper error handling, logging, environment config, Docker, CI/CD indicators, rate limiting, security headers? 3-5 sentences.",
  "maintainabilityAnalysis": "Analysis of maintainability factors: code organization, naming conventions, documentation density, modularity, coupling. 3-4 sentences.",
  "documentationReview": "Review of documentation quality: README completeness, inline docs, API docs, contributing guide presence. 3-4 sentences.",
  "scalabilityAssessment": "Assessment of scalability: stateless design, caching strategy, database choices, horizontal scaling potential. 3-4 sentences.",
  "testingAssessment": "Assessment of testing: presence of test files, testing frameworks detected, estimated test coverage, testing strategy. 3-4 sentences.",
  "contributionReadiness": "How welcoming is this repo to contributors? CONTRIBUTING.md, issue templates, PR templates, code of conduct, clear setup instructions? 2-3 sentences.",
  "securityObservations": ["Specific security finding 1", "Specific security finding 2", "Specific security finding 3"],
  "engineeringInsights": {
    "strengths": ["Specific strength observed in this repo 1", "Specific strength 2", "Specific strength 3"],
    "weaknesses": ["Specific weakness or gap 1", "Specific weakness 2", "Specific weakness 3"],
    "architectureQuality": {"score": 80, "explanation": "One sentence explanation specific to this repo."},
    "maintainability": {"score": 75, "explanation": "One sentence explanation specific to this repo."},
    "codeOrganization": {"score": 80, "explanation": "One sentence explanation specific to this repo."},
    "testingCoverage": {"score": 60, "explanation": "One sentence explanation specific to this repo."},
    "documentationQuality": {"score": 70, "explanation": "One sentence explanation specific to this repo."},
    "developerExperience": {"score": 78, "explanation": "One sentence explanation specific to this repo."},
    "scalability": {"score": 72, "explanation": "One sentence explanation specific to this repo."}
  },
  "learningGuide": {
    "steps": [
      {"step": 1, "title": "Read the README", "description": "Start with the README to understand purpose and setup.", "estimatedTime": "15 min"},
      {"step": 2, "title": "Explore folder structure", "description": "Map out top-level directories and their responsibilities.", "estimatedTime": "20 min"},
      {"step": 3, "title": "Find the entry point", "description": "Locate main.py / index.js / server.js and trace execution flow.", "estimatedTime": "30 min"},
      {"step": 4, "title": "Understand core modules", "description": "Read the core business logic files.", "estimatedTime": "1 hour"},
      {"step": 5, "title": "Run the project locally", "description": "Follow setup instructions and get it running.", "estimatedTime": "30 min"},
      {"step": 6, "title": "Study tests", "description": "Read existing tests to understand expected behavior.", "estimatedTime": "45 min"}
    ],
    "totalTime": "3-4 hours"
  },
  "decision": {
    "learn": { "verdict": "Highly Recommended", "confidence": 95, "explanation": "Specific explanation based on repo quality.", "reasons": ["Point 1", "Point 2", "Point 3"] },
    "contribute": { "verdict": "Consider with Caution", "confidence": 60, "explanation": "Specific explanation based on activity and friendliness.", "reasons": ["Point 1", "Point 2", "Point 3"] },
    "production": { "verdict": "Recommended", "confidence": 90, "explanation": "Specific explanation based on stability.", "reasons": ["Point 1", "Point 2", "Point 3"] },
    "beginnerFriendly": { "verdict": "Not Recommended", "confidence": 85, "explanation": "Specific explanation based on complexity.", "reasons": ["Point 1", "Point 2", "Point 3"] },
    "wellMaintained": { "verdict": "Highly Recommended", "confidence": 92, "explanation": "Specific explanation based on commit frequency.", "reasons": ["Point 1", "Point 2", "Point 3"] },
    "overall": { "summary": "One concise paragraph summarizing the repository.", "score": 94, "rating": "4.8/5" }
  },
  "improvements": {
    "high": [
      {"title": "Specific high priority issue title", "problem": "What is wrong or missing.", "whyItMatters": "Business/technical impact.", "evidence": "Specific file or pattern in this repo.", "implementation": "Concrete implementation suggestion.", "effort": "Medium", "impact": "High", "category": "Architecture"}
    ],
    "medium": [
      {"title": "Specific medium priority issue title", "problem": "What is wrong or missing.", "whyItMatters": "Business/technical impact.", "evidence": "Specific file or pattern in this repo.", "implementation": "Concrete implementation suggestion.", "effort": "Low", "impact": "Medium", "category": "Testing"}
    ],
    "low": [
      {"title": "Specific low priority issue title", "problem": "What is wrong or missing.", "whyItMatters": "Business/technical impact.", "evidence": "Specific file or pattern in this repo.", "implementation": "Concrete implementation suggestion.", "effort": "Low", "impact": "Low", "category": "Documentation"}
    ]
  },
  "codeQuality": {
    "overall": 80,
    "documentation": 75,
    "architecture": 85,
    "maintainability": 78,
    "security": 82,
    "organization": 80
  },
  "complexity": "One sentence evaluation of architecture complexity.",
  "learningDifficulty": "One sentence evaluation of learning curve for new contributors."
}

Rules:
- Return ONLY valid JSON. No markdown fences, no explanation text outside JSON.
- All scores are integers 0-100.
- improvements.high must have exactly 3 items, medium exactly 3, low exactly 3.
- learningGuide.steps must have exactly 6 steps.
- All text must be specific to THIS repository — not generic advice.
- decision verdicts must be exactly one of: "Highly Recommended", "Recommended", "Consider with Caution", "Not Recommended".`;

  return promptText;
}

function buildLightweightPrompt(repoData) {
  const { metadata, languages } = repoData;
  const totalBytes = Object.values(languages).reduce((a, b) => a + b, 0);
  const langBreakdown = totalBytes
    ? Object.entries(languages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([lang, bytes]) => `${lang}: ${((bytes / totalBytes) * 100).toFixed(1)}%`)
      .join(", ")
    : "Not detected";

  return `Analyze this GitHub repository and return ONLY valid JSON.

Repo: ${metadata.fullName}
Desc: ${metadata.description || "N/A"}
Stars: ${metadata.stars || 0}, Forks: ${metadata.forks || 0}
Langs: ${langBreakdown}

Return this exact JSON (be specific to this repo, not generic):
{
  "summary": "2-3 sentence summary.",
  "repositoryPurpose": "What this repo does and who it's for.",
  "architectureAnalysis": "Architecture overview.",
  "engineeringDecisions": "Key technical choices.",
  "productionReadiness": "Production indicators assessment.",
  "maintainabilityAnalysis": "Maintainability assessment.",
  "documentationReview": "Documentation quality review.",
  "scalabilityAssessment": "Scalability assessment.",
  "testingAssessment": "Testing assessment.",
  "contributionReadiness": "Contributor friendliness assessment.",
  "securityObservations": ["finding1", "finding2", "finding3"],
  "engineeringInsights": {
    "strengths": ["strength1", "strength2", "strength3"],
    "weaknesses": ["weakness1", "weakness2", "weakness3"],
    "architectureQuality": {"score": 75, "explanation": "Explanation."},
    "maintainability": {"score": 70, "explanation": "Explanation."},
    "codeOrganization": {"score": 75, "explanation": "Explanation."},
    "testingCoverage": {"score": 50, "explanation": "Explanation."},
    "documentationQuality": {"score": 65, "explanation": "Explanation."},
    "developerExperience": {"score": 70, "explanation": "Explanation."},
    "scalability": {"score": 65, "explanation": "Explanation."}
  },
  "learningGuide": {
    "steps": [
      {"step": 1, "title": "Read the README", "description": "Understand setup and purpose.", "estimatedTime": "15 min"},
      {"step": 2, "title": "Explore folder structure", "description": "Map top-level directories.", "estimatedTime": "20 min"},
      {"step": 3, "title": "Find the entry point", "description": "Trace main execution flow.", "estimatedTime": "30 min"},
      {"step": 4, "title": "Understand core modules", "description": "Read core business logic.", "estimatedTime": "1 hour"},
      {"step": 5, "title": "Run locally", "description": "Follow setup instructions.", "estimatedTime": "30 min"},
      {"step": 6, "title": "Study tests", "description": "Read existing tests.", "estimatedTime": "45 min"}
    ],
    "totalTime": "3-4 hours"
  },
  "decision": {
    "shouldLearn": {"verdict": "Yes", "reason": "Reason."},
    "shouldContribute": {"verdict": "Maybe", "reason": "Reason."},
    "shouldUseInProduction": {"verdict": "Yes", "reason": "Reason."},
    "shouldStudy": {"verdict": "Yes", "reason": "Reason."}
  },
  "improvements": {
    "high": [
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "Medium", "impact": "High", "category": "Architecture"},
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "Medium", "impact": "High", "category": "Security"},
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "High", "impact": "High", "category": "Testing"}
    ],
    "medium": [
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "Low", "impact": "Medium", "category": "Documentation"},
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "Medium", "impact": "Medium", "category": "Performance"},
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "Low", "impact": "Medium", "category": "DevOps"}
    ],
    "low": [
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "Low", "impact": "Low", "category": "Documentation"},
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "Low", "impact": "Low", "category": "Code Quality"},
      {"title": "Title", "problem": "Problem.", "whyItMatters": "Impact.", "evidence": "Evidence.", "implementation": "How to fix.", "effort": "Low", "impact": "Low", "category": "Developer Experience"}
    ]
  },
  "codeQuality": {"overall": 75, "documentation": 70, "architecture": 78, "maintainability": 72, "security": 78, "organization": 75},
  "complexity": "Complexity assessment.",
  "learningDifficulty": "Learning difficulty assessment."
}
Return ONLY valid JSON.`;
}

async function fetchAnalysisFromGroq(client, repoData, isLightweight, abortSignal) {
  const modelName = isLightweight ? "llama-3.1-8b-instant" : "llama-3.3-70b-versatile";
  const prompt = isLightweight ? buildLightweightPrompt(repoData) : buildPrompt(repoData, false);
  const maxTokens = isLightweight ? 1200 : 3000;

  logger.info(`[Groq API] Starting request — Model: ${modelName} | Lightweight: ${isLightweight} | Prompt: ${prompt.length} chars`);

  // Combine the caller's abort signal with our own timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), AI_TIMEOUT_MS);

  // Combine signals: abort if either the caller cancels or timeout fires
  const combinedSignal = abortSignal
    ? AbortSignal.any
      ? AbortSignal.any([abortSignal, timeoutController.signal])
      : timeoutController.signal
    : timeoutController.signal;

  let response;
  try {
    response = await client.chat.completions.create(
      {
        model: modelName,
        messages: [
          {
            role: "system",
            content: "You are a Staff Engineer performing technical due diligence. Respond ONLY with valid JSON. No markdown, no code fences, no explanation.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        stream: false,
      },
      { signal: combinedSignal }
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const usage = response.usage;
  logger.info(`[Groq API] Complete — Prompt: ${usage?.prompt_tokens} | Completion: ${usage?.completion_tokens} | Total: ${usage?.total_tokens}`);

  return response.choices[0].message.content;
}

export async function streamAnalysis(repoData, res, req) {
  const repoName = repoData.metadata.fullName;

  // 1. Check Cache
  const cached = analysisCache.get(repoName);
  if (cached) {
    logger.info(`[AI Cache HIT] Returning cached analysis for ${repoName}`);
    res.write(`data: ${JSON.stringify({ content: cached })}\n\n`);
    return;
  }

  let client;
  try {
    client = getClient();
  } catch (err) {
    res.write(
      `data: ${JSON.stringify({
        type: "error",
        error: err.message,
        errorType: err.errorType,
      })}\n\n`
    );
    return;
  }

  const abortController = new AbortController();
  const onClientClose = () => {
    logger.info(`Client disconnected — aborting AI request for ${repoName}`);
    abortController.abort();
  };
  req.on("close", onClientClose);

  let jsonContent;
  try {
    jsonContent = await fetchAnalysisFromGroq(client, repoData, false, abortController.signal);
  } catch (err) {
    // If rate limited, attempt lightweight fallback
    if (err.status === 429) {
      logger.warn(`Rate limit hit (429). Falling back to lightweight model for ${repoName}...`);
      try {
        jsonContent = await fetchAnalysisFromGroq(client, repoData, true, abortController.signal);
      } catch (fallbackErr) {
        err = fallbackErr;
      }
    }

    if (!jsonContent) {
      req.removeListener("close", onClientClose);

      if (err.name === "AbortError") {
        logger.info("AI request aborted safely.");
        return;
      }

      logger.error(`Groq API failed for ${repoName} — Status: ${err.status} | Code: ${err.error?.error?.code || "Unknown"}`);

      let thrownError;
      const status = err.status;
      if (status === 429) {
        thrownError = new Error("AI service rate limit reached.");
        thrownError.errorType = "AI_RATE_LIMIT";
      } else if (status === 401 || status === 403) {
        thrownError = new Error("AI service authentication failed. Please contact support.");
        thrownError.errorType = "AI_AUTH_ERROR";
      } else {
        thrownError = new Error("AI service is temporarily unavailable. Please try again.");
        thrownError.errorType = "AI_UNAVAILABLE";
      }
      throw thrownError;
    }
  }

  // Ensure listener is removed on success
  req.removeListener("close", onClientClose);

  // Cache the successful result (30 min TTL)
  analysisCache.set(repoName, jsonContent);

  // Send the entire JSON string to the client as one SSE chunk
  res.write(`data: ${JSON.stringify({ content: jsonContent })}\n\n`);
}
