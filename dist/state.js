import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
const STATE_DIR = path.join(os.homedir(), '.claude', 'plugins', 'claude-pet');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
export function loadState() {
    try {
        const raw = fs.readFileSync(STATE_FILE, 'utf8');
        return JSON.parse(raw);
    }
    catch {
        return { frameIndex: 0, lastUpdate: Date.now() };
    }
}
export function saveState(state) {
    try {
        fs.mkdirSync(STATE_DIR, { recursive: true });
        fs.writeFileSync(STATE_FILE, JSON.stringify(state));
    }
    catch {
        // silently fail
    }
}
export function nextFrame(state) {
    return {
        frameIndex: (state.frameIndex + 1) % 120, // cycle every 120 frames (~36s at 300ms)
        lastUpdate: Date.now(),
    };
}
