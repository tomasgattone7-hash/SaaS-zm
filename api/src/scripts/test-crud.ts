import { env } from "../config/env.js";

async function testCrud() {
  const email = env.DEV_ADMIN_EMAIL;
  const password = env.DEV_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("❌ Missing DEV_ADMIN_EMAIL or DEV_ADMIN_PASSWORD");
    process.exit(1);
  }

  const baseUrl = `http://${env.API_HOST}:${env.API_PORT}/v1`;
  let sessionCookie: string | null = null;

  console.log(`\n🧪 Testing CRUD Flow for ${email}...`);
  
  // 1. LOGIN
  console.log(`\n➡️ Step 1: POST /auth/login`);
  try {
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      console.error(`❌ Login failed (${loginRes.status})`);
      process.exit(1);
    }
    
    const setCookie = loginRes.headers.get("set-cookie");
    if (!setCookie) throw new Error("No cookie");
    sessionCookie = setCookie.match(/session=[^;]+/)?.[0] || null;
    console.log("✅ Login OK");
  } catch (err) {
    console.error("❌ Login error", err);
    process.exit(1);
  }

  const authHeaders = {
    "Content-Type": "application/json",
    "Cookie": sessionCookie as string,
  };

  // 2. CREATE CUSTOMER
  let customerId: string;
  console.log(`\n➡️ Step 2: POST /customers`);
  const createCustomerRes = await fetch(`${baseUrl}/customers`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Test Customer", email: "test@customer.com" }),
  });
  if (createCustomerRes.ok) {
    const data = await createCustomerRes.json() as { data: { id: string } };
    customerId = data.data.id;
    console.log(`✅ Customer created (ID: ${customerId})`);
  } else {
    console.error("❌ Create customer failed", await createCustomerRes.text());
    process.exit(1);
  }

  // 3. GET CUSTOMERS
  console.log(`\n➡️ Step 3: GET /customers`);
  const getCustomersRes = await fetch(`${baseUrl}/customers`, {
    method: "GET",
    headers: authHeaders,
  });
  if (getCustomersRes.ok) {
    const data = await getCustomersRes.json() as { data: unknown[] };
    console.log(`✅ Listed ${data.data.length} customers.`);
  } else {
    console.error("❌ Get customers failed", await getCustomersRes.text());
    process.exit(1);
  }

  // 4. EDIT CUSTOMER
  console.log(`\n➡️ Step 4: PATCH /customers/${customerId}`);
  const editCustomerRes = await fetch(`${baseUrl}/customers/${customerId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ notes: "Updated notes" }),
  });
  if (editCustomerRes.ok) {
    console.log(`✅ Customer updated successfully.`);
  } else {
    console.error("❌ Edit customer failed", await editCustomerRes.text());
    process.exit(1);
  }

  // 5. CREATE SUPPLIER
  let supplierId: string;
  console.log(`\n➡️ Step 5: POST /suppliers`);
  const createSupplierRes = await fetch(`${baseUrl}/suppliers`, {
    method: "POST",
    headers: authHeaders,
    body: JSON.stringify({ name: "Test Supplier", phone: "12345678" }),
  });
  if (createSupplierRes.ok) {
    const data = await createSupplierRes.json() as { data: { id: string } };
    supplierId = data.data.id;
    console.log(`✅ Supplier created (ID: ${supplierId})`);
  } else {
    console.error("❌ Create supplier failed", await createSupplierRes.text());
    process.exit(1);
  }

  // 6. GET SUPPLIERS
  console.log(`\n➡️ Step 6: GET /suppliers`);
  const getSuppliersRes = await fetch(`${baseUrl}/suppliers`, {
    method: "GET",
    headers: authHeaders,
  });
  if (getSuppliersRes.ok) {
    const data = await getSuppliersRes.json() as { data: unknown[] };
    console.log(`✅ Listed ${data.data.length} suppliers.`);
  } else {
    console.error("❌ Get suppliers failed", await getSuppliersRes.text());
    process.exit(1);
  }

  // 7. EDIT SUPPLIER
  console.log(`\n➡️ Step 7: PATCH /suppliers/${supplierId}`);
  const editSupplierRes = await fetch(`${baseUrl}/suppliers/${supplierId}`, {
    method: "PATCH",
    headers: authHeaders,
    body: JSON.stringify({ status: "inactive" }),
  });
  if (editSupplierRes.ok) {
    console.log(`✅ Supplier updated successfully.`);
  } else {
    console.error("❌ Edit supplier failed", await editSupplierRes.text());
    process.exit(1);
  }

  console.log(`\n🎉 All CRUD tests passed successfully!\n`);
}

testCrud();
