import puppeteer from "puppeteer-core";

async function snapAccurate() {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1920,1080"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 950 });
  await page.goto("http://localhost:3000", { waitUntil: "networkidle2", timeout: 30000 });
  await new Promise(r => setTimeout(r, 1200));

  // 1. Tapas Nominal (24 Hours)
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/tapas_24hours.png" });

  // 2. Click Rustom (22 Hours)
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.trim() === "Rustom") {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/rustom_22hours.png" });

  // 3. Click Nishant (4.5 Hours)
  const nishButtons = await page.$$("button");
  for (const b of nishButtons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.trim() === "Nishant") {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/nishant_4hours.png" });

  // 4. Click Coolant Leak on Nishant (42 Mins)
  const coolButtons = await page.$$("button");
  for (const b of coolButtons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("Thermal Stress")) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/nishant_coolant_42m.png" });

  await browser.close();
  console.log("All accurate endurance screenshots captured successfully!");
}
snapAccurate();
