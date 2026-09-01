import puppeteer from "puppeteer-core";

async function snapAll() {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1920,1080"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Nominal Snapshot
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/minimalist_nominal.png" });

  // 2. Coolant Leak Snapshot
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("Coolant Leak")) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/minimalist_coolant_leak.png" });

  // 3. Oil Starvation Snapshot
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("Oil Starvation")) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/minimalist_oil_starvation.png" });

  // 4. Cylinder Misfire Snapshot
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("Cylinder 3 Misfire")) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/minimalist_misfire.png" });

  await browser.close();
  console.log("All 4 minimalist scenario screenshots successfully captured!");
}
snapAll();
