// Concatenates the split source files under resources/js/ into a single
// public_html/assets/js/app.js, mirroring how resources/css/app.css is
// compiled by Tailwind. Order matters: files are concatenated as listed.
const fs = require('fs');
const path = require('path');

const FILES = [
    'shared/mobile-nav.js',
    'shared/flash-message.js',
    'shared/confirm-action.js',
    'shared/file-upload-label.js',
    'shared/form-spinner.js',
    'site/song-filter.js',
    'site/song-sort.js',
    'site/view-switcher.js',
    'admin/tag-picker.js',
    'admin/ccli-field.js',
    'admin/rich-editor.js',
];

const SRC_DIR = path.join(__dirname, '..', 'resources', 'js');
const OUT_FILE = path.join(__dirname, '..', 'public_html', 'assets', 'js', 'app.js');

function build() {
    const banner = '// Generated from resources/js/ — do not edit directly. Run `npm run build:js` (or `npm run dev`) to regenerate.\n';
    const body = FILES
        .map(file => fs.readFileSync(path.join(SRC_DIR, file), 'utf8').trimEnd())
        .join('\n\n');

    fs.writeFileSync(OUT_FILE, banner + '\n' + body + '\n');
    console.log(`[build-js] wrote ${FILES.length} files -> ${path.relative(process.cwd(), OUT_FILE)}`);
}

module.exports = { build, FILES, SRC_DIR };

if (require.main === module) {
    build();
}
