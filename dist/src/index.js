import { copyFileSync, unlinkSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import handlebars from 'handlebars';
import { allowUnsafeNewFunction } from 'loophole';
import { dirname, join, parse as parsePath, resolve } from 'path';
import { launch } from 'puppeteer';
import showdown from 'showdown';
import showdownEmoji from 'showdown-emoji';
import showdownHighlight from 'showdown-highlight';
import { getOptions } from './puppeteer-helper.js';
import { getStyleBlock, getStyles, qualifyImgSources } from './utils.js';
const { setFlavor, Converter } = showdown;
const { SafeString, compile } = handlebars;
// Main layout template
const layoutPath = join(__dirname, '/layouts/doc-body.hbs');
const headerLayoutPath = join(__dirname, '/layouts/header.hbs');
const footerLayoutPath = join(__dirname, '/layouts/footer.hbs');
function getAllStyles(options) {
    let cssStyleSheets = [];
    console.log(import.meta.url, __filename, __dirname);
    // GitHub Markdown Style
    if (options.ghStyle) {
        cssStyleSheets.push(join(__dirname, '/assets/github-markdown-css.css'));
    }
    // Highlight CSS
    cssStyleSheets.push(join(__dirname, '/assets/highlight/styles/github.css'));
    // Some additional defaults such as margins
    if (options.defaultStyle) {
        cssStyleSheets.push(join(__dirname, '/assets/default.css'));
    }
    // Optional user given CSS
    if (options.styles) {
        cssStyleSheets = cssStyleSheets.concat(options.styles);
    }
    return {
        styles: getStyles(cssStyleSheets),
        styleBlock: getStyleBlock(cssStyleSheets),
    };
}
function parseMarkdownToHtml(markdown, convertEmojis, enableHighlight, simpleLineBreaks) {
    setFlavor('github');
    const options = {
        prefixHeaderId: false,
        ghCompatibleHeaderId: true,
        simpleLineBreaks,
        extensions: [],
    };
    // Sometimes emojis can mess with time representations
    // such as "00:00:00"
    if (convertEmojis) {
        options.extensions.push(showdownEmoji);
    }
    if (enableHighlight) {
        options.extensions.push(showdownHighlight);
    }
    const converter = new Converter(options);
    return converter.makeHtml(markdown);
}
export async function convert(options) {
    if (!options?.source) {
        throw new Error('Source path must be provided');
    }
    if (!options.destination) {
        throw new Error('Destination path must be provided');
    }
    // Create a complete options object with required properties
    const fullOptions = {
        source: options.source,
        destination: options.destination,
        assetDir: options.assetDir || dirname(resolve(options.source)),
        ghStyle: options.ghStyle,
        defaultStyle: options.defaultStyle,
        styles: options.styles,
        header: options.header,
        footer: options.footer,
        noEmoji: options.noEmoji,
        noHighlight: options.noHighlight,
        debug: options.debug,
        waitUntil: options.waitUntil,
        pdf: options.pdf,
    };
    const styles = getAllStyles(fullOptions);
    const css = new SafeString(styles.styleBlock);
    const local = {
        css: css,
    };
    // Asynchronously read files and prepare components
    const layoutPromise = readFile(layoutPath, 'utf8').then(compile);
    const sourcePromise = readFile(fullOptions.source, 'utf8');
    const headerPromise = prepareHeader(fullOptions, styles.styles);
    const footerPromise = prepareFooter(fullOptions);
    const [layoutTemplate, sourceMarkdown, headerHtml, footerHtml,] = await Promise.all([
        layoutPromise,
        sourcePromise,
        headerPromise,
        footerPromise,
    ]);
    fullOptions.header = headerHtml;
    fullOptions.footer = footerHtml;
    const emojis = !fullOptions.noEmoji;
    const syntaxHighlighting = !fullOptions.noHighlight;
    const simpleLineBreaks = !fullOptions.ghStyle;
    let content = parseMarkdownToHtml(sourceMarkdown, emojis, syntaxHighlighting, simpleLineBreaks);
    content = qualifyImgSources(content, fullOptions);
    local.body = new SafeString(content);
    // Use loophole for this body template to avoid issues with editor extensions
    const html = allowUnsafeNewFunction(() => layoutTemplate(local));
    return await createPdf(html, fullOptions);
}
async function prepareHeader(options, css) {
    if (!options.header) {
        return undefined; // Return early if no header
    }
    // Get the hbs layout
    const headerLayoutContent = await readFile(headerLayoutPath, 'utf8');
    const headerTemplate = compile(headerLayoutContent);
    // Get the header html
    const headerContent = await readFile(options.header, 'utf8');
    const preparedHeader = qualifyImgSources(headerContent, options);
    // Compile the header template
    const headerHtml = headerTemplate({
        content: new SafeString(preparedHeader),
        css: new SafeString(css.replace(/"/gm, "'")),
    });
    return headerHtml;
}
function prepareFooter(options) {
    if (options.footer) {
        return readFile(options.footer, 'utf8').then((footerContent) => {
            const preparedFooter = qualifyImgSources(footerContent, options);
            return preparedFooter;
        });
    }
    else {
        return Promise.resolve(undefined);
    }
}
async function createPdf(html, options) {
    const tempHtmlPath = resolve(dirname(options.destination), '_temp.html');
    let browser = null; // Initialize browser to null
    try {
        await writeFile(tempHtmlPath, html);
        browser = await launch({
            headless: true, // Use boolean instead of 'new' string
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = (await browser.pages())[0];
        await page.goto('file:' + tempHtmlPath, {
            waitUntil: options.waitUntil ?? 'networkidle0',
        });
        // have to bypass by arguments
        // custom title support
        const targetTitle = options.pdf?.title
            ? options.pdf.title
            : parsePath(options.source).name;
        await page.evaluate((targetTitle) => {
            // overwrite title to fix https://github.com/elliotblackburn/mdpdf/issues/211
            document.title = targetTitle;
        }, targetTitle);
        const puppetOptions = getOptions(options);
        await page.pdf(puppetOptions);
        await browser.close();
        browser = null; // Indicate browser is closed
        if (options.debug) {
            copyFileSync(tempHtmlPath, options.debug);
        }
        return options.destination;
    }
    catch (error) {
        // Ensure browser is closed even if an error occurs
        if (browser) {
            await browser.close();
        }
        // Re-throw the error to be handled by the caller
        throw error;
    }
    finally {
        // Clean up temp file in case of error or success
        try {
            unlinkSync(tempHtmlPath);
        }
        catch (e) {
            // Ignore errors if the file doesn't exist or couldn't be deleted
        }
    }
}
//# sourceMappingURL=index.js.map