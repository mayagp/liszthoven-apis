import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { fromBuffer } from 'pdf2pic';
import puppeteer, { Browser, PDFOptions } from 'puppeteer';

@Injectable()
export class PdfHelper {
  static async pdf(option: {
    browser?: Browser;
    html: string;
    pdfOptions?: PDFOptions;
    watermarkImageUrl?: string;
  }): Promise<Buffer> {
    let isManuallyClose = false;
    if (!option?.browser) {
      option.browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        timeout: 0,
        headless: 'shell',
        executablePath: process.env.CHROME_PATH,
      });

      isManuallyClose = true;
    }

    const page = await option.browser.newPage();

    await page.setContent(option.html, {
      timeout: 0,
      waitUntil: ['networkidle0', 'domcontentloaded'],
    });

    const watermarkImageUrl = option.watermarkImageUrl;
    if (watermarkImageUrl) {
      await page.evaluate((watermarkImageUrl) => {
        const div = document.createElement('div');

        // Create watermark container
        div.style.cssText = `
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10000;
          pointer-events: none; /* Ensure it doesn't interfere with clicks */
          user-select: none; /* Make it unselectable */
          opacity: 0.1; /* Adjust transparency */
        `;

        // Add image as watermark
        div.innerHTML = `<img src="${watermarkImageUrl}" alt="Watermark" style="max-width: 300px; max-height: 300px;" />`;

        document.body.appendChild(div);
        return watermarkImageUrl;
      }, watermarkImageUrl); // Pass the variable into the evaluate function
    }

    if (option.pdfOptions?.height) {
      if (option.pdfOptions.height === 'auto') {
        const pageHeight = await page.evaluate(() => {
          return document.body.scrollHeight;
        });
        let headerHeight = 0;
        let footerHeight = 0;

        // Safely parse margin values, defaulting to 0 if not present
        headerHeight = option.pdfOptions.margin?.top
          ? parseInt(
              option.pdfOptions.margin.top.toString().replace('px', ''),
              10,
            )
          : 0;

        footerHeight = option.pdfOptions.margin?.bottom
          ? parseInt(
              option.pdfOptions.margin.bottom.toString().replace('px', ''),
              10,
            )
          : 0;
        // Calculate total height
        option.pdfOptions.height =
          (pageHeight + headerHeight + footerHeight).toString() + 'px';
      }
    }

    // Inject the page count into the div with id="page"
    await page.evaluate(() => {
      // Select the element with id="page"
      const pageElement = document.getElementById('page');
      if (pageElement) {
        pageElement.innerHTML = `Sheet <span class="pageNumber"></span> of <span class="totalPages"></span>`;
      }
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      timeout: 0,
      ...option.pdfOptions,
    });

    await page.close();

    if (isManuallyClose) {
      await option.browser.close();
    }

    return Buffer.from(pdf);
  }

  static async pdfToImage(
    files: Array<string | Buffer>,
    res: Response,
    fileName = 'file.zip',
  ) {
    let buffer: Buffer;
    const data: {
      buffer: Buffer | undefined;
      document: number;
      index: number;
    }[] = [];

    for (const [document, file] of files.entries()) {
      if (!Buffer.isBuffer(file)) {
        // sample
        // const reqFile = await fetch(
        //   'https://www.adobe.com/support/products/enterprise/knowledgecenter/media/c4611_sample_explain.pdf',
        // );

        const reqFile = await fetch(file);
        buffer = Buffer.from(await reqFile.arrayBuffer());
      } else {
        buffer = file;
      }

      const pdf2pic = fromBuffer(buffer, {
        format: 'png',
        width: 1240,
        height: 1704,
        density: 300,
      });

      await pdf2pic.bulk(-1, { responseType: 'buffer' }).then((values) => {
        for (const [index, value] of values.entries()) {
          data.push({ buffer: value.buffer, document: document, index: index });
        }
      });
    }

    if (data.length === 1) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="file.png"`);
      res.send(data[0].buffer);
    } else {
      const archiver = require('archiver')('zip', { zlib: { level: 9 } });
      for (const file of data) {
        archiver.append(file.buffer, {
          name: `file-${file.document + 1}-${file.index + 1}.png`,
        });
      }

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${fileName}"`,
      );

      // Pipe archive data to the file
      archiver.pipe(res);

      // Finalize the ZIP file
      await archiver.finalize();
    }
  }
}
