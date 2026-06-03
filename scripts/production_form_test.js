// scripts/production_form_test.js
// Run with: node scripts/production_form_test.js
// This script sends test payloads to production endpoints for the Bootcamp lead form
// and the Autodiagnóstico (diagnostic) flow, logging the responses.

const fetch = require('node-fetch');

// Configuration – adjust as needed
const PROD_BASE = process.env.PROD_BASE_URL || 'https://yutopias.com'; // production domain

// Helper to POST JSON
async function postJson(url, data) {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Origin header needed for CORS validation on the PHP APIs
      Origin: PROD_BASE,
    },
    body: JSON.stringify(data),
  });
  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (_) {
    json = null;
  }
  console.log('\nPOST', url);
  console.log('Status:', res.status);
  console.log('Response:', json || text);
  return { status: res.status, json, text };
}

async function testBootcampLead() {
  console.log('\n=== Testing Bootcamp Lead Form ===');
  const payload = {
    name: 'Test User',
    email: 'test.user@example.com',
    company: 'Acme Corp',
    role: 'CTO',
    challenge: 'Testing bootcamp lead form',
    accepted: true,
    submittedAt: Date.now(),
  };
  // The endpoint expects the fields defined in the front‑end component. Adjust if needed.
  await new Promise(r => setTimeout(r, 3000));
    await postJson(`${PROD_BASE}/api/bootcamp-lead.php`, payload);
}

async function testDiagnosticFlow() {
  console.log('\n=== Testing Autodiagnóstico Flow ===');
  // 1️⃣ Init – create a session
  const initRes = await postJson(`${PROD_BASE}/api/diagnostic.php`, { action: 'init', locale: 'es' });
  if (!initRes.json?.sessionId) {
    console.error('Init failed – aborting diagnostic test');
    return;
  }
  const sessionId = initRes.json.sessionId;
  // 2️⃣ Prelead – submit contact info
  await postJson(`${PROD_BASE}/api/diagnostic.php`, {
    action: 'prelead',
    sessionId,
    locale: 'es',
    firstName: 'Test',
    company: 'Acme',
    email: 'test.user@example.com',
    privacyAccepted: true,
  });
  // 3️⃣ Start – select a profile (pick one of the allowed profiles)
  await postJson(`${PROD_BASE}/api/diagnostic.php`, {
    action: 'start',
    sessionId,
    locale: 'es',
    profile: 'promotor_inversor',
  });
  // 4️⃣ Answer – simulate 12 questions with dummy data
  for (let i = 0; i < 12; i++) {
    await postJson(`${PROD_BASE}/api/diagnostic.php`, {
      action: 'answer',
      sessionId,
      questionIndex: i,
      dimension: 'A', // any allowed dimension
      optionIndex: 1,
      optionScore: 30,
    });
  }
  // 5️⃣ Complete – send final score and optional bridge lead data
  const completePayload = {
    action: 'complete',
    sessionId,
    weightedScore: 85,
    scoreOver10: 8.5,
    topRetos: ['Reto 1', 'Reto 2', 'Reto 3'],
    summary: {
      profile: 'promotor_inversor',
      dimensionPerformance: { A: 80, B: 70, C: 60, D: 50 },
    },
    lead: {
      firstName: 'Test',
      lastName: 'User',
      company: 'Acme',
      role: 'CTO',
      email: 'test.user@example.com',
      challenge: 'Testing diagnostic bridge form',
    },
  };
  await postJson(`${PROD_BASE}/api/diagnostic.php`, completePayload);
}

(async () => {
  try {
    await testBootcampLead();
    await testDiagnosticFlow();
    console.log('\nAll tests completed');
  } catch (err) {
    console.error('Error during tests:', err);
  }
})();
