import { getCronStatus, executeScrapeCronJob } from '../services/cronService.js';

// GET /api/cron/status -> Return cron schedule & status metrics
export const getStatus = (req, res) => {
  return res.json({
    success: true,
    cron: getCronStatus()
  });
};

// POST /api/cron/trigger -> Manually trigger background cron job on-demand
export const triggerCron = async (req, res) => {
  try {
    const result = await executeScrapeCronJob();
    return res.json({
      success: true,
      message: 'Background cron sync triggered successfully.',
      result
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to execute cron sync.',
      error: error.message
    });
  }
};
