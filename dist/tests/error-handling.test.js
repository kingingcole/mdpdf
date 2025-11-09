import { expect } from 'chai';
import { describe, it, beforeEach, afterEach } from 'vitest';
import { convert } from '../src/index.js';
import { existsSync, writeFileSync, unlinkSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
describe('Error Handling', () => {
    // Create a temp directory for test files
    const TEMP_DIR = join(__dirname, 'temp_error_tests');
    const validMarkdownPath = join(TEMP_DIR, 'valid.md');
    const nonExistentPath = join(TEMP_DIR, 'non-existent.md');
    const outputPath = join(TEMP_DIR, 'output.pdf');
    // Setup before tests
    beforeEach(() => {
        try {
            // Create directory if it doesn't exist
            if (!existsSync(TEMP_DIR)) {
                mkdirSync(TEMP_DIR, { recursive: true });
            }
            // Create a valid markdown file for testing
            writeFileSync(validMarkdownPath, '# Test Markdown\n\nThis is a test.');
        }
        catch (err) {
            console.error('Error setting up test files:', err);
        }
    });
    // Cleanup after tests
    afterEach(async () => {
        try {
            // Remove test files
            if (existsSync(validMarkdownPath)) {
                unlinkSync(validMarkdownPath);
            }
            if (existsSync(outputPath)) {
                unlinkSync(outputPath);
            }
            // Remove temp directory
            if (existsSync(TEMP_DIR)) {
                // Use rm -rf with exec for recursive directory removal
                await execAsync(`rm -rf "${TEMP_DIR}"`);
            }
        }
        catch (err) {
            console.error('Error cleaning up test files:', err);
        }
    });
    it('should throw an error when source is not provided', async () => {
        try {
            await convert({
                destination: outputPath,
            });
            // Should not reach here
            expect.fail('Expected an error to be thrown');
        }
        catch (err) {
            expect(err.message).to.include('Source path must be provided');
        }
    });
    it('should throw an error when destination is not provided', async () => {
        try {
            await convert({
                source: validMarkdownPath,
            });
            // Should not reach here
            expect.fail('Expected an error to be thrown');
        }
        catch (err) {
            expect(err.message).to.include('Destination path must be provided');
        }
    });
    it('should throw an error when source file does not exist', async () => {
        try {
            await convert({
                source: nonExistentPath,
                destination: outputPath,
            });
            // Should not reach here
            expect.fail('Expected an error to be thrown');
        }
        catch (err) {
            // The error message might vary depending on the OS and Node.js version
            // But it should be a file system error
            expect(err.code).to.be.oneOf(['ENOENT', 'EACCES']);
        }
    });
});
//# sourceMappingURL=error-handling.test.js.map