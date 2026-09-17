import dotenv from "dotenv";
dotenv.config();

import Groq from "groq-sdk";

const g = new Groq({ apiKey: process.env.GROQ_API_KEY });
const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

console.log("Testing model:", model);

// Test 1: JSON mode
try {
  const res = await g.chat.completions.create({
    model,
    messages: [{ role: "user", content: 'Reply with valid JSON only: {"greeting": "hello"}' }],
    max_tokens: 30,
    response_format: { type: "json_object" },
  });
  console.log("✅ JSON mode works:", res.choices[0].message.content);
} catch (err) {
  console.error("❌ JSON mode failed:", err.status, err.message);
  console.log("   Will try without response_format...");
  
  try {
    const res2 = await g.chat.completions.create({
      model,
      messages: [{ role: "user", content: 'Reply with valid JSON only, no other text: {"greeting": "hello"}' }],
      max_tokens: 30,
    });
    console.log("✅ Plain mode works:", res2.choices[0].message.content);
    console.log("   → Need to remove response_format from groqService.js");
  } catch (err2) {
    console.error("❌ Plain mode also failed:", err2.status, err2.message);
  }
}
