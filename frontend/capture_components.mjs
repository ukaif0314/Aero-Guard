import puppeteer from "puppeteer-core";
import fs from "fs";
import path from "path";

const ARTIFACTS_DIR = "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af";
const EDGE_PATH = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";

async function captureComponentScreenshots() {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: EDGE_PATH,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-gpu", "--window-size=1920,1080"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  console.log("Navigating to http://localhost:3000...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise((r) => setTimeout(r, 4000)); // wait for live websocket

  // Capture Header HUD
  const headerEl = await page.$("header");
  if (headerEl) {
    await headerEl.screenshot({ path: path.join(ARTIFACTS_DIR, "hud_header_module.png") });
    console.log("Captured: hud_header_module.png");
  }

  // Capture Main Sections
  const divs = await page.$$("main > div > div");
  // div 0: HealthBanner
  // div 1: CylinderThermalGrid
  // div 2: Charts & Advisory Grid
  // div 3: FaultDeck

  if (divs.length >= 4) {
    await divs[0].screenshot({ path: path.join(ARTIFACTS_DIR, "health_banner_module.png") });
    console.log("Captured: health_banner_module.png");

    await divs[1].screenshot({ path: path.join(ARTIFACTS_DIR, "cylinder_thermal_module.png") });
    console.log("Captured: cylinder_thermal_module.png");

    // Inside row 3: Charts (col 1) and Advisory (col 2)
    const subCols = await divs[2].$$(":scope > div");
    if (subCols.length >= 2) {
      await subCols[0].screenshot({ path: path.join(ARTIFACTS_DIR, "telemetry_charts_module.png") });
      console.log("Captured: telemetry_charts_module.png");

      await subCols[1].screenshot({ path: path.join(ARTIFACTS_DIR, "advisory_terminal_module.png") });
      console.log("Captured: advisory_terminal_module.png");
    }

    await divs[3].screenshot({ path: path.join(ARTIFACTS_DIR, "fault_deck_and_throttle_module.png") });
    console.log("Captured: fault_deck_and_throttle_module.png");
  }

  // Also capture Throttle slider in action
  const throttleInput = await page.$("input[type=range]");
  if (throttleInput) {
    // click TAKEOFF (100%)
    const buttons = await page.$$("button");
    for (const b of buttons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text.includes("TAKEOFF")) {
        await b.click();
        break;
      }
    }
    await new Promise((r) => setTimeout(r, 2000));
    await divs[3].screenshot({ path: path.join(ARTIFACTS_DIR, "throttle_takeoff_module.png") });
    console.log("Captured: throttle_takeoff_module.png");
    
    // reset to nominal 75%
    for (const b of buttons) {
      const text = await page.evaluate(el => el.innerText, b);
      if (text.includes("CRUISE")) {
        await b.click();
        break;
      }
    }
  }

  await browser.close();
  console.log("All component screenshots captured successfully!");
}

captureComponentScreenshots().catch(console.error);
