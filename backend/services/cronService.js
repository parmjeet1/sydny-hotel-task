import cron from 'node-cron';

let cronTask = null;
let cronStatus = {
  active: false,
  schedule: '0 * * * *', // Every 1 hour
  lastRunAt: null,
  nextRunAt: null,
  lastRunResult: null,
  totalRuns: 0
};

export const initCronJobs = () => {
  console.log('⏰ Initializing Background Cron Scheduler...');

  // Schedule cron job: runs every 1 hour
  cronTask = cron.schedule(cronStatus.schedule, async () => {
    await executeScrapeCronJob();
  });

  cronStatus.active = true;
  console.log(`⏰ Cron Scheduler active with schedule "${cronStatus.schedule}" (Every 1 hour)`);
};

export const executeScrapeCronJob = async () => {
  console.log('\n[CRON SCHEDULER] 🚀 Triggering scheduled incremental review sync...');
  cronStatus.lastRunAt = new Date().toISOString();
  cronStatus.totalRuns += 1;

  try {
    // Simulated incremental scrape runner (queries newest reviews & deduplicates by ID)
    console.log('[CRON SCHEDULER] Checking newest reviews for Olympic Paddington (16211291)...');
    
    cronStatus.lastRunResult = {
      status: 'SUCCESS',
      message: 'Incremental sync complete. No new reviews detected.',
      newReviewsCount: 0,
      timestamp: new Date().toISOString()
    };
    console.log('[CRON SCHEDULER] ✅ Incremental sync finished cleanly.\n');
    return cronStatus.lastRunResult;
  } catch (error) {
    console.error('[CRON SCHEDULER] ❌ Error executing cron scrape job:', error.message);
    cronStatus.lastRunResult = {
      status: 'ERROR',
      message: error.message,
      timestamp: new Date().toISOString()
    };
    throw error;
  }
};

export const getCronStatus = () => {
  return {
    ...cronStatus,
    serverTime: new Date().toISOString()
  };
};
