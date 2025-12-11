// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  initializeReviewSystem();
});

function initializeReviewSystem() {
  loadReviewsForCurrentTool();
  
  // Handle form submissions
  document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('review-form')) {
      e.preventDefault();
      submitReview(e.target);
    }
  });
}

function submitReview(form) {
  const toolId = form.id.replace('reviewForm-', '');
  const formData = new FormData(form);
  
  const newReview = {
    id: 'review-' + Date.now(),
    toolId: toolId,
    author: formData.get('name') || 'Anonymous',
    rating: parseInt(formData.get('rating')),
    content: formData.get('review'),
    date: new Date().toISOString()
  };
  
  if (isNaN(newReview.rating)) {
    alert('Please select a rating');
    return;
  }
  
  saveReview(newReview);
  displayReviews(toolId);
  form.reset();
  alert('Thank you for your review!');
}

function saveReview(review) {
  let allReviews = JSON.parse(localStorage.getItem('nexusReviews')) || {};
  
  if (!allReviews[review.toolId]) {
    allReviews[review.toolId] = [];
  }
  
  allReviews[review.toolId].push(review);
  localStorage.setItem('nexusReviews', JSON.stringify(allReviews));
  updateToolRating(review.toolId);
}

function loadReviewsForCurrentTool() {
  const toolId = getCurrentToolId();
  if (toolId) displayReviews(toolId);
}

function displayReviews(toolId) {
  const reviewsContainer = document.getElementById(`reviews-${toolId}`);
  if (!reviewsContainer) return;
  
  const reviews = getReviewsForTool(toolId);
  
  if (reviews.length === 0) {
    reviewsContainer.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to review this tool!</div>';
    return;
  }
  
  reviews.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  reviewsContainer.innerHTML = reviews.map(review => `
    <div class="review">
      <div class="review-header">
        <span class="review-author">${review.author}</span>
        <span class="review-rating">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</span>
        <span class="review-date">${formatDate(review.date)}</span>
      </div>
      <div class="review-content">${review.content}</div>
    </div>
  `).join('');
}

function getReviewsForTool(toolId) {
  const allReviews = JSON.parse(localStorage.getItem('nexusReviews')) || {};
  return allReviews[toolId] || [];
}

function formatDate(isoString) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

function updateToolRating(toolId) {
  const reviews = getReviewsForTool(toolId);
  if (reviews.length === 0) return 0;
  
  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  const average = total / reviews.length;
  
  const ratingElements = document.querySelectorAll(`.tool-rating[data-tool="${toolId}"]`);
  ratingElements.forEach(el => {
    el.textContent = average.toFixed(1);
  });
  
  return average;
}

function getCurrentToolId() {
  // Adjust based on your app's structure:
  const modal = document.querySelector('.tool-detail-modal');
  if (modal) return modal.dataset.toolId;
  
  const params = new URLSearchParams(window.location.search);
  return params.get('toolId');
}