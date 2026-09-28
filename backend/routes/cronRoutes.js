import express from 'express';
import { getStatus, triggerCron } from '../controllers/cronController.js';

const router = express.Router();

// GET /api/cron/status
router.get('/status', getStatus);

// POST /api/cron/trigger
router.post('/trigger', triggerCron);

export default router;
