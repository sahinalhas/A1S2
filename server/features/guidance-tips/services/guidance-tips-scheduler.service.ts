import { guidanceTipsService } from './guidance-tips.service.js';
import { logger } from '../../../utils/logger.js';

let schedulerInterval: NodeJS.Timeout | null = null;
let cleanupInterval: NodeJS.Timeout | null = null;

const TIP_GENERATION_INTERVAL = 4 * 60 * 60 * 1000;
const CLEANUP_INTERVAL = 24 * 60 * 60 * 1000;
const MIN_TIPS_THRESHOLD = 5;
const MAX_TIPS_COUNT = 50;

async function generateTipsIfNeeded(): Promise<void> {
  try {
    const currentCount = guidanceTipsService.getTipCount();
    
    if (currentCount < MIN_TIPS_THRESHOLD) {
      logger.info(`Tip count (${currentCount}) below threshold, attempting to generate new tips via AI...`, 'GuidanceTipsScheduler');
      
      const tipsToGenerate = Math.min(3, MIN_TIPS_THRESHOLD - currentCount);
      let generatedCount = 0;
      
      for (let i = 0; i < tipsToGenerate; i++) {
        const tip = await guidanceTipsService.generateNewTip();
        if (tip) {
          generatedCount++;
        }
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
      
      if (generatedCount > 0) {
        logger.info(`Successfully generated ${generatedCount} new tips from AI`, 'GuidanceTipsScheduler');
      } else {
        logger.warn('AI unavailable - no tips generated this cycle. Will retry next interval.', 'GuidanceTipsScheduler');
      }
    } else if (currentCount < MAX_TIPS_COUNT) {
      const tip = await guidanceTipsService.generateNewTip();
      if (tip) {
        logger.info(`Generated periodic tip: ${tip.title}`, 'GuidanceTipsScheduler');
      } else {
        logger.info('AI unavailable for periodic tip generation. Will retry next interval.', 'GuidanceTipsScheduler');
      }
    } else {
      logger.info(`Tip count (${currentCount}) at maximum, skipping generation`, 'GuidanceTipsScheduler');
    }
  } catch (error) {
    logger.error('Error in tip generation scheduler', 'GuidanceTipsScheduler', error);
  }
}

async function cleanupOldTips(): Promise<void> {
  try {
    const deleted = guidanceTipsService.cleanupOldTips(90);
    if (deleted > 0) {
      logger.info(`Cleaned up ${deleted} old tips`, 'GuidanceTipsScheduler');
    }
  } catch (error) {
    logger.error('Error in tip cleanup scheduler', 'GuidanceTipsScheduler', error);
  }
}

export function startGuidanceTipsScheduler(): void {
  if (schedulerInterval) {
    logger.warn('Guidance tips scheduler is already running', 'GuidanceTipsScheduler');
    return;
  }

  logger.info('Starting guidance tips scheduler...', 'GuidanceTipsScheduler');
  logger.info(`Tips will be generated every ${TIP_GENERATION_INTERVAL / 1000 / 60} minutes`, 'GuidanceTipsScheduler');

  setTimeout(async () => {
    await generateTipsIfNeeded();
  }, 10000);

  schedulerInterval = setInterval(async () => {
    await generateTipsIfNeeded();
  }, TIP_GENERATION_INTERVAL);

  cleanupInterval = setInterval(async () => {
    await cleanupOldTips();
  }, CLEANUP_INTERVAL);

  logger.info('Guidance tips scheduler started successfully', 'GuidanceTipsScheduler');
}

export function stopGuidanceTipsScheduler(): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
    schedulerInterval = null;
    logger.info('Guidance tips generation scheduler stopped', 'GuidanceTipsScheduler');
  }

  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Guidance tips cleanup scheduler stopped', 'GuidanceTipsScheduler');
  }
}

export async function triggerManualGeneration(): Promise<void> {
  logger.info('Manual tip generation triggered', 'GuidanceTipsScheduler');
  await generateTipsIfNeeded();
}
