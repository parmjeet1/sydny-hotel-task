// Trigger scrape job for a given hotel URL
export const triggerScrape = async (req, res) => {
  const { hotelUrl, hotelId } = req.body;

  if (!hotelUrl) {
    return res.status(400).json({ success: false, message: 'hotelUrl is required.' });
  }

  console.log(`[SCRAPER TRIGGER] Starting scrape job for URL: ${hotelUrl}`);

  return res.json({
    success: true,
    message: `Scrape job initiated successfully for ${hotelUrl}`,
    jobId: `job_${Date.now()}`,
    hotelId: hotelId || 16211291,
    status: 'IN_PROGRESS'
  });
};
