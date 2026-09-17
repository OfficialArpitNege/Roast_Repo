// ---------------------------------------------------------------------------
// Backend integration test suite
// ---------------------------------------------------------------------------
// Run: node src/test.js
// Requires the server to be running on localhost:3000
// ---------------------------------------------------------------------------

const BASE = "http://localhost:3000";

async function test(name, fn) {
  try {
    const result = await fn();
    console.log(`✅ PASS: ${name}`);
    return result;
  } catch (err) {
    console.error(`❌ FAIL: ${name}`);
    console.error(`   ${err.message}\n`);
    return null;
  }
}

async function run() {
  console.log("=".repeat(60));
  console.log("  ROAST MY GITHUB — BACKEND TEST SUITE");
  console.log("=".repeat(60));
  console.log();

  // ---- 1. Root health check -----------------------------------------------
  await test("GET / — root health check", async () => {
    const res = await fetch(`${BASE}/`);
    const data = await res.json();
    if (data.status !== "ok") throw new Error(`Expected status "ok", got "${data.status}"`);
    console.log("   Response:", JSON.stringify(data));
  });

  // ---- 2. /api/health endpoint -------------------------------------------
  await test("GET /api/health — health endpoint", async () => {
    const res = await fetch(`${BASE}/api/health`);
    const data = await res.json();
    if (data.status !== "ok") throw new Error(`Expected status "ok", got "${data.status}"`);
    if (!data.env.groqKeySet) throw new Error("GROQ_API_KEY not set!");
    console.log("   Model:", data.env.groqModel);
    console.log("   Groq key set:", data.env.groqKeySet);
    console.log("   Uptime:", Math.round(data.uptime) + "s");
  });

  // ---- 3. 404 handler ----------------------------------------------------
  await test("GET /nonexistent — 404 handler", async () => {
    const res = await fetch(`${BASE}/nonexistent`);
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    const data = await res.json();
    if (!data.error) throw new Error("Expected error message in response");
    console.log("   Response:", JSON.stringify(data));
  });

  // ---- 4. Missing username ------------------------------------------------
  await test("POST /api/analyze — missing username (400)", async () => {
    const res = await fetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const data = await res.json();
    console.log("   Error:", data.error);
  });

  // ---- 5. Invalid username format -----------------------------------------
  await test("POST /api/analyze — invalid username format (400)", async () => {
    const res = await fetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "--bad--name--" }),
    });
    if (res.status !== 400) throw new Error(`Expected 400, got ${res.status}`);
    const data = await res.json();
    console.log("   Error:", data.error);
  });

  // ---- 6. Non-existent GitHub user ----------------------------------------
  await test("POST /api/analyze — non-existent user (404)", async () => {
    const res = await fetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "thisuserdefinitelydoesnotexist99999" }),
    });
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    const data = await res.json();
    console.log("   Error:", data.error);
  });

  // ---- 7. Full end-to-end with a real user --------------------------------
  console.log("\n⏳ Running full end-to-end test (this calls GitHub + Groq, may take 10-20s)...\n");

  const fullResult = await test("POST /api/analyze — full e2e with 'torvalds'", async () => {
    const res = await fetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: "torvalds" }),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(`HTTP ${res.status}: ${errData.error || "Unknown error"}`);
    }

    const data = await res.json();

    // Validate response structure
    const required = ["profile", "stats", "scores", "problems", "suggestions", "roast"];
    for (const key of required) {
      if (!(key in data)) throw new Error(`Missing key: "${key}"`);
    }

    // Validate profile
    if (data.profile.username !== "torvalds") {
      throw new Error(`Expected username "torvalds", got "${data.profile.username}"`);
    }

    // Validate scores
    const scoreKeys = ["documentation", "activity", "presentation", "projects", "cleanliness", "overall"];
    for (const key of scoreKeys) {
      if (typeof data.scores[key] !== "number") throw new Error(`scores.${key} is not a number`);
      if (data.scores[key] < 0 || data.scores[key] > 100) {
        throw new Error(`scores.${key} = ${data.scores[key]} is out of 0-100 range`);
      }
    }

    // Validate roast
    if (typeof data.roast !== "string" || data.roast.length < 20) {
      throw new Error("Roast is missing or too short");
    }

    // Validate suggestions
    if (!Array.isArray(data.suggestions) || data.suggestions.length === 0) {
      throw new Error("Suggestions array is missing or empty");
    }

    // Check no API key leaked
    const responseStr = JSON.stringify(data);
    if (responseStr.includes("gsk_")) {
      throw new Error("⚠️  GROQ API KEY LEAKED IN RESPONSE!");
    }

    return data;
  });

  // ---- Print summary of successful e2e response --------------------------
  if (fullResult) {
    console.log("\n" + "-".repeat(60));
    console.log("  FULL RESPONSE SUMMARY");
    console.log("-".repeat(60));
    console.log("\n📋 Profile:");
    console.log(`   Username: ${fullResult.profile.username}`);
    console.log(`   Name: ${fullResult.profile.name}`);
    console.log(`   Public repos: ${fullResult.profile.publicRepos}`);
    console.log(`   Followers: ${fullResult.profile.followers}`);

    console.log("\n📊 Scores:");
    for (const [k, v] of Object.entries(fullResult.scores)) {
      const bar = "█".repeat(Math.round(v / 5)) + "░".repeat(20 - Math.round(v / 5));
      console.log(`   ${k.padEnd(15)} ${bar} ${v}/100`);
    }

    console.log("\n📈 Stats:");
    console.log(`   Total repos: ${fullResult.stats.totalRepos}`);
    console.log(`   Languages: ${fullResult.stats.languages?.join(", ") || "none"}`);
    console.log(`   Stars: ${fullResult.stats.totalStars}`);
    console.log(`   Active (90d): ${fullResult.stats.activeRepos}`);

    console.log("\n⚠️  Problems found:", fullResult.problems.length);
    fullResult.problems.slice(0, 5).forEach((p) => console.log(`   • ${p}`));

    console.log("\n💡 Suggestions:", fullResult.suggestions.length);
    fullResult.suggestions.slice(0, 5).forEach((s) => console.log(`   • ${s}`));

    console.log("\n🔥 Roast (first 300 chars):");
    console.log(`   ${fullResult.roast.slice(0, 300)}...`);

    console.log("\n🔒 Security: No API key found in response ✅");
  }

  console.log("\n" + "=".repeat(60));
  console.log("  TEST SUITE COMPLETE");
  console.log("=".repeat(60));
}

run().catch((err) => {
  console.error("Test runner crashed:", err);
  process.exit(1);
});
