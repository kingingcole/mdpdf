import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'vitest';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { getStyleBlock, getStyles, hasAcceptableProtocol, processSrc, qualifyImgSources, } from '../src/utils.js';
import { writeFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
// Setup test environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const TEMP_DIR = join(__dirname, 'temp');
// Utility function to create temporary directory and files for testing
function createTempFiles() {
    if (!existsSync(TEMP_DIR)) {
        mkdirSync(TEMP_DIR);
    }
    const cssFile1 = join(TEMP_DIR, 'style1.css');
    const cssFile2 = join(TEMP_DIR, 'style2.css');
    writeFileSync(cssFile1, 'body { color: red; }');
    writeFileSync(cssFile2, 'h1 { color: blue; }');
    return { cssFile1, cssFile2 };
}
// Clean up function
function cleanupTempFiles(files) {
    files.forEach((file) => {
        try {
            unlinkSync(file);
        }
        catch (err) {
            // Ignore errors if file doesn't exist
        }
    });
    try {
        unlinkSync(TEMP_DIR);
    }
    catch (err) {
        // Directory may not be empty or doesn't exist
    }
}
describe('Utils - CSS functions', () => {
    let tempFiles;
    beforeEach(() => {
        tempFiles = createTempFiles();
    });
    afterEach(() => {
        cleanupTempFiles([tempFiles.cssFile1, tempFiles.cssFile2]);
    });
    it('getStyleBlock should wrap CSS content in style tags', () => {
        const styleBlock = getStyleBlock([tempFiles.cssFile1, tempFiles.cssFile2]);
        expect(styleBlock).to.include('<style>body { color: red; }</style>');
        expect(styleBlock).to.include('<style>h1 { color: blue; }</style>');
    });
    it('getStyles should concatenate CSS content without style tags', () => {
        const styles = getStyles([tempFiles.cssFile1, tempFiles.cssFile2]);
        expect(styles).to.include('body { color: red; }');
        expect(styles).to.include('h1 { color: blue; }');
        expect(styles).to.not.include('<style>');
        expect(styles).to.not.include('</style>');
    });
});
describe('Utils - URL functions', () => {
    it('hasAcceptableProtocol should accept http and https protocols', () => {
        expect(hasAcceptableProtocol('http://example.com')).to.be.true;
        expect(hasAcceptableProtocol('https://example.com')).to.be.true;
        expect(hasAcceptableProtocol('file:///path/to/file')).to.be.false;
        expect(hasAcceptableProtocol('ftp://example.com')).to.be.false;
        expect(hasAcceptableProtocol('relative/path')).to.be.false;
        expect(hasAcceptableProtocol('/absolute/path')).to.be.false;
    });
    it('processSrc should convert relative paths to file URLs', () => {
        const options = { assetDir: '/test/assets' };
        // Test with acceptable protocols (should remain unchanged)
        expect(processSrc('http://example.com/image.png', options)).to.equal('http://example.com/image.png');
        expect(processSrc('https://example.com/image.png', options)).to.equal('https://example.com/image.png');
        // Test with relative path (should be converted to file URL)
        const result = processSrc('img/test.png', options);
        expect(result.startsWith('file://')).to.be.true;
        expect(result.endsWith('/test/assets/img/test.png')).to.be.true;
    });
    it('qualifyImgSources should update image src attributes in HTML', () => {
        const options = { assetDir: '/test/assets' };
        const html = '<div><img src="image.png"><img src="https://example.com/remote.jpg"></div>';
        const result = qualifyImgSources(html, options);
        // Remote URL should remain unchanged
        expect(result).to.include('https://example.com/remote.jpg');
        // Local path should be converted to file URL
        expect(result).to.include('file://');
        expect(result).to.include('/test/assets/image.png');
    });
});
//# sourceMappingURL=utils.test.js.map