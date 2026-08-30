/**
 * parseAnalysisStream
 * Maps the AI JSON response to structured sections used by all dashboard pages.
 * Backward-compatible with old markdown format for history items.
 */
export function parseAnalysisStream(content) {
  const sections = {
    // Core / legacy
    summary: "",
    healthScore: null,
    insights: "",
    documentation: "",
    roadmap: "",
    features: "",
    technologies: "",
    strengths: "",
    weaknesses: "",
    targetDevelopers: "",
    codeQuality: null,
    securityDetails: "",

    // New professional report fields
    repositoryPurpose: "",
    architectureAnalysis: "",
    engineeringDecisions: "",
    productionReadiness: "",
    maintainabilityAnalysis: "",
    documentationReview: "",
    scalabilityAssessment: "",
    testingAssessment: "",
    contributionReadiness: "",
    securityObservations: [],
    engineeringInsights: null,
    learningGuide: null,
    decision: null,
    structuredImprovements: null,  // New: array-of-objects per priority
    complexity: "",
    learningDifficulty: "",
  };

  if (!content) return sections;

  try {
    const data = JSON.parse(content);

    // ── Core fields ──
    if (data.summary) sections.summary = data.summary;
    if (data.repositoryPurpose) sections.repositoryPurpose = data.repositoryPurpose;
    if (data.architectureAnalysis) sections.architectureAnalysis = data.architectureAnalysis;
    if (data.engineeringDecisions) sections.engineeringDecisions = data.engineeringDecisions;
    if (data.productionReadiness) sections.productionReadiness = data.productionReadiness;
    if (data.maintainabilityAnalysis) sections.maintainabilityAnalysis = data.maintainabilityAnalysis;
    if (data.documentationReview) sections.documentationReview = data.documentationReview;
    if (data.scalabilityAssessment) sections.scalabilityAssessment = data.scalabilityAssessment;
    if (data.testingAssessment) sections.testingAssessment = data.testingAssessment;
    if (data.contributionReadiness) sections.contributionReadiness = data.contributionReadiness;
    if (data.complexity) sections.complexity = data.complexity;
    if (data.learningDifficulty) sections.learningDifficulty = data.learningDifficulty;

    // ── Legacy / backward compat ──
    if (data.learningDifficulty || data.complexity) {
      sections.insights = `### Architecture Complexity\n${data.complexity || 'N/A'}\n\n### Learning Difficulty\n${data.learningDifficulty || 'N/A'}`;
    }
    if (data.documentation) sections.documentation = data.documentation;

    // ── Security ──
    if (data.securityObservations && Array.isArray(data.securityObservations)) {
      sections.securityObservations = data.securityObservations;
      sections.securityDetails = data.securityObservations.length
        ? data.securityObservations.map(s => `- ${s}`).join('\n')
        : "No security issues identified.";
    } else if (data.security && Array.isArray(data.security)) {
      // legacy
      sections.securityObservations = data.security;
      sections.securityDetails = data.security.length
        ? data.security.map(s => `- ${s}`).join('\n')
        : "No security issues found by AI.";
    }

    // ── Code Quality / Health Score ──
    if (data.codeQuality) {
      sections.healthScore = data.codeQuality;
      sections.codeQuality = `Overall: ${data.codeQuality.overall || 'N/A'}\nArchitecture: ${data.codeQuality.architecture || 'N/A'}`;
    }

    // ── Engineering Insights ──
    if (data.engineeringInsights) {
      sections.engineeringInsights = data.engineeringInsights;

      if (data.engineeringInsights.strengths?.length) {
        sections.strengths = data.engineeringInsights.strengths.map(s => `- ${s}`).join('\n');
      }
      if (data.engineeringInsights.weaknesses?.length) {
        sections.weaknesses = data.engineeringInsights.weaknesses.map(w => `- ${w}`).join('\n');
      }
    }

    // ── Learning Guide ──
    if (data.learningGuide) {
      sections.learningGuide = data.learningGuide;
    }

    // ── Decision Panel ──
    if (data.decision) {
      sections.decision = data.decision;
    }

    // ── Improvements — new structured format ──
    if (data.improvements) {
      sections.structuredImprovements = {
        high: Array.isArray(data.improvements.high) ? data.improvements.high : [],
        medium: Array.isArray(data.improvements.medium) ? data.improvements.medium : [],
        low: Array.isArray(data.improvements.low) ? data.improvements.low : [],
      };

      // Also build legacy roadmap string for backward compat
      let roadmap = "";
      if (sections.structuredImprovements.high.length) {
        roadmap += `### High Priority\n${sections.structuredImprovements.high.map(i => `- **${i.title}**: ${i.problem}`).join('\n')}\n\n`;
      }
      if (sections.structuredImprovements.medium.length) {
        roadmap += `### Medium Priority\n${sections.structuredImprovements.medium.map(i => `- **${i.title}**: ${i.problem}`).join('\n')}\n\n`;
      }
      if (sections.structuredImprovements.low.length) {
        roadmap += `### Low Priority\n${sections.structuredImprovements.low.map(i => `- **${i.title}**: ${i.problem}`).join('\n')}\n\n`;
      }
      sections.roadmap = roadmap.trim() || "No improvements suggested.";
    }

    // ── Dependencies fallback ──
    if (data.dependencies && Array.isArray(data.dependencies)) {
      sections.technologies = data.dependencies.map(d => `- ${d}`).join('\n');
    }

    return sections;
  } catch {
    // ── Fallback: legacy markdown format (for old history items) ──
    const regex = /(?=^##\s+|\n##\s+)/m;
    const parts = content.split(regex);

    parts.forEach((part) => {
      const trimmed = part.trim();
      if (!trimmed.startsWith("## ")) return;

      const firstNewline = trimmed.indexOf("\n");
      if (firstNewline === -1) return;

      const title = trimmed.slice(0, firstNewline).replace(/^##\s+/, "").trim().toLowerCase();
      const body = trimmed.slice(firstNewline + 1).trim();

      if (title.includes("summary") || title.includes("what") || title.includes("overview")) {
        sections.summary = body;
      } else if (title.includes("health score")) {
        try {
          const jsonMatch = body.match(/```json\s*(\{[\s\S]*?\})\s*```/);
          if (jsonMatch) sections.healthScore = JSON.parse(jsonMatch[1]);
        } catch { /* ignore during streaming */ }
      } else if (title.includes("feature")) {
        sections.features = body;
      } else if (title.includes("tech") || title.includes("stack") || title.includes("technolog")) {
        sections.technologies = body;
      } else if (title.includes("strength")) {
        sections.strengths = body;
      } else if (title.includes("weakness") || title.includes("limitation")) {
        sections.weaknesses = body;
      } else if (title.includes("target") || title.includes("audience") || title.includes("developer")) {
        sections.targetDevelopers = body;
      } else if (title.includes("insight")) {
        sections.insights = body;
      } else if (title.includes("documentation") || title.includes("doc quality")) {
        sections.documentation = body;
      } else if (title.includes("roadmap") || title.includes("improvement") || title.includes("suggestion")) {
        sections.roadmap = body;
      } else if (title.includes("security")) {
        sections.securityDetails = body;
      } else if (title.includes("quality") || title.includes("maintainab") || title.includes("code quality")) {
        sections.codeQuality = body;
      }
    });

    return sections;
  }
}
