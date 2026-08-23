import { Injectable } from "@nestjs/common";

@Injectable()
export class PdfService {
  async renderHtmlToPdf(html: string, outputPath: string) {
    const { default: puppeteer } = await import("puppeteer");
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: "load" });
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
