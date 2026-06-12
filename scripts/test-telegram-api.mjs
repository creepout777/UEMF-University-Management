import jwt from "jsonwebtoken";

const API_URL = "http://localhost:8080/api";
const SESSION_SECRET = "super-secret-session-key";
const BOT_SECRET = "uemf-telegram-secret-key";

// 1. Manually sign a JWT for the student user (userId: 4, linkedEntityId: 1)
const studentToken = jwt.sign(
  {
    userId: 4,
    username: "student",
    email: "student@example.com",
    role: "student",
    linkedEntityId: 1,
  },
  SESSION_SECRET
);

console.log("🔑 Generated Student Web JWT:", studentToken);

async function runTest() {
  try {
    // 2. Request a Telegram link token from the Web App's perspective
    console.log("\n1. Requesting Telegram Link Token...");
    const linkRes = await fetch(`${API_URL}/telegram/link-token`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${studentToken}`,
      },
    });
    
    if (!linkRes.ok) {
      throw new Error(`Link token request failed: ${linkRes.status} ${await linkRes.text()}`);
    }
    
    const { token, botUrl, expiresAt } = await linkRes.json();
    console.log("✓ Link Token:", token);
    console.log("✓ Bot Link:", botUrl);
    console.log("✓ Expires At:", expiresAt);

    // 3. Verify and link the Telegram chat ID from the Bot's perspective
    console.log("\n2. Simulating Bot verifying the link token...");
    const verifyRes = await fetch(`${API_URL}/telegram/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Telegram-Bot-Secret": BOT_SECRET,
      },
      body: JSON.stringify({
        token,
        chatId: "987654321", // Dummy telegram chat ID
      }),
    });

    if (!verifyRes.ok) {
      throw new Error(`Verification failed: ${verifyRes.status} ${await verifyRes.text()}`);
    }

    const verifyData = await verifyRes.json();
    console.log("✓ Bot Verification Response:", verifyData);

    // 4. Test Today's Planning Query
    console.log("\n3. Testing GET /telegram/planning/today...");
    const todayRes = await fetch(`${API_URL}/telegram/planning/today?chatId=987654321`, {
      headers: {
        "X-Telegram-Bot-Secret": BOT_SECRET,
      },
    });
    console.log("✓ Today's Planning:", JSON.stringify(await todayRes.json(), null, 2));

    // 5. Test Weekly Planning Query
    console.log("\n4. Testing GET /telegram/planning/week...");
    const weekRes = await fetch(`${API_URL}/telegram/planning/week?chatId=987654321`, {
      headers: {
        "X-Telegram-Bot-Secret": BOT_SECRET,
      },
    });
    console.log("✓ Week's Planning:", JSON.stringify(await weekRes.json(), null, 2));

    // 6. Test Absences Query
    console.log("\n5. Testing GET /telegram/absences...");
    const absRes = await fetch(`${API_URL}/telegram/absences?chatId=987654321`, {
      headers: {
        "X-Telegram-Bot-Secret": BOT_SECRET,
      },
    });
    console.log("✓ Absences Data:", JSON.stringify(await absRes.json(), null, 2));

    // 7. Test Progress Query
    console.log("\n6. Testing GET /telegram/progress...");
    const progRes = await fetch(`${API_URL}/telegram/progress?chatId=987654321`, {
      headers: {
        "X-Telegram-Bot-Secret": BOT_SECRET,
      },
    });
    console.log("✓ Progress Data:", JSON.stringify(await progRes.json(), null, 2));

  } catch (error) {
    console.error("✗ Test failed:", error);
  }
}

runTest();
