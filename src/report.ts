import fs from "node:fs";
import path from "node:path";
import type { Page } from "playwright";
import { config } from "./config.js";

export class RunLog {
  readonly dir: string;
  private step = 0;
  readonly problems: { orderId?: string; reason: string }[] = [];

  constructor(mode: string) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    this.dir = path.join(config.runsDir, `${stamp}-${config.storeId}-${mode}`);
    fs.mkdirSync(this.dir, { recursive: true });
  }

  async record(page: Page, data: unknown): Promise<void> {
    this.step++;
    const base = path.join(this.dir, String(this.step).padStart(3, "0"));
    fs.writeFileSync(`${base}.json`, JSON.stringify(data, null, 2));
    await page.screenshot({ path: `${base}.png` }).catch(() => undefined);
  }

  problem(reason: string, orderId?: string): void {
    this.problems.push({ orderId, reason });
  }

  // Tur sonu toplu rapor (Mehmet: sorunlu siparişler tek raporda).
  finish(summary: string): string {
    const lines = [`# Tur raporu — ${config.storeId}`, "", summary, "", "## Sorunlu siparişler"];
    if (this.problems.length === 0) lines.push("- Yok");
    for (const p of this.problems) lines.push(`- ${p.orderId ?? "(sipariş no okunamadı)"}: ${p.reason}`);
    const file = path.join(this.dir, "rapor.md");
    fs.writeFileSync(file, lines.join("\n") + "\n");
    return file;
  }
}
