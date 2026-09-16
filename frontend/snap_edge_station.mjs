import puppeteer from "puppeteer-core";

async function snapEdgeStation() {
  const browser = await puppeteer.launch({
    executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--window-size=1920,1080"]
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto("http://127.0.0.1:8080", { waitUntil: "networkidle2", timeout: 15000 });
  await new Promise(r => setTimeout(r, 1200));

  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/edge_station_tapas.png" });

  // Click RUSTOM-02 tab
  const buttons = await page.$$("button");
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("RUSTOM-02")) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/edge_station_rustom.png" });

  // Click NISHANT-03 tab
  for (const b of buttons) {
    const text = await page.evaluate(el => el.innerText, b);
    if (text && text.includes("NISHANT-03")) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: "C:/Users/SYED KAIF/.gemini/antigravity/brain/cb9f1278-ec4c-4e95-ac71-eef226c8b7af/edge_station_nishant.png" });

  await browser.close();
  console.log("Edge station screenshots captured!");
}
snapEdgeStation();
