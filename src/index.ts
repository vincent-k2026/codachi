import { readStdin, getContextPercent, getModelName, getFiveHourUsage, getSevenDayUsage } from './stdin.js';
import { getGitStatus } from './git.js';
import { getProjectInfo } from './project.js';
import { getAnimalType, getPetColors } from './identity.js';
import { initSession, animTick, moodTick, sessionUptime } from './state.js';
import { render } from './render/index.js';

async function main(): Promise<void> {
  try {
    const stdin = await readStdin();

    if (!stdin) {
      console.log('[codachi] Initializing... restart Claude Code to see your pet!');
      return;
    }

    initSession(stdin.transcript_path);

    render({
      contextPercent: getContextPercent(stdin),
      modelName: getModelName(stdin),
      animalType: getAnimalType(),
      colors: getPetColors(),
      git: getGitStatus(stdin.cwd),
      project: getProjectInfo(stdin.cwd),
      fiveHourUsage: getFiveHourUsage(stdin),
      sevenDayUsage: getSevenDayUsage(stdin),
      animTick: animTick(),
      moodTick: moodTick(),
      uptime: sessionUptime(),
    });
  } catch (error) {
    console.log('[codachi] Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

main();
