import { Injectable } from "@nestjs/common";
import puppeteer from "puppeteer";

@Injectable()
export class PdfService {
  async renderHtmlToPdf(html: string, outputPath: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "networkidle0" });
      await page.pdf({
        path: outputPath,
        format: "A4",
        printBackground: true,
        margin: {
          top: "16mm",
          right: "14mm",
          bottom: "16mm",
          left: "14mm"
        }
      });
    } finally {
      await browser.close();
    }
  }
}
