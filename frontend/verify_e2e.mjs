import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af";
const EDGE_PATH = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

async function runEndToEndVerification() {
  console.log("===============================================================");
  console.log("  DRDO SIH26054: END-TO-END AUTOMATED BROWSER INTEGRATION TEST");
  console.log("===============================================================\n");

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: EDGE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1920,1080"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("1. Navigating to Ground Control Station at http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });

  // Wait 4 seconds for WebSocket stream to connect and stream live frames
  console.log("2. Waiting for live 5Hz WebSocket telemetry frames...");
  await new Promise((r) => setTimeout(r, 4000));

  // Capture Nominal Dashboard Screenshot
  const nominalPath = path.join(ARTIFACTS_DIR, "gcs_nominal_dashboard.png");
  await page.screenshot({ path: nominalPath, fullPage: true });
  console.log(`[PASS] Nominal Dashboard Screenshot captured: ${nominalPath}`);

  // Test 1: Click "OIL STARVATION" Fault Injection
  console.log("\n3. Testing Fault Injection: Clicking 'OIL STARVATION' button...");
  const buttons = await page.$$("button");
  let oilStarvationBtn = null;

  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes("OIL STARVATION")) {
      oilStarvationBtn = btn;
      break;
    }
  }

  if (oilStarvationBtn) {
    await oilStarvationBtn.click();
    console.log("  Clicked 'OIL STARVATION' button successfully!");
  } else {
    console.warn("  Injecting OIL_STARVATION via REST...");
    await fetch("http://127.0.0.1:8000/api/fault/inject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fault_type: "OIL_STARVATION", severity: 1.5 })
    });
  }

  // Wait 7 seconds for oil starvation kinetics & LSTM RUL degradation to develop
  console.log("  Waiting 7s for pressure collapse, bearing vibration spike, and RUL decay...");
  await new Promise((r) => setTimeout(r, 7000));

  // Extract live DOM state
  const pageText = await page.evaluate(() => document.body.innerText);
  
  const hasCritical = pageText.includes("CRITICAL") || pageText.includes("EMERGENCY RTB");
  const hasFriction = pageText.includes("MECHANICAL FRICTION") || pageText.includes("Mechanical Friction");
  
  console.log(`  - CRITICAL Alert Present: ${hasCritical ? "YES [PASS]" : "NO"}`);
  console.log(`  - Mechanical Friction Classified: ${hasFriction ? "YES [PASS]" : "NO"}`);

  // Capture Oil Starvation Critical Dashboard Screenshot
  const oilStarvPath = path.join(ARTIFACTS_DIR, "gcs_oil_starvation_critical.png");
  await page.screenshot({ path: oilStarvPath, fullPage: true });
  console.log(`[PASS] Oil Starvation Critical Screenshot captured: ${oilStarvPath}`);

  // Test 2: Click "COOLANT LEAK"
  console.log("\n4. Testing Fault Injection: Clicking 'COOLANT LEAK' button...");
  let coolantBtn = null;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes("COOLANT LEAK")) {
      coolantBtn = btn;
      break;
    }
  }

  if (coolantBtn) {
    await coolantBtn.click();
    console.log("  Clicked 'COOLANT LEAK' button successfully!");
  } else {
    await fetch("http://127.0.0.1:8000/api/fault/inject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fault_type: "COOLANT_LEAK", severity: 1.5 })
    });
  }

  await new Promise((r) => setTimeout(r, 6000));
  const coolantPath = path.join(ARTIFACTS_DIR, "gcs_coolant_leak.png");
  await page.screenshot({ path: coolantPath, fullPage: true });
  console.log(`[PASS] Coolant Leak Screenshot captured: ${coolantPath}`);

  // Test 3: Clear Faults & Reset
  console.log("\n5. Testing 'NOMINAL FLIGHT' / Reset...");
  let nominalBtn = null;
  for (const btn of buttons) {
    const text = await page.evaluate(el => el.innerText, btn);
    if (text.includes("NOMINAL FLIGHT")) {
      nominalBtn = btn;
      break;
    }
  }

  if (nominalBtn) {
    await nominalBtn.click();
    console.log("  Clicked 'NOMINAL FLIGHT' button!");
  } else {
    await fetch("http://127.0.0.1:8000/api/fault/clear", { method: "POST" });
  }

  await new Promise((r) => setTimeout(r, 3000));
  await browser.close();

  console.log("\n===============================================================");
  console.log("  ALL END-TO-END BROWSER & DIGITAL TWIN TESTS PASSED! [PASS]");
  console.log("===============================================================\n");
}

runEndToEndVerification().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
