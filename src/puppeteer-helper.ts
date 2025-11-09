import { PDFOptions } from 'puppeteer-core';
import { MdPdfOptions } from './types.js';

export function getOptions(options: MdPdfOptions): PDFOptions {
  let displayHeaderFooter = false;
  if (options.header || options.footer) {
    displayHeaderFooter = true;
  }

  let margin: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  } = {};

  if (options.pdf?.border) {
    margin.top = options.pdf.border.top || undefined;
    margin.right = options.pdf.border.right || undefined;
    margin.bottom = options.pdf.border.bottom || undefined;
    margin.left = options.pdf.border.left || undefined;
  }

  return {
    path: options.destination,
    printBackground: true,
    format: options.pdf?.format as any,
    margin,
    displayHeaderFooter,
    headerTemplate: options.header || '',
    footerTemplate: options.footer || '',
    landscape: !!(
      options.pdf?.orientation && options.pdf.orientation === 'landscape'
    ),
    timeout: options?.pdf?.timeout || 30_000,
  };
}
