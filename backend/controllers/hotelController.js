import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const reviewsGqlPath = path.join(__dirname, '..', '..', 'reviews_gql.json');

// Get all tracked hotels
export const getHotels = (req, res) => {
  const properties = [
    { id: '16211291', name: 'Olympic Paddington', url: 'https://www.booking.com/hotel/au/olympic-paddington.html', totalReviews: 63, status: 'active' },
    { id: 'venus-potts', name: 'Venus Potts Point', url: 'https://www.booking.com/hotel/au/venus-potts-point-sydney.html', totalReviews: 0, status: 'ready' },
    { id: 'venus-surry', name: 'Venus Surry Hills', url: 'https://www.booking.com/hotel/au/venus-surry-hills.html', totalReviews: 0, status: 'ready' },
    { id: 'chateau-venus', name: 'Chateau de Venus', url: 'https://www.booking.com/hotel/au/chateau-de-venus.html', totalReviews: 0, status: 'ready' }
  ];
  return res.json({ success: true, properties });
};

// Get reviews for a specific hotel ID with search & score filters
export const getHotelReviews = (req, res) => {
  const { id } = req.params;
  const { search, score, sort } = req.query;

  try {
    if (!fs.existsSync(reviewsGqlPath)) {
      return res.status(404).json({ success: false, message: 'No scraped data available yet.' });
    }

    const rawGql = JSON.parse(fs.readFileSync(reviewsGqlPath, 'utf8'));
    const reviewsMap = new Map();
    let propertyMeta = {
      hotelId: 16211291,
      name: "Olympic Paddington",
      url: "https://www.booking.com/hotel/au/olympic-paddington.html",
      address: "Paddington, Sydney, Australia",
      overallScore: 7.1,
      scoreText: "Good",
      totalReviewsCount: 63,
      ratingScores: []
    };

    rawGql.forEach(entry => {
      const result = entry.response?.data?.reviewListFrontend;
      if (!result) return;

      if (result.reviewsCount) propertyMeta.totalReviewsCount = result.reviewsCount;
      if (result.ratingScores && result.ratingScores.length > 0) {
        propertyMeta.ratingScores = result.ratingScores;
      }

      const cards = result.reviewCard || [];
      cards.forEach(card => {
        if (card.reviewUrl && !reviewsMap.has(card.reviewUrl)) {
          reviewsMap.set(card.reviewUrl, {
            id: card.reviewUrl,
            score: card.reviewScore,
            reviewedDate: card.reviewedDate ? new Date(card.reviewedDate * 1000).toISOString() : null,
            formattedDate: card.reviewedDate ? new Date(card.reviewedDate * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
            reviewer: {
              name: card.guestDetails?.username || 'Anonymous Guest',
              countryName: card.guestDetails?.countryName || 'Unknown',
              countryCode: card.guestDetails?.countryCode || 'un',
              avatarUrl: card.guestDetails?.avatarUrl || null,
              travellerType: card.guestDetails?.guestTypeTranslation || 'Guest'
            },
            stayDetails: {
              roomType: card.bookingDetails?.roomType?.name || 'Standard Room',
              checkinDate: card.bookingDetails?.checkinDate || null,
              checkoutDate: card.bookingDetails?.checkoutDate || null,
              numNights: card.bookingDetails?.numNights || 1,
              customerType: card.bookingDetails?.customerType || 'TRAVELLER'
            },
            text: {
              title: card.textDetails?.title || null,
              positive: card.textDetails?.positiveText || null,
              negative: card.textDetails?.negativeText || null,
              language: card.textDetails?.lang || 'en'
            },
            hotelReply: card.partnerReply?.reply || null,
            helpfulVotes: card.helpfulVotesCount || 0
          });
        }
      });
    });

    let reviewsList = Array.from(reviewsMap.values());

    // Apply Search Filter
    if (search) {
      const q = search.toLowerCase();
      reviewsList = reviewsList.filter(r => {
        const textToSearch = [
          r.reviewer.name,
          r.reviewer.countryName,
          r.stayDetails.roomType,
          r.text.title,
          r.text.positive,
          r.text.negative
        ].filter(Boolean).join(' ').toLowerCase();
        return textToSearch.includes(q);
      });
    }

    // Apply Score Filter
    if (score && score !== 'ALL') {
      if (score === 'SUPERB') reviewsList = reviewsList.filter(r => r.score >= 9);
      else if (score === 'GOOD') reviewsList = reviewsList.filter(r => r.score >= 7 && r.score < 9);
      else if (score === 'FAIR') reviewsList = reviewsList.filter(r => r.score >= 5 && r.score < 7);
      else if (score === 'POOR') reviewsList = reviewsList.filter(r => r.score < 5);
    }

    // Apply Sorting
    if (sort === 'HIGHEST') reviewsList.sort((a, b) => b.score - a.score);
    else if (sort === 'LOWEST') reviewsList.sort((a, b) => a.score - b.score);
    else reviewsList.sort((a, b) => new Date(b.reviewedDate || 0) - new Date(a.reviewedDate || 0));

    return res.json({
      success: true,
      hotel: propertyMeta,
      reviews: reviewsList,
      count: reviewsList.length
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, message: 'Server error parsing reviews.' });
  }
};
