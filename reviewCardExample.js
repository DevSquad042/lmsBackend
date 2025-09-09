// Frontend Example: React Component for Displaying Review Cards
// This is a sample component to display reviews fetched from the backend API
// Assumes you have a React frontend that fetches data from /api/reviews/courseReviews/:courseId

import React, { useState, useEffect } from 'react';

const ReviewCard = ({ review }) => {
  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      margin: '10px 0',
      backgroundColor: '#f9f9f9'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4>{review.userName}</h4>
        <span style={{ fontSize: '14px', color: '#666' }}>
          {review.date} at {review.time}
        </span>
      </div>
      <div style={{ margin: '8px 0' }}>
        Rating: {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
      </div>
      <p>{review.comment}</p>
    </div>
  );
};

const ReviewsList = ({ courseId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews/courseReviews/${courseId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data.data.reviews);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [courseId]);

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h2>Course Reviews ({reviews.length})</h2>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        reviews.map(review => (
          <ReviewCard key={review.id} review={review} />
        ))
      )}
    </div>
  );
};

// Usage example:
// <ReviewsList courseId="your-course-id-here" />

export default ReviewsList;