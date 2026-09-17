import { Router } from "express";
import { fetchGitHubProfile, fetchGitHubRepos } from "../services/githubService.js";
import { analyzeGitHubData } from "../utils/analyzer.js";
import { generateRoast } from "../services/groqService.js";

const router = Router();

// POST /api/analyze
router.post("/analyze", async (req, res) => {
  try {
    const { username } = req.body;

    // --- Input validation ---------------------------------------------------
    if (!username || typeof username !== "string") {
      return res.status(400).json({
        error: "Missing or invalid 'username' in request body.",
      });
    }

    const sanitized = username.trim();
    if (sanitized.length === 0 || sanitized.length > 39) {
      return res.status(400).json({
        error: "GitHub usernames must be 1–39 characters long.",
      });
    }

    // GitHub usernames: alphanumeric + hyphens, no leading/trailing hyphens
    if (!/^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(sanitized)) {
      return res.status(400).json({
        error: "Invalid GitHub username format.",
      });
    }

    // --- Fetch GitHub data --------------------------------------------------
    const profile = await fetchGitHubProfile(sanitized);
    const repos = await fetchGitHubRepos(sanitized);

    // --- Analyse locally ----------------------------------------------------
    const analysis = analyzeGitHubData(profile, repos);

    // --- Generate roast via Groq -------------------------------------------
    const { roast, suggestions } = await generateRoast(profile, analysis);

    // --- Build response -----------------------------------------------------
    return res.json({
      profile: {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar_url,
        url: profile.html_url,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.created_at,
      },
      stats: analysis.stats,
      scores: analysis.scores,
      problems: analysis.problems,
      suggestions,
      roast,
    });
  } catch (err) {
    console.error("POST /api/analyze error:", err.message);

    // Propagate structured errors from services
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
});

export default router;
