#!/usr/bin/env node
import { resolve, join, dirname } from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import meow from 'meow';
import { convert } from '../src/index.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cli = meow(`
    Usage:
        $ mdpdf <source> [<destination>] [options]

    <source> must be a markdown file, with the extension '.md'.

    Examples:
        $ mdpdf README.md
        $ mdpdf README.md --style=styles.css --header=header.hbs --h-height=22mm
        $ mdpdf README.md --footer=footer.hbs --f-height=22mm --debug
        $ mdpdf README.md --border-left=30mm

    Options:
        --style=<filename>           A single css stylesheet you wish to apply to the PDF
        --header=<filename>          A HTML (.html) file to inject into the header of the PDF
        --h-height=<height>          The height of the header section
        --footer=<filename>          A HTML (.html) file to inject into the footer of the PDF
        --f-height=<height>          The height of the footer section
        --border=<size>              Border (top, left, bottom, right; default: 20mm)
        --border-top=<size>          Top border (default: 20mm)
        --border-left=<size>         Left border (default: 20mm)
        --border-bottom=<size>       Bottom border (default: 20mm)
        --border-right=<size>        Right border (default: 20mm)
        --gh-style                   Enable default gh-styles, when --style is used
        --no-emoji                   Disables emoji conversions
        --no-highlight               Disables syntax highlighting
        --debug                      Save the generated html for debugging
        --help                       Display this menu
        --version                    Display the application version
        --format=<format>            PDF size format: A3, A4, A5, Legal, Letter, Tabloid (Default: A4)
        --orientation=<orientation>  PDF orientation: portrait or landscape (Default: portrait)
        --title=<title>              PDF title, primarily used by some PDF viewers (Default: source filename without extension)
        --timeout=<timeout>          Timeout to apply pass to puppeteer for the maximum duration of rendering. (Default: 30_000)

		Length parameters (<height> and <size>) require a unit. Valid units are mm, cm, in and px.

	Global Settings:
		You can also set a global default stylesheet by setting the MDPDF_STYLES environment
		variable as the path to your single css stylesheet. The --style flag will override this.
`, {
    importMeta: import.meta,
    flags: {
        style: {
            type: 'string',
            shortFlag: 's',
            isMultiple: true,
        },
        header: {
            type: 'string',
            shortFlag: 'h',
        },
        footer: {
            type: 'string',
            shortFlag: 'f',
        },
        html: {
            type: 'string',
            shortFlag: 'html',
        },
        format: {
            type: 'string',
            shortFlag: 'r', // 'f' usually denotes file, so we chose 'r' here.
        },
        orientation: {
            type: 'string',
            shortFlag: 'o',
        },
        title: {
            type: 'string',
            shortFlag: 't',
        },
        timeout: {
            type: 'number',
            default: 30000,
        },
    },
});
function isMd(path) {
    if (!path) {
        return true;
    }
    const accepted = ['md', 'markdown'];
    const current = path.split('.').pop();
    if (current && accepted.indexOf(current) !== -1) {
        return true;
    }
    return false;
}
const source = cli.input[0];
if (!source || !isMd(source)) {
    // Invalid source, show help and exit
    console.error('Source was not provided, or was not a markdown file');
    cli.showHelp(1);
}
const destination = cli.input[1] || source.slice(0, source.indexOf('.md')) + '.pdf';
const debug = cli.flags.debug || false;
let style = cli.flags.style || [];
const header = cli.flags.header;
const headerHeight = cli.flags.hHeight;
const footer = cli.flags.footer;
const footerHeight = cli.flags.fHeight;
const border = cli.flags.border || '20mm';
const borderTop = cli.flags.borderTop || border;
const borderLeft = cli.flags.borderLeft || border;
const borderBottom = cli.flags.borderBottom || border;
const borderRight = cli.flags.borderRight || border;
const pdfFormat = cli.flags.format || 'A4';
const pdfOrientation = cli.flags.orientation || 'portrait';
const ghStyleFlag = cli.flags.ghStyle || false;
const title = cli.flags.title || null;
const timeout = cli.flags.timeout;
// Name of the environement variable
const envStyleName = 'MDPDF_STYLES';
// If styles have not been provided through the CLI flag, but the environment variable exists
if (!style && process.env[envStyleName]) {
    // Ensure the css file exists
    const envCssPath = resolve(process.env[envStyleName]);
    if (existsSync(envCssPath)) {
        style = [envCssPath];
    }
}
const options = {
    ghStyle: style.length > 0 ? !!ghStyleFlag : true, // Convert to boolean
    defaultStyle: true,
    source: resolve(source),
    destination: resolve(destination),
    assetDir: dirname(resolve(source)), // Added assetDir
    styles: style
        ? style.map(function (s) {
            return resolve(s);
        })
        : null,
    header: header ? resolve(header) : null,
    footer: footer ? resolve(footer) : null,
    noEmoji: !!cli.flags.noEmoji || false, // Convert to boolean
    noHighlight: !!cli.flags.noHighlight || false, // Convert to boolean
    debug: debug
        ? resolve(source.slice(0, source.indexOf('.md')) + '.html')
        : null,
    pdf: {
        title: title,
        format: pdfFormat,
        orientation: pdfOrientation,
        quality: '100',
        base: join('file://', __dirname, '/assets/'),
        header: headerHeight
            ? {
                height: headerHeight,
            }
            : undefined,
        footer: footerHeight
            ? {
                height: footerHeight,
            }
            : undefined,
        border: {
            top: borderTop,
            left: borderLeft,
            bottom: borderBottom,
            right: borderRight,
        },
        timeout: timeout,
    },
};
(async () => {
    try {
        const pdfPath = await convert(options);
        if (process.stdout.isTTY) {
            console.log('✨ PDF created successfully at:', pdfPath);
        }
        else {
            console.log(pdfPath);
        }
    }
    catch (err) {
        console.error(err);
        process.exitCode = 1;
    }
})();
//# sourceMappingURL=index.js.map