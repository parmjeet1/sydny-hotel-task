import express from 'express';
import { triggerScrape } from '../controllers/scrapeController.js';

const router = express.Router();

// POST /api/scrape -> Trigger Playwright scraper job
router.post('/', triggerScrape);

export default router;
