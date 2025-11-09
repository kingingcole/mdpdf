import { unlinkSync, existsSync, readFileSync, } from 'fs';
import { expect } from 'chai';
import { execa } from 'execa';
import { convert } from '../src/index.js';
import { createOptions } from './utils.js';
import { afterEach, beforeEach, describe, it } from 'vitest';
function clean() {
    const filesToRemove = [
        './README.pdf',
        './README.html',
        './output.pdf',
        './test-img-output.pdf',
        './tests/test.html',
    ];
    filesToRemove.forEach((file) => {
        // Use a synchronous approach to avoid callback issues
        try {
            if (existsSync(file)) {
                unlinkSync(file);
                console.log(`Cleaned up: ${file}`);
            }
        }
        catch (err) {
            console.error(`Error cleaning file ${file}:`, err);
        }
    });
}
describe('Convert CLI', () => {
    // Vitest automatically adds the timeout to the test context
    // No need for this.timeout
    afterEach(clean);
    beforeEach(clean);
    it('creates a pdf when given a markdown file', async () => {
        console.log('Starting test: creates a pdf');
        const result = await execa('node', ['./dist/bin/index.js', './README.md'], {
            timeout: 60000,
        });
        console.log('Command completed successfully');
        const stdout = result.stdout;
        const pdfExists = existsSync('./README.pdf');
        console.log('PDF exists:', pdfExists);
        console.log('Stdout:', stdout);
        expect(pdfExists).to.be.true;
        expect(stdout).to.include('README.pdf');
    });
    it('creates a pdf and html file when passed debug flag', async () => {
        console.log('Starting test: creates a pdf and html file');
        const result = await execa('node', ['./dist/bin/index.js', './README.md', '--debug'], { timeout: 20000 });
        console.log('Command completed successfully');
        const stdout = result.stdout;
        const pdfExists = existsSync('./README.pdf');
        const htmlExists = existsSync('./README.html');
        console.log('PDF exists:', pdfExists, 'HTML exists:', htmlExists);
        console.log('Stdout:', stdout);
        expect(pdfExists).to.be.true;
        expect(htmlExists).to.be.true;
        expect(stdout).to.include('README.pdf');
    });
    it('creates a pdf at the specified destination when passed a destination', async () => {
        console.log('Starting test: creates a pdf at the specified destination');
        const result = await execa('node', ['./dist/bin/index.js', './README.md', 'output.pdf'], { timeout: 20000 });
        console.log('Command completed successfully');
        const stdout = result.stdout;
        const pdfExists = existsSync('./output.pdf');
        console.log('PDF exists:', pdfExists);
        console.log('Stdout:', stdout);
        expect(pdfExists).to.be.true;
        expect(stdout).to.include('output.pdf');
    });
    it('creates a pdf when given markdown with an image', async () => {
        console.log('Starting test: creates a pdf with image');
        const result = await execa('node', ['./dist/bin/index.js', './tests/test.md', './test-img-output.pdf'], { timeout: 20000 });
        console.log('Command completed successfully');
        const stdout = result.stdout;
        const pdfExists = existsSync('./test-img-output.pdf');
        console.log('PDF exists:', pdfExists);
        console.log('Stdout:', stdout);
        expect(pdfExists).to.be.true;
        expect(stdout).to.include('test-img-output.pdf');
    });
    it('HTML file contains the custom style when custom style is passed', async () => {
        await execa('node', [
            './dist/bin/index.js',
            './tests/test.md',
            '--style=./tests/test.css',
            '--debug',
        ]);
        const htmlContent = readFileSync('./tests/test.html', 'utf8');
        const cssContent = readFileSync('./tests/test.css', 'utf8');
        const ghStyleContent = readFileSync('./src/assets/github-markdown-css.css', 'utf8');
        expect(htmlContent.includes(cssContent)).to.be.true;
        expect(htmlContent.includes(ghStyleContent)).to.be.false;
    });
    it('HTML file contains the default styles when --gh-style is passed', async () => {
        await execa('node', [
            './dist/bin/index.js',
            './tests/test.md',
            '--style=./tests/test.css',
            '--debug',
            '--gh-style',
        ]);
        const htmlContent = readFileSync('./tests/test.html', 'utf8');
        const cssContent = readFileSync('./tests/test.css', 'utf8');
        const ghStyleContent = readFileSync('./src/assets/github-markdown-css.css', 'utf8');
        expect(htmlContent.includes(cssContent)).to.be.true;
        expect(htmlContent.includes(ghStyleContent)).to.be.true;
    });
});
describe('Convert API', () => {
    afterEach(clean);
    beforeEach(clean);
    it('creates a pdf when given a markdown source', async () => {
        console.log('Starting API test: creates a pdf');
        const options = createOptions({
            source: 'README.md',
        });
        await convert(options);
        console.log('Convert completed successfully');
        const pdfExists = existsSync('./README.pdf');
        console.log('PDF exists:', pdfExists);
        expect(pdfExists).to.be.true;
    });
    it('creates a html file when debug is true', async () => {
        console.log('Starting API test: creates a html file');
        const options = createOptions({
            source: 'README.md',
            debug: true,
        });
        await convert(options);
        console.log('Convert completed successfully');
        const pdfExists = existsSync('./README.pdf');
        const htmlExists = existsSync('./README.html');
        console.log('PDF exists:', pdfExists, 'HTML exists:', htmlExists);
        expect(pdfExists).to.be.true;
        expect(htmlExists).to.be.true;
    });
    it('creates a pdf at the destination when destination is set', async () => {
        console.log('Starting API test: creates a pdf at the destination');
        const options = createOptions({
            source: 'README.md',
            destination: 'output.pdf',
        });
        await convert(options);
        console.log('Convert completed successfully');
        const pdfExists = existsSync('./output.pdf');
        console.log('PDF exists:', pdfExists);
        expect(pdfExists).to.be.true;
    });
});
//# sourceMappingURL=index.js.map