#!/usr/bin/env node
/**
 * Waits for the local dev server to respond, then opens it in the default browser.
 */
const waitOn = require('wait-on');
const path   = require('path');
const { spawn } = require('child_process');

const URL     = 'http://localhost:8000';
const openCli = path.join(__dirname, '..', 'node_modules', '.bin', 'open-cli');

waitOn({ resources: ['tcp:localhost:8000'], timeout: 15000 }, (err) => {
    if (err) {
        console.error('[browser] Server did not respond in time:', err.message);
        process.exit(1);
    }
    console.log(`[browser] Opening ${URL}`);
    spawn(openCli, [URL], { stdio: 'ignore', detached: true, shell: true }).unref();
});
