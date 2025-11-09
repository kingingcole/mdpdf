import { expect } from 'chai';
import { describe, it } from 'vitest';
import { getOptions } from '../src/puppeteer-helper.js';
describe('Puppeteer Helper', () => {
    it('should create default PDF options with minimal inputs', () => {
        const options = {
            source: '/test/source.md',
            destination: '/test/output.pdf',
            assetDir: '/test',
        };
        const pdfOptions = getOptions(options);
        expect(pdfOptions.path).to.equal('/test/output.pdf');
        expect(pdfOptions.printBackground).to.be.true;
        expect(pdfOptions.displayHeaderFooter).to.be.false;
        expect(pdfOptions.headerTemplate).to.equal('');
        expect(pdfOptions.footerTemplate).to.equal('');
        expect(pdfOptions.landscape).to.be.false;
    });
    it('should set displayHeaderFooter to true when header is provided', () => {
        const options = {
            source: '/test/source.md',
            destination: '/test/output.pdf',
            assetDir: '/test',
            header: '<header>Test Header</header>',
        };
        const pdfOptions = getOptions(options);
        expect(pdfOptions.displayHeaderFooter).to.be.true;
        expect(pdfOptions.headerTemplate).to.equal('<header>Test Header</header>');
    });
    it('should set displayHeaderFooter to true when footer is provided', () => {
        const options = {
            source: '/test/source.md',
            destination: '/test/output.pdf',
            assetDir: '/test',
            footer: '<footer>Test Footer</footer>',
        };
        const pdfOptions = getOptions(options);
        expect(pdfOptions.displayHeaderFooter).to.be.true;
        expect(pdfOptions.footerTemplate).to.equal('<footer>Test Footer</footer>');
    });
    it('should set landscape to true when orientation is landscape', () => {
        const options = {
            source: '/test/source.md',
            destination: '/test/output.pdf',
            assetDir: '/test',
            pdf: {
                orientation: 'landscape',
            },
        };
        const pdfOptions = getOptions(options);
        expect(pdfOptions.landscape).to.be.true;
    });
    it('should set correct margins based on border settings', () => {
        const options = {
            source: '/test/source.md',
            destination: '/test/output.pdf',
            assetDir: '/test',
            pdf: {
                border: {
                    top: '10mm',
                    right: '15mm',
                    bottom: '20mm',
                    left: '25mm',
                },
            },
        };
        const pdfOptions = getOptions(options);
        expect(pdfOptions.margin?.top).to.equal('10mm');
        expect(pdfOptions.margin?.right).to.equal('15mm');
        expect(pdfOptions.margin?.bottom).to.equal('20mm');
        expect(pdfOptions.margin?.left).to.equal('25mm');
    });
    it('should handle partial border settings', () => {
        const options = {
            source: '/test/source.md',
            destination: '/test/output.pdf',
            assetDir: '/test',
            pdf: {
                border: {
                    top: '10mm',
                    // Only providing top margin
                },
            },
        };
        const pdfOptions = getOptions(options);
        expect(pdfOptions.margin?.top).to.equal('10mm');
        expect(pdfOptions.margin?.right).to.be.undefined;
        expect(pdfOptions.margin?.bottom).to.be.undefined;
        expect(pdfOptions.margin?.left).to.be.undefined;
    });
    it('should set format correctly', () => {
        const options = {
            source: '/test/source.md',
            destination: '/test/output.pdf',
            assetDir: '/test',
            pdf: {
                format: 'A3',
            },
        };
        const pdfOptions = getOptions(options);
        expect(pdfOptions.format).to.equal('A3');
    });
});
//# sourceMappingURL=puppeteer-helper.test.js.map