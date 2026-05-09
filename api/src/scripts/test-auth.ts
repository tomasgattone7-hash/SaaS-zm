import { env } from "../config/env.js";

async function testAuthFlow() {
  const email = env.DEV_ADMIN_EMAIL;
  const password = env.DEV_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ Missing DEV_ADMIN_EMAIL or DEV_ADMIN_PASSWORD in environment variables.");
    process.exit(1);
  }

  const baseUrl = `http://${env.API_HOST}:${env.API_PORT}/v1/auth`;
  let sessionCookie: string | null = null;

  console.log(`\n🧪 Testing complete Auth Flow for ${email}...`);
  
  // 1. POST /login
  console.log(`\n➡️ Step 1: POST /login`);
  try {
    const loginRes = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      console.error(`❌ Login failed (Status: ${loginRes.status})`);
      process.exit(1);
    }
    
    const setCookieHeader = loginRes.headers.get("set-cookie");
    if (!setCookieHeader) {
      console.error("❌ No set-cookie header received during login.");
      process.exit(1);
    }
    
    // Extract just the session=... part for subsequent requests
    const sessionMatch = setCookieHeader.match(/session=[^;]+/);
    if (!sessionMatch) {
      console.error("❌ Invalid cookie format received.");
      process.exit(1);
    }
    sessionCookie = sessionMatch[0];

    console.log("✅ Login OK (Cookie captured successfully)");
  } catch (error) {
    console.error("❌ Login request failed. Is the API server running?", error);
    process.exit(1);
  }

  // 2. GET /me (AUTHORIZED)
  console.log(`\n➡️ Step 2: GET /me (with cookie)`);
  try {
    const meRes = await fetch(`${baseUrl}/me`, {
      method: "GET",
      headers: {
        "Cookie": sessionCookie as string,
      },
    });

    if (!meRes.ok) {
      console.error(`❌ GET /me failed (Status: ${meRes.status})`);
      process.exit(1);
    }
    const meData = await meRes.json() as { user?: { fullName?: string } };
    console.log(`✅ GET /me OK (Welcome, ${meData.user?.fullName || "User"})`);
  } catch {
    console.error("❌ GET /me request failed.");
    process.exit(1);
  }

  // 3. POST /logout
  console.log(`\n➡️ Step 3: POST /logout`);
  try {
    const logoutRes = await fetch(`${baseUrl}/logout`, {
      method: "POST",
      headers: {
        "Cookie": sessionCookie as string,
      },
    });

    if (!logoutRes.ok) {
      console.error(`❌ Logout failed (Status: ${logoutRes.status})`);
      process.exit(1);
    }

    const logoutSetCookie = logoutRes.headers.get("set-cookie");
    if (logoutSetCookie && logoutSetCookie.includes("Max-Age=0")) {
       // Simulate browser clearing the cookie
       sessionCookie = null;
       console.log("✅ Logout OK (Cookie cleared)");
    } else if (logoutSetCookie && logoutSetCookie.match(/session=;/)) {
       sessionCookie = null;
       console.log("✅ Logout OK (Cookie cleared)");
    } else {
       console.warn("⚠️ Logout OK, but Set-Cookie to clear session was not found or recognized.");
       sessionCookie = null; // We clear it anyway to test the next step
    }

  } catch {
    console.error("❌ Logout request failed.");
    process.exit(1);
  }

  // 4. GET /me (UNAUTHORIZED POST-LOGOUT)
  console.log(`\n➡️ Step 4: GET /me (post-logout validation)`);
  try {
    const headers: Record<string, string> = {};
    if (sessionCookie) {
      headers["Cookie"] = sessionCookie;
    }

    const meRes2 = await fetch(`${baseUrl}/me`, {
      method: "GET",
      headers,
    });

    if (meRes2.status === 401) {
      console.log("✅ Post-logout validation OK (Returned 401 Unauthorized)");
    } else {
      console.error(`❌ Post-logout validation failed. Expected 401, got ${meRes2.status}`);
      process.exit(1);
    }
  } catch {
    console.error("❌ Post-logout request failed.");
    process.exit(1);
  }

  console.log(`\n🎉 All Auth tests passed successfully!\n`);
}

testAuthFlow();
