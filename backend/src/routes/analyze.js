import { Router } from "express";
import { fetchGitHubProfile, fetchGitHubRepos } from "../services/githubService.js";
import { analyzeGitHubData } from "../utils/analyzer.js";
import { generateRoast, generateRecruiterAnalysis, generateMakeoverPlan } from "../services/groqService.js";

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

    // --- Compute Estimated Potential Score deterministically -----------------
    const currentOverall = analysis.scores.overall;
    const potentialScore = Math.min(98, Math.round(currentOverall + (100 - currentOverall) * 0.65));

    // --- Generate roast, recruiter, and makeover in parallel ----------------
    let roastData = { roast: "Could not generate roast.", suggestions: [] };
    let recruiterData = null;
    let makeoverData = null;

    const [roastRes, recruiterRes, makeoverRes] = await Promise.allSettled([
      generateRoast(profile, analysis),
      generateRecruiterAnalysis(profile, analysis),
      generateMakeoverPlan(profile, analysis),
    ]);

    if (roastRes.status === "fulfilled") {
      roastData = roastRes.value;
    } else {
      console.error("Roast generation failed:", roastRes.reason?.message || roastRes.reason);
    }

    if (recruiterRes.status === "fulfilled") {
      recruiterData = recruiterRes.value;
    } else {
      console.error("Recruiter analysis generation failed:", recruiterRes.reason?.message || recruiterRes.reason);
    }

    if (makeoverRes.status === "fulfilled") {
      makeoverData = {
        ...makeoverRes.value,
        potential_score: potentialScore,
      };
    } else {
      console.error("Makeover generation failed:", makeoverRes.reason?.message || makeoverRes.reason);
      makeoverData = {
        potential_score: potentialScore,
        profile_preview: {
          tagline: `Full-stack developer building projects with ${analysis.stats.languages?.slice(0, 3).join(", ") || "code"}.`,
          featured_tech: analysis.stats.languages || [],
          featured_projects: (analysis.stats.sampleRepos || []).slice(0, 3).map((r) => ({
            name: r.name,
            description: r.description || "Public repository",
            tech: r.language || "Code",
          })),
        },
        repo_makeovers: [],
        priority_actions: analysis.problems.map((prob, i) => ({
          impact: i === 0 ? "High" : i === 1 ? "Medium" : "Low",
          action: prob,
          why: "Improves overall profile presentation & completeness.",
        })),
      };
    }

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
      suggestions: roastData.suggestions,
      roast: roastData.roast,
      recruiter: recruiterData,
      makeover: makeoverData,
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
