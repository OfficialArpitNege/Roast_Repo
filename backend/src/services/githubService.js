// ---------------------------------------------------------------------------
// GitHub REST API service
// ---------------------------------------------------------------------------
// Uses the unauthenticated API by default (60 req/hour).
// Set GITHUB_TOKEN in .env to bump the limit to 5 000 req/hour.
// ---------------------------------------------------------------------------

/**
 * Build common headers for GitHub API requests.
 */
function githubHeaders() {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "RoastMyGitHub/1.0",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  return headers;
}

/**
 * Tiny wrapper around `fetch` that throws structured errors.
 */
async function githubFetch(url) {
  const res = await fetch(url, { headers: githubHeaders() });

  // Rate-limit hit
  if (res.status === 403) {
    const resetEpoch = res.headers.get("x-ratelimit-reset");
    const resetDate = resetEpoch
      ? new Date(resetEpoch * 1000).toISOString()
      : "unknown";

    const err = new Error(
      `GitHub API rate limit exceeded. Resets at ${resetDate}. ` +
        "Add a GITHUB_TOKEN to .env to increase the limit."
    );
    err.statusCode = 429;
    throw err;
  }

  if (res.status === 404) {
    const err = new Error("GitHub user not found.");
    err.statusCode = 404;
    throw err;
  }

  if (!res.ok) {
    const err = new Error(`GitHub API error: ${res.status} ${res.statusText}`);
    err.statusCode = 502;
    throw err;
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Public helpers
// ---------------------------------------------------------------------------

/**
 * Fetch a user's public profile.
 * @param {string} username
 * @returns {Promise<object>} GitHub user object
 */
export async function fetchGitHubProfile(username) {
  return githubFetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
}

/**
 * Fetch up to 100 of a user's public repositories (sorted by most recently
 * pushed so the "activity" analysis has the freshest data on top).
 * @param {string} username
 * @returns {Promise<object[]>} Array of repository objects
 */
export async function fetchGitHubRepos(username) {
  return githubFetch(
    `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=pushed&direction=desc`
  );
}
