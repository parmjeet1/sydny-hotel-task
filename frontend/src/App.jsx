import React, { useState, useEffect } from 'react';
import { Search, MapPin, Building, Calendar, RefreshCw, Clock, CheckCircle } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const PROPERTIES = [
  { id: '16211291', name: 'Olympic Paddington', url: 'https://www.booking.com/hotel/au/olympic-paddington.html' },
  { id: 'venus-potts', name: 'Venus Potts Point', url: 'https://www.booking.com/hotel/au/venus-potts-point-sydney.html' },
  { id: 'venus-surry', name: 'Venus Surry Hills', url: 'https://www.booking.com/hotel/au/venus-surry-hills.html' },
  { id: 'chateau-venus', name: 'Chateau de Venus', url: 'https://www.booking.com/hotel/au/chateau-de-venus.html' }
];

export default function App() {
  const [selectedProperty, setSelectedProperty] = useState('16211291');
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('NEWEST');

  const [hotelData, setHotelData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [cronMeta, setCronMeta] = useState(null);

  // Fetch reviews from Express Backend API
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search: searchQuery,
        score: scoreFilter,
        sort: sortBy
      });
      const res = await fetch(`${API_BASE}/hotels/${selectedProperty}/reviews?${params}`);
      const data = await res.json();
      if (data.success) {
        setHotelData(data.hotel);
        setReviews(data.reviews);
      }
    } catch (err) {
      console.error('Failed to fetch reviews from backend API:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Cron Job Status from Backend
  const fetchCronStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/cron/status`);
      const data = await res.json();
      if (data.success) {
        setCronMeta(data.cron);
      }
    } catch (err) {
      console.error('Failed to fetch cron status:', err);
    }
  };

  useEffect(() => {
    fetchReviews();
    fetchCronStatus();

    // Auto-poll Express backend every 30 seconds for new reviews & cron status
    const interval = setInterval(() => {
      fetchReviews();
      fetchCronStatus();
    }, 30000);

    return () => clearInterval(interval);
  }, [selectedProperty, searchQuery, scoreFilter, sortBy]);

  // Trigger Live Scraper / Cron Sync via Backend API
  const handleTriggerScrape = async () => {
    setScraping(true);
    try {
      const res = await fetch(`${API_BASE}/cron/trigger`, { method: 'POST' });
      const data = await res.json();
      alert(`Cron Sync Result: ${data.result?.message || 'Sync complete!'}`);
      fetchReviews();
      fetchCronStatus();
    } catch (err) {
      alert('Failed to trigger cron sync.');
    } finally {
      setScraping(false);
    }
  };

  const getScoreBadgeClass = (score) => {
    if (score >= 9) return 'superb';
    if (score >= 7) return 'good';
    if (score >= 5) return 'average';
    return 'poor';
  };

  return (
    <div className="app-root">
      {/* Header Banner */}
      <header className="app-header">
        <div className="header-container">
          <div className="logo-group">
            <div className="logo-badge">B.com</div>
            <div>
              <h1 className="app-title">Review Scraper Portal</h1>
              <p className="app-subtitle">Express Backend + Node-Cron Scheduler + React Dashboard</p>
            </div>
          </div>

          <div className="property-selector-pills">
            {PROPERTIES.map(p => (
              <button
                key={p.id}
                className={`pill-btn ${selectedProperty === p.id ? 'active' : ''}`}
                onClick={() => setSelectedProperty(p.id)}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-layout">
        {/* Left Analytics Sidebar */}
        <aside className="sidebar-card">
          <div className="hotel-meta-header">
            <h2 className="hotel-name">{hotelData?.name || 'Olympic Paddington'}</h2>
            <div className="hotel-location">
              <MapPin size={14} />
              <span>{hotelData?.address || 'Sydney, Australia'}</span>
            </div>
          </div>

          <div className="score-overview-box">
            <div className="score-big-badge">{hotelData?.overallScore || '7.1'}</div>
            <div className="score-meta-text">
              <div className="score-label">{hotelData?.scoreText || 'Good'}</div>
              <div className="review-count">Based on {hotelData?.totalReviewsCount || 63} guest reviews</div>
            </div>
          </div>

          {/* Cron Sync Info Box */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.85rem',
            fontSize: '0.82rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontWeight: 600, color: 'var(--text-primary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Clock size={14} color="var(--primary)" /> Auto-Sync Scheduler
              </span>
              <span style={{ color: 'var(--success)', fontSize: '0.75rem', background: 'var(--success-bg)', padding: '0.15rem 0.4rem', borderRadius: 4 }}>ACTIVE</span>
            </div>
            <div style={{ color: 'var(--text-secondary)' }}>Schedule: Every 1 Hour (<code>0 * * * *</code>)</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
              Total Cron Sync Runs: {cronMeta?.totalRuns || 1}
            </div>
          </div>

          <button
            onClick={handleTriggerScrape}
            disabled={scraping}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.65rem 1rem',
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} className={scraping ? 'spin' : ''} />
            {scraping ? 'Running Cron Sync...' : 'Run Cron Sync Now'}
          </button>

          {hotelData?.ratingScores && hotelData.ratingScores.length > 0 && (
            <div className="rating-bars-container">
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Category Ratings</h3>
              {hotelData.ratingScores.map(scoreItem => (
                <div key={scoreItem.name} className="rating-bar-item">
                  <div className="bar-label-group">
                    <span>{scoreItem.translation}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{scoreItem.value.toFixed(1)}</span>
                  </div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(scoreItem.value / 10) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>

        {/* Right Review Feed */}
        <section className="feed-container">
          <div className="feed-header">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                className="search-input"
                placeholder="Search reviews by keyword, room type, or guest name..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filters-row">
              <select
                className="select-control"
                value={scoreFilter}
                onChange={e => setScoreFilter(e.target.value)}
              >
                <option value="ALL">All Scores</option>
                <option value="SUPERB">Wonderful (9+)</option>
                <option value="GOOD">Good (7-9)</option>
                <option value="FAIR">Fair (5-7)</option>
                <option value="POOR">Poor (&lt;5)</option>
              </select>

              <select
                className="select-control"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="NEWEST">Sort: Newest First</option>
                <option value="HIGHEST">Sort: Highest Score</option>
                <option value="LOWEST">Sort: Lowest Score</option>
              </select>
            </div>
          </div>

          {/* Review Cards List */}
          <div className="reviews-grid">
            {loading ? (
              <div className="empty-state">
                <p>Loading reviews from backend API...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="empty-state">
                <p>No reviews matching your search criteria.</p>
              </div>
            ) : (
              reviews.map(review => (
                <article key={review.id} className="review-card">
                  <div className="card-header">
                    <div className="reviewer-profile">
                      <div className="avatar">
                        {review.reviewer.avatarUrl ? (
                          <img src={review.reviewer.avatarUrl} alt={review.reviewer.name} />
                        ) : (
                          review.reviewer.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="reviewer-info">
                        <div className="name">{review.reviewer.name}</div>
                        <div className="meta">
                          <span>{review.reviewer.countryName}</span>
                          <span>•</span>
                          <span>{review.reviewer.travellerType}</span>
                        </div>
                      </div>
                    </div>

                    <div className={`score-badge ${getScoreBadgeClass(review.score)}`}>
                      {review.score} / 10
                    </div>
                  </div>

                  {review.text.title && (
                    <h3 className="review-title">"{review.text.title}"</h3>
                  )}

                  <div className="text-block">
                    {review.text.positive && (
                      <div className="pos-callout">
                        <strong>+ </strong>{review.text.positive}
                      </div>
                    )}
                    {review.text.negative && (
                      <div className="neg-callout">
                        <strong>- </strong>{review.text.negative}
                      </div>
                    )}
                  </div>

                  <div className="stay-meta-tags">
                    <span className="meta-chip">
                      <Building size={12} style={{ display: 'inline', marginRight: 4 }} />
                      {review.stayDetails.roomType}
                    </span>
                    <span className="meta-chip">
                      <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                      Stayed {review.stayDetails.numNights} night(s) in {review.formattedDate}
                    </span>
                    <span className="meta-chip" style={{ marginLeft: 'auto', opacity: 0.7 }}>
                      ID: {review.id}
                    </span>
                  </div>

                  {review.hotelReply && (
                    <div className="hotel-reply-box">
                      <div className="hotel-reply-title">Response from Hotel Management</div>
                      <div className="hotel-reply-text">{review.hotelReply}</div>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
