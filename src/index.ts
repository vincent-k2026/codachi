#!/usr/bin/env node
import { readStdin, getContextPercent, getModelName, getFiveHourUsage, getSevenDayUsage, getTokenSummary, getCacheHitRate } from './stdin.js';
import { getGitStatus } from './git.js';
import { getProjectInfo } from './project.js';
import { getAnimalType, getPetColors } from './identity.js';
import { initSession, animTick, moodTick, sessionUptime, recordContextPercent, getContextVelocity, getContextTimeRemaining, getMemory, getRelationshipTier, didTierUpgrade } from './state.js';
import { loadConfig, getConfig } from './config.js';
import { getEventContext } from './events.js';
import { getAnimalName } from './animals/index.js';
import { render } from './render/index.js';
import { logError } from './log.js';

async function main(): Promise<void> {
  // Handle subcommands
  const arg = process.argv[2];
  if (arg === 'init') {
    const { runInit } = await import('./init.js');
    runInit();
    return;
  }
  if (arg === 'uninstall' || arg === 'remove') {
    const { runUninstall } = await import('./init.js');
    runUninstall();
    return;
  }
  if (arg === '--demo' || arg === 'demo') {
    const { runDemo } = await import('./demo.js');
    await runDemo();
    return;
  }
  if (arg === 'config' || arg === 'configure') {
    const { runConfigure } = await import('./configure.js');
    await runConfigure();
    return;
  }
  if (arg === 'stats') {
    const { runStats } = await import('./stats.js');
    runStats();
    return;
  }
  if (arg === 'plugins') {
    const { LOADED_PLUGINS } = await import('./plugin-store.js');
    // Touch i18n so plugin loading runs its top-level await.
    await import('./i18n.js');
    const loaded = LOADED_PLUGINS;
    if (!loaded.length) {
      console.log('No plugins loaded.');
      console.log('Drop .mjs files into ~/.config/codachi/plugins/ — see');
      console.log('https://github.com/vincent-k2026/codachi#plugins');
      return;
    }
    console.log(`${loaded.length} plugin(s) loaded:`);
    for (const p of loaded) {
      console.log(`  • ${p.name}  (${p.path})`);
      if (p.messageKeys.length) console.log(`      messages: ${p.messageKeys.join(', ')}`);
      if (p.paletteCount)       console.log(`      palettes: ${p.paletteCount}`);
    }
    return;
  }

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

    const animalType = getAnimalType();
    const petName = cfg.name || getAnimalName(animalType);

    render({
      contextPercent,
      modelName: getModelName(stdin),
      animalType,
      colors: getPetColors(),
      git: cfg.showGit !== false ? getGitStatus(stdin.cwd) : null,
      project: getProjectInfo(stdin.cwd),
      fiveHourUsage: getFiveHourUsage(stdin),
      sevenDayUsage: getSevenDayUsage(stdin),
      contextVelocity: cfg.showVelocity !== false ? getContextVelocity() : 0,
      tokenSummary: cfg.showTokens !== false ? getTokenSummary(stdin) : null,
      cacheHitRate: getCacheHitRate(stdin),
      relationshipTier: getRelationshipTier(),
      sessionNumber: getMemory().totalSessions,
      animTick: animTick(cfg.animationSpeed),
      moodTick: moodTick(),
      uptime: cfg.showUptime !== false ? sessionUptime() : '',
      eventContext: getEventContext(),
      petName,
      contextTimeRemaining: cfg.showVelocity !== false ? getContextTimeRemaining(contextPercent) : null,
      tierUpgraded: didTierUpgrade(),
    });
  } catch (error) {
    logError('index.main', error);
    // Degrade gracefully: keep statusline quiet (empty) so Claude Code's UI stays clean.
    // Users can `tail ~/.claude/plugins/codachi/codachi.log` to diagnose.
  }
}

main();
