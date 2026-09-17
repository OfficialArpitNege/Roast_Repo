// ---------------------------------------------------------------------------
// Local GitHub data analyzer
// ---------------------------------------------------------------------------
// All scoring happens here — Groq only receives the *results* of this
// analysis so it can never invent GitHub facts.
// ---------------------------------------------------------------------------

const DAYS = 24 * 60 * 60 * 1000;
const NOW = () => Date.now();

// ---- helpers ---------------------------------------------------------------

/** Days since a date string. */
function daysSince(dateStr) {
  return Math.floor((NOW() - new Date(dateStr).getTime()) / DAYS);
}

/** Clamp a value between 0 and 100. */
function clamp(v) {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/** Check if a repo name uses good naming conventions. */
function isWellNamed(name) {
  // Penalise: all-lowercase mashed words, random chars, default names
  const bad = /^(untitled|test|repo|project|my-?project|asdfjkl|temp|foo|bar|baz|new-?repo)/i;
  if (bad.test(name)) return false;
  // Reward: kebab-case or snake_case with meaningful length
  if (/^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)+$/.test(name) && name.length >= 5) return true;
  // Neutral for everything else
  return name.length >= 3;
}

// ---- category scorers ------------------------------------------------------

function scoreDocumentation(repos) {
  if (repos.length === 0) return { score: 0, problems: ["No repositories to evaluate."] };

  const problems = [];
  let points = 0;
  let noDescription = 0;
  let noReadmeProxy = 0; // we approximate README presence via default_branch + size

  for (const r of repos) {
    // Description
    if (r.description && r.description.trim().length > 0) {
      points += 1;
    } else {
      noDescription++;
    }

    // README heuristic: repos with size === 0 almost certainly have no README;
    // repos that are forks we weigh less.
    if (r.size === 0) {
      noReadmeProxy++;
    } else if (r.has_pages || r.homepage) {
      points += 0.5; // bonus for having a site / homepage link
    }
  }

  if (noDescription > 0) {
    problems.push(`${noDescription} repo(s) have no description.`);
  }
  if (noReadmeProxy > 0) {
    problems.push(`${noReadmeProxy} repo(s) appear to be completely empty (likely no README).`);
  }

  const maxPoints = repos.length * 1.5; // 1 for desc + 0.5 bonus potential
  const score = clamp((points / maxPoints) * 100);
  return { score, problems };
}

function scoreActivity(repos) {
  if (repos.length === 0) return { score: 0, problems: ["No repositories to evaluate."] };

  const problems = [];
  let activeCount = 0;
  let staleCount = 0;
  let ancientCount = 0;

  for (const r of repos) {
    const d = daysSince(r.pushed_at || r.updated_at);
    if (d <= 90) activeCount++;
    else if (d <= 365) staleCount++;
    else ancientCount++;
  }

  if (staleCount > 0) {
    problems.push(`${staleCount} repo(s) haven't been updated in 3–12 months.`);
  }
  if (ancientCount > 0) {
    problems.push(`${ancientCount} repo(s) haven't been updated in over a year.`);
  }
  if (activeCount === 0) {
    problems.push("No repositories updated in the last 90 days.");
  }

  // Weighted: active repos matter most
  const weight = activeCount * 3 + staleCount * 1 + ancientCount * 0;
  const maxWeight = repos.length * 3;
  const score = clamp((weight / maxWeight) * 100);
  return { score, problems, activeCount, staleCount, ancientCount };
}

function scorePresentation(profile, repos) {
  const problems = [];
  let points = 0;
  const maxPoints = 5;

  // Profile checks
  if (profile.name) points += 1;
  else problems.push("Profile has no display name set.");

  if (profile.bio) points += 1;
  else problems.push("Profile has no bio.");

  if (profile.blog || profile.twitter_username || profile.company) points += 0.5;
  if (profile.avatar_url && !profile.avatar_url.includes("identicon")) points += 0.5;

  // Repo naming
  const wellNamed = repos.filter((r) => isWellNamed(r.name)).length;
  const namingRatio = repos.length > 0 ? wellNamed / repos.length : 0;
  points += namingRatio * 2; // up to 2 points

  if (namingRatio < 0.5) {
    problems.push("Many repositories have poor or generic names.");
  }

  const score = clamp((points / maxPoints) * 100);
  return { score, problems };
}

function scoreProjects(profile, repos) {
  const problems = [];
  let points = 0;
  const repoCount = repos.length;

  // Variety of languages
  const languages = new Set();
  repos.forEach((r) => {
    if (r.language) languages.add(r.language);
  });

  const totalStars = repos.reduce((s, r) => s + (r.stargazers_count || 0), 0);
  const totalForks = repos.reduce((s, r) => s + (r.forks_count || 0), 0);

  // Scoring heuristics
  if (repoCount >= 10) points += 2;
  else if (repoCount >= 5) points += 1;
  else problems.push(`Only ${repoCount} public repo(s) — a sparse portfolio.`);

  if (languages.size >= 4) points += 2;
  else if (languages.size >= 2) points += 1;
  else problems.push("Very limited language diversity.");

  if (totalStars >= 10) points += 1;
  if (totalForks >= 5) points += 0.5;

  // Original vs forked
  const originals = repos.filter((r) => !r.fork).length;
  const forkRatio = repoCount > 0 ? (repoCount - originals) / repoCount : 0;
  if (forkRatio > 0.6) {
    problems.push(
      `${Math.round(forkRatio * 100)}% of repos are forks — not much original work visible.`
    );
  } else {
    points += 1;
  }

  const maxPoints = 6.5;
  const score = clamp((points / maxPoints) * 100);
  return {
    score,
    problems,
    repoCount,
    originalCount: originals,
    forkCount: repoCount - originals,
    languages: [...languages],
    totalStars,
    totalForks,
  };
}

function scoreCleanliness(repos) {
  if (repos.length === 0) return { score: 100, problems: [] };

  const problems = [];
  let issueCount = 0;
  const emptyRepos = [];
  const abandoned = [];

  for (const r of repos) {
    // Empty repos
    if (r.size === 0) {
      emptyRepos.push(r.name);
      issueCount++;
    }

    // Abandoned: > 2 years old, never starred, tiny size, not a fork
    const age = daysSince(r.pushed_at || r.updated_at);
    if (
      age > 730 &&
      r.stargazers_count === 0 &&
      r.size < 100 &&
      !r.fork
    ) {
      abandoned.push(r.name);
      issueCount++;
    }
  }

  if (emptyRepos.length > 0) {
    problems.push(
      `${emptyRepos.length} empty repo(s): ${emptyRepos.slice(0, 5).join(", ")}${emptyRepos.length > 5 ? "…" : ""}`
    );
  }

  if (abandoned.length > 0) {
    problems.push(
      `${abandoned.length} abandoned repo(s): ${abandoned.slice(0, 5).join(", ")}${abandoned.length > 5 ? "…" : ""}`
    );
  }

  const issueRatio = issueCount / repos.length;
  const score = clamp((1 - issueRatio) * 100);
  return { score, problems, emptyCount: emptyRepos.length, abandonedCount: abandoned.length };
}

// ---- public entry point ----------------------------------------------------

/**
 * Analyse a GitHub profile + repos and return scores, stats, and problems.
 *
 * @param {object}   profile – GitHub user object from the API
 * @param {object[]} repos   – Array of repository objects
 * @returns {{ scores: object, stats: object, problems: string[] }}
 */
export function analyzeGitHubData(profile, repos) {
  const doc = scoreDocumentation(repos);
  const act = scoreActivity(repos);
  const pres = scorePresentation(profile, repos);
  const proj = scoreProjects(profile, repos);
  const clean = scoreCleanliness(repos);

  const overall = clamp(
    doc.score * 0.2 +
      act.score * 0.25 +
      pres.score * 0.15 +
      proj.score * 0.25 +
      clean.score * 0.15
  );

  // Merge all problems
  const problems = [
    ...doc.problems,
    ...act.problems,
    ...pres.problems,
    ...proj.problems,
    ...clean.problems,
  ];

  // Aggregate stats
  const stats = {
    totalRepos: repos.length,
    originalRepos: proj.originalCount,
    forkedRepos: proj.forkCount,
    languages: proj.languages,
    totalStars: proj.totalStars,
    totalForks: proj.totalForks,
    activeRepos: act.activeCount,
    staleRepos: act.staleCount,
    ancientRepos: act.ancientCount,
    emptyRepos: clean.emptyCount,
    abandonedRepos: clean.abandonedCount,
    accountAgeDays: daysSince(profile.created_at),
  };

  const scores = {
    documentation: doc.score,
    activity: act.score,
    presentation: pres.score,
    projects: proj.score,
    cleanliness: clean.score,
    overall,
  };

  return { scores, stats, problems };
}
