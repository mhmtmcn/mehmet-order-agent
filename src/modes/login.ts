import { startChrome } from "../browser.js";
import { config } from "../config.js";

// Otomasyon Chrome'unu açar. Bu pencerede Mehmet:
//  - kullandığı eklentileri Chrome Web Store'dan kurar (kalıcıdır),
//  - EasyCentral ve Amazon'a ELLE giriş yapar.
await startChrome(config.ecUrl || undefined);
console.log("Otomasyon Chrome'u açık.");
console.log("1) Gerekli eklentileri Chrome Web Store'dan kurun ve eklenti girişlerini yapın.");
console.log("2) EasyCentral ve Amazon'a elle giriş yapın.");
console.log("Chrome açık kalabilir; observe/dryrun bu pencereye bağlanır.");
