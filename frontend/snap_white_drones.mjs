import puppeteer from "puppeteer-core";

async function snapWhiteDrones() {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1920,1080"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Tapas (default)
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/white_tapas.png" });

  // 2. Click Rustom
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.trim() === "Rustom") {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/white_rustom.png" });

  // Click Coolant / Thermal Stress on Rustom
  const sitButtons = await page.$$("button");
  for (const b of sitButtons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("Thermal Stress")) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/white_rustom_stress.png" });

  // 3. Click Nishant
  const nishButtons = await page.$$("button");
  for (const b of nishButtons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.trim() === "Nishant") {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/white_nishant.png" });

  await browser.close();
  console.log("White drone screenshots captured successfully!");
}
snapWhiteDrones();
