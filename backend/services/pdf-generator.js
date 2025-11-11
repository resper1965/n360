/**
 * PDF Generator Service
 * 
 * Gera relatórios PDF usando Puppeteer
 */

const puppeteer = require('puppeteer');
const logger = require('../utils/logger');

class PDFGenerator {
  constructor() {
    this.browser = null;
  }

  /**
   * Inicializa browser Puppeteer (singleton)
   */
  async getBrowser() {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu'
        ]
      });
      logger.info('[PDF Generator] Browser Puppeteer inicializado');
    }
    return this.browser;
  }

  /**
   * Gera PDF a partir de HTML
   */
  async generateFromHTML(html, options = {}) {
    const browser = await this.getBrowser();
    const page = await browser.newPage();

    try {
      // Configurar página
      await page.setContent(html, {
        waitUntil: 'networkidle0'
      });

      // Configurações padrão de PDF
      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        },
        ...options
      };

      // Gerar PDF
      const pdf = await page.pdf(pdfOptions);

      await page.close();

      return pdf;
    } catch (error) {
      await page.close();
      throw error;
    }
  }

  /**
   * Fecha browser
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      logger.info('[PDF Generator] Browser Puppeteer fechado');
    }
  }
}

// Singleton instance
const pdfGenerator = new PDFGenerator();

// Cleanup ao encerrar processo
process.on('SIGTERM', async () => {
  await pdfGenerator.close();
});

process.on('SIGINT', async () => {
  await pdfGenerator.close();
});

module.exports = pdfGenerator;


