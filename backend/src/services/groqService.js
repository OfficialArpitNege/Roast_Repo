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
