import { openBrowser } from "../browser.js";
import { config } from "../config.js";

// Otomasyon profilini açar. Mehmet EasyCentral ve Amazon'a ELLE giriş yapar; sonra pencereyi kapatır.
const ctx = await openBrowser();
const page = ctx.pages()[0] ?? (await ctx.newPage());
if (config.ecUrl) await page.goto(config.ecUrl);
console.log("EasyCentral ve Amazon'a elle giriş yap. Bitince tarayıcı penceresini kapat.");
await new Promise<void>((resolve) => ctx.on("close", () => resolve()));
