#!/usr/bin/env node
import { readStdin, getContextPercent, getModelName, getFiveHourUsage, getSevenDayUsage, getCacheHitRate, getTokenSummary } from './stdin.js';
import { getGitStatus } from './git.js';
import { getProjectInfo } from './project.js';
import { getAnimalType, getPetColors } from './identity.js';
import { initSession, animTick, moodTick, sessionUptime, recordContextPercent, getContextVelocity, getMemory, getRelationshipTier } from './state.js';
import { loadConfig, getConfig } from './config.js';
import { getEventContext } from './events.js';
import { render } from './render/index.js';

async function main(): Promise<void> {
  try {
    const stdin = await readStdin();

    if (!stdin) {
      console.log('[codachi] Initializing... restart Claude Code to see your pet!');
      return;
    }

    loadConfig();
    initSession(stdin.transcript_path);

    const cfg = getConfig();
    const contextPercent = getContextPercent(stdin);
    recordContextPercent(contextPercent);

    render({
      contextPercent,
      modelName: getModelName(stdin),
      animalType: getAnimalType(),
      colors: getPetColors(),
      git: cfg.showGit !== false ? getGitStatus(stdin.cwd) : null,
      project: getProjectInfo(stdin.cwd),
      fiveHourUsage: getFiveHourUsage(stdin),
      sevenDayUsage: getSevenDayUsage(stdin),
      contextVelocity: cfg.showVelocity !== false ? getContextVelocity() : 0,
      cacheHitRate: cfg.showCache !== false ? getCacheHitRate(stdin) : null,
      tokenSummary: cfg.showTokens !== false ? getTokenSummary(stdin) : null,
      relationshipTier: getRelationshipTier(),
      sessionNumber: getMemory().totalSessions,
      animTick: animTick(cfg.animationSpeed),
      moodTick: moodTick(),
      uptime: cfg.showUptime !== false ? sessionUptime() : '',
      eventContext: getEventContext(),
    });
  } catch (error) {
    console.log('[codachi] Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

main();
