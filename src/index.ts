import { readStdin, getContextPercent, getModelName, getFiveHourUsage, getSevenDayUsage } from './stdin.js';
import { getGitStatus } from './git.js';
import { getAnimalType, getPetColors } from './identity.js';
import { loadState, saveState, nextFrame } from './state.js';
import { render } from './render/index.js';

async function main(): Promise<void> {
  try {
    const stdin = await readStdin();

    if (!stdin) {
      console.log('[claude-pet] Initializing... restart Claude Code to see your pet!');
      return;
    }

    // Load and advance animation state
    const state = loadState();
    const newState = nextFrame(state);
    saveState(newState);

    // Compute everything
    const contextPercent = getContextPercent(stdin);
    const modelName = getModelName(stdin);
    const animalType = getAnimalType();
    const colors = getPetColors();
    const git = getGitStatus(stdin.cwd);
    const fiveHourUsage = getFiveHourUsage(stdin);
    const sevenDayUsage = getSevenDayUsage(stdin);

    render({
      stdin,
      contextPercent,
      modelName,
      animalType,
      colors,
      git,
      fiveHourUsage,
      sevenDayUsage,
      frameIndex: newState.frameIndex,
    });
  } catch (error) {
    console.log('[claude-pet] Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

main();
