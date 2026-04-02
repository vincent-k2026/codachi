import { readStdin, getContextPercent, getModelName, getFiveHourUsage, getSevenDayUsage, getTokenBreakdown } from './stdin.js';
import { getGitStatus } from './git.js';
import { getAnimalType, getPetColors } from './identity.js';
import { loadState, saveState, nextFrame } from './state.js';
import { render } from './render/index.js';
async function main() {
    try {
        const stdin = await readStdin();
        if (!stdin) {
            console.log('[claude-pet] Initializing... restart Claude Code to see your pet!');
            return;
        }
        const state = loadState();
        const newState = nextFrame(state);
        saveState(newState);
        render({
            contextPercent: getContextPercent(stdin),
            modelName: getModelName(stdin),
            animalType: getAnimalType(),
            colors: getPetColors(),
            git: getGitStatus(stdin.cwd),
            fiveHourUsage: getFiveHourUsage(stdin),
            sevenDayUsage: getSevenDayUsage(stdin),
            tokens: getTokenBreakdown(stdin),
            frameIndex: newState.frameIndex,
        });
    }
    catch (error) {
        console.log('[claude-pet] Error:', error instanceof Error ? error.message : 'Unknown error');
    }
}
main();
