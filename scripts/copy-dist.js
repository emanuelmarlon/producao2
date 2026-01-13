const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const source = path.join(__dirname, 'frontend', 'dist');
const target = path.join(__dirname, 'backend', 'public');

console.log(`Copying from ${source} to ${target}...`);

try {
    // Create target directory if it doesn't exist
    if (!fs.existsSync(target)) {
        fs.mkdirSync(target, { recursive: true });
        console.log(`Created directory: ${target}`);
    }

    if (process.platform === 'win32') {
        // Windows: Use xcopy
        // /s: Copies directories and subdirectories
        // /e: Copies directories and subdirectories, including empty ones
        // /y: Suppresses prompting to confirm you want to overwrite an existing destination file
        const cmd = `xcopy /s /e /y "${source}\\*" "${target}\\"`;
        console.log(`Executing: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
    } else {
        // Linux/macOS: Use cp
        const cmd = `cp -rv "${source}"/* "${target}/"`;
        console.log(`Executing: ${cmd}`);
        execSync(cmd, { stdio: 'inherit' });
    }

    console.log('Frontend files copied successfully!');
} catch (error) {
    console.error('Error during copying files:', error.message);
    process.exit(1);
}
