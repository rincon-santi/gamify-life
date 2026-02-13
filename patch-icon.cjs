const rcedit = require('rcedit');
const path = require('path');

const exePath = path.resolve('release/win-unpacked/The Hidden Covenant.exe');
const iconPath = path.resolve('build/icon.ico');

console.log(`Patching icon for: ${exePath}`);
console.log(`Using icon: ${iconPath}`);

rcedit(exePath, {
    icon: iconPath
}).then(() => {
    console.log('Icon patched successfully!');
}).catch((err) => {
    console.error('Error patching icon:', err);
    process.exit(1);
});
