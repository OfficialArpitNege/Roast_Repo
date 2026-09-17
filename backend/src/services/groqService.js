// ---------------------------------------------------------------------------
// Groq AI service – generates the roast + suggestions
// ---------------------------------------------------------------------------
import Groq from "groq-sdk";

// Lazy-init: the client is created on first call, after dotenv has loaded.
let _groq;
function getGroqClient() {
  if (!_groq) {
    _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groq;
}

/**
 * Send the factual analysis to Groq and get back a roast + suggestions.
 *
 * @param {object} profile  – raw GitHub profile object
 * @param {object} analysis – output of analyzeGitHubData()
 * @returns {Promise<{ roast: string, suggestions: string[] }>}
 */
export async function generateRoast(profile, analysis) {
  const systemPrompt = `You are "GitRoaster 3000", a brutally funny but ultimately helpful code critic.

RULES:
1. You will receive a FACTUAL analysis of a GitHub user's profile and repositories.
2. Generate a roast structured as 3-5 distinct, punchy bullet points / short paragraphs separated by newlines (\\n).
3. DO NOT invent or hallucinate any GitHub facts. Only reference data explicitly provided.
4. After the roast, provide 5-8 actionable suggestions to improve their GitHub presence.
5. Keep the tone fun — think comedy roast, not harassment.
6. Reference specific repos, languages, or stats from the provided data when possible.
7. Return your response as valid JSON with exactly two keys:
   - "roast": a single string with the full roast (separate each roast point with \\n)
   - "suggestions": an array of short suggestion strings`;

  const userPrompt = `Analyze this GitHub user and generate a roast + suggestions.

=== PROFILE ===
Username: ${profile.login}
Name: ${profile.name || "Not set"}
Bio: ${profile.bio || "Not set"}
Public repos: ${profile.public_repos}
Followers: ${profile.followers}
Following: ${profile.following}
Account created: ${profile.created_at}

=== SCORES (0-100) ===
Documentation: ${analysis.scores.documentation}
Activity: ${analysis.scores.activity}
Presentation: ${analysis.scores.presentation}
Projects: ${analysis.scores.projects}
Cleanliness: ${analysis.scores.cleanliness}
Overall: ${analysis.scores.overall}

=== STATS ===
${JSON.stringify(analysis.stats, null, 2)}

=== PROBLEMS FOUND ===
${analysis.problems.map((p) => `• ${p}`).join("\n")}`;

  try {
    const chatCompletion = await getGroqClient().chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.85,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const raw = chatCompletion.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("Groq returned an empty response.");
    }

    const parsed = JSON.parse(raw);

    return {
      roast: parsed.roast || "Couldn't think of a roast. You might actually be perfect. (Just kidding.)",
      suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
    };
  } catch (err) {
    // If it's a rate-limit or auth error from Groq, surface it cleanly
    if (err?.status === 429) {
      const error = new Error("Groq API rate limit exceeded. Please try again in a moment.");
      error.statusCode = 429;
      throw error;
    }
    if (err?.status === 404) {
      const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
      const error = new Error(
        `Groq model "${model}" not found. Check GROQ_MODEL in your .env file.`
      );
      error.statusCode = 500;
      throw error;
    }
    if (err?.status === 401) {
      const error = new Error("Invalid Groq API key. Check your .env file.");
      error.statusCode = 500;
      throw error;
    }

    // JSON parse failures or unexpected shapes
    console.error("Groq service error:", err.message);
    const error = new Error("Failed to generate roast. The AI might be having a bad day.");
    error.statusCode = 502;
    throw error;
  }
}

/**
 * Send the factual analysis to Groq and get back professional recruiter feedback.
 *
 * @param {object} profile  – raw GitHub profile object
 * @param {object} analysis – output of analyzeGitHubData()
 * @returns {Promise<{ summary: string, strengths: string[], concerns: string[], recommendations: Array<{what: string, why: string, affects: string}>, project_improvements: string[] }>}
 */
export async function generateRecruiterAnalysis(profile, analysis) {
  const systemPrompt = `You are a senior technical recruiter analyzing a developer's public GitHub profile to evaluate how they present themselves professionally to potential employers.

RULES:
1. Base your assessment ONLY on the factual profile metrics, repository statistics, and scores provided.
2. NEVER invent repositories, technologies, commit counts, stars, or achievements that are not explicitly provided.
3. Be professional, constructive, practical, and fair.
4. Clearly distinguish observed facts from recommendations.
5. Focus on how a recruiter evaluates a candidate's public profile (presentation, documentation, consistency, repository names, descriptions).
6. Avoid judging employability, intelligence, or predicting whether the candidate will get hired.
7. Return your response as valid JSON with the following exact keys:
   - "summary": a short 2-4 sentence professional assessment of the GitHub profile.
   - "strengths": an array of 3-5 concrete strength strings based on provided data.
   - "concerns": an array of 3-5 recruiter concerns (areas that make evaluation harder).
   - "recommendations": an array of 3-5 recommendation objects, each containing:
       { "what": "Short action statement", "why": "Why it matters to a recruiter", "affects": "Affected profile section" }
   - "project_improvements": an array of 3-5 practical repository presentation tips (READMEs, descriptions, project naming).`;

  const userPrompt = `Review this GitHub user from a recruiter perspective.

=== PROFILE ===
Username: ${profile.login}
Name: ${profile.name || "Not set"}
Bio: ${profile.bio || "Not set"}
Public repos: ${profile.public_repos}
Followers: ${profile.followers}
Following: ${profile.following}
Account created: ${profile.created_at}

=== SCORES (0-100) ===
Documentation: ${analysis.scores.documentation}
Activity: ${analysis.scores.activity}
Presentation: ${analysis.scores.presentation}
Projects: ${analysis.scores.projects}
Cleanliness: ${analysis.scores.cleanliness}
Overall: ${analysis.scores.overall}

=== STATS ===
${JSON.stringify(analysis.stats, null, 2)}

=== OBSERVED ISSUES ===
${analysis.problems.map((p) => `• ${p}`).join("\n")}`;

  try {
    const chatCompletion = await getGroqClient().chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const raw = chatCompletion.choices?.[0]?.message?.content;

    if (!raw) {
      throw new Error("Groq returned an empty response for recruiter analysis.");
    }

    const parsed = JSON.parse(raw);

    return {
      summary: parsed.summary || "Profile analysis completed.",
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      concerns: Array.isArray(parsed.concerns) ? parsed.concerns : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      project_improvements: Array.isArray(parsed.project_improvements) ? parsed.project_improvements : [],
    };
  } catch (err) {
    console.error("Groq recruiter service error:", err.message);
    throw err;
  }
}

/**
 * Send the factual analysis to Groq and get back a simulated profile makeover plan.
 *
 * @param {object} profile  – raw GitHub profile object
 * @param {object} analysis – output of analyzeGitHubData()
 * @returns {Promise<{ profile_preview: { tagline: string, featured_tech: string[], featured_projects: Array<{name: string, description: string, tech: string}> }, repo_makeovers: Array<{name: string, current_status: string, recommended_action: string, impact: string}>, priority_actions: Array<{impact: string, action: string, why: string}> }>}
 */
export async function generateMakeoverPlan(profile, analysis) {
  const systemPrompt = `You are "GitHub Makeover Advisor", a developer branding & profile presentation consultant.

RULES:
1. Base your makeover advice strictly on the provided factual profile data, repo names, and scores.
2. NEVER invent non-existent repositories, commit counts, stars, or technologies. Use ONLY the user's actual repos and languages listed in the provided data.
3. Clearly present simulated/recommended presentation improvements without claiming changes have been made.
4. Return valid JSON with the following exact keys:
   - "profile_preview": an object containing:
       - "tagline": a short, professional 1-sentence bio/tagline for their profile.
       - "featured_tech": an array of 3-5 tech stack badges based on their actual languages.
       - "featured_projects": an array of 2-3 project objects using ONLY their real repo names:
           { "name": "RepoName", "description": "Crisp 1-line description", "tech": "Primary Language" }
   - "repo_makeovers": an array of 2-4 repo objects for repos that need presentation fixes:
       { "name": "RepoName", "current_status": "What is lacking", "recommended_action": "How to fix it", "impact": "High" | "Medium" | "Low" }
   - "priority_actions": an array of 3-5 action items prioritized by impact:
       { "impact": "High" | "Medium" | "Low", "action": "Clear action step", "why": "Why it improves presentation" }`;

  const userPrompt = `Generate a simulated profile makeover plan for this GitHub user.

=== PROFILE ===
Username: ${profile.login}
Name: ${profile.name || "Not set"}
Bio: ${profile.bio || "Not set"}
Public repos: ${profile.public_repos}

=== SCORES (0-100) ===
Documentation: ${analysis.scores.documentation}
Activity: ${analysis.scores.activity}
Presentation: ${analysis.scores.presentation}
Projects: ${analysis.scores.projects}
Cleanliness: ${analysis.scores.cleanliness}
Overall: ${analysis.scores.overall}

=== STATS & REPOS ===
Languages: ${JSON.stringify(analysis.stats.languages)}
Top Repos: ${JSON.stringify(analysis.stats.sampleRepos || [])}

=== ISSUES FOUND ===
${analysis.problems.map((p) => `• ${p}`).join("\n")}`;

  try {
    const chatCompletion = await getGroqClient().chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.6,
      max_tokens: 2048,
      response_format: { type: "json_object" },
    });

    const raw = chatCompletion.choices?.[0]?.message?.content;
    if (!raw) throw new Error("Empty Groq makeover response.");

    const parsed = JSON.parse(raw);

    return {
      profile_preview: parsed.profile_preview || { tagline: "", featured_tech: [], featured_projects: [] },
      repo_makeovers: Array.isArray(parsed.repo_makeovers) ? parsed.repo_makeovers : [],
      priority_actions: Array.isArray(parsed.priority_actions) ? parsed.priority_actions : [],
    };
  } catch (err) {
    console.error("Groq makeover service error:", err.message);
    throw err;
  }
}
