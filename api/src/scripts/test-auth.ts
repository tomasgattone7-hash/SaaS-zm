import { env } from "../config/env.js";

async function testLogin() {
  const email = env.DEV_ADMIN_EMAIL;
  const password = env.DEV_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Missing DEV_ADMIN_EMAIL or DEV_ADMIN_PASSWORD in environment variables.");
    process.exit(1);
  }

  const url = `http://${env.API_HOST}:${env.API_PORT}/v1/auth/login`;

  console.log(`Testing login for ${email} at ${url}...`);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log("✅ Login successful!");
      console.log("Response:", data);
      
      const cookies = response.headers.get("set-cookie");
      if (cookies) {
        console.log("✅ Received Set-Cookie header.");
      } else {
        console.warn("⚠️ No Set-Cookie header received.");
      }
    } else {
      console.error("❌ Login failed.");
      console.error("Status:", response.status);
      console.error("Response:", data);
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Request failed. Is the API server running?", error);
    process.exit(1);
  }
}

testLogin();
