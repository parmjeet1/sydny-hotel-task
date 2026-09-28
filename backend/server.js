import express from 'express';
import cors from 'cors';
import hotelRoutes from './routes/hotelRoutes.js';
import scrapeRoutes from './routes/scrapeRoutes.js';
import cronRoutes from './routes/cronRoutes.js';
import { initCronJobs } from './services/cronService.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/hotels', hotelRoutes);
app.use('/api/scrape', scrapeRoutes);
app.use('/api/cron', cronRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), message: 'Booking.com Review Scraper API active.' });
});

// Start Server & Initialize Cron Scheduler
app.listen(PORT, () => {
  console.log(`🚀 Scraper Backend Server running on http://localhost:${PORT}`);
  initCronJobs();
});
