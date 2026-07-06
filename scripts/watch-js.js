// Watches resources/js/ and rebuilds public_html/assets/js/app.js on change.
const fs = require('fs');
const path = require('path');
const { build, SRC_DIR } = require('./build-js');

build();

let pending = false;
function rebuild() {
    if (pending) return;
    pending = true;
    setTimeout(() => {
        pending = false;
        try {
            build();
        } catch (err) {
            console.error('[watch-js] build failed:', err.message);
        }
    }, 100);
}

fs.watch(SRC_DIR, { recursive: true }, () => rebuild());
console.log(`[watch-js] watching ${path.relative(process.cwd(), SRC_DIR)} for changes...`);
