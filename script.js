const API_KEY = 'c7cc32987f94a4f1e4e58f239edc0e78';
const API_URL = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&language=en-US&page=1`;
const IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

const moviesContainer = document.getElementById('movies');

// Load movies
async function getMovies() {
    const res = await fetch(API_URL);
    const data = await res.json();
    displayMovies(data.results);
}

function displayMovies(movies) {
    moviesContainer.innerHTML = '';
    movies.forEach(movie => {
        const movieEl = document.createElement('div');
        movieEl.classList.add('movie-card');

        movieEl.innerHTML = `
            <img src="${IMAGE_URL + movie.poster_path}" alt="${movie.title}">
            <div class="movie-content">
                <h3>${movie.title}</h3>
                <div class="rating-stars" data-id="${movie.id}">
                    ${createStars()}
                </div>
                <div class="comment-form">
                    <input type="text" placeholder="Your name" class="user-name">
                    <textarea placeholder="Your comment" class="user-comment"></textarea>
                    <button>Submit</button>
                </div>
                <div class="comments"></div>
            </div>
        `;

        moviesContainer.appendChild(movieEl);

        const stars = movieEl.querySelectorAll('.rating-stars i');
        const commentForm = movieEl.querySelector('.comment-form');
        const commentsContainer = movieEl.querySelector('.comments');

        // Load saved ratings/comments
        loadRatings(movie.id, stars, commentsContainer);

        // Star click
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                stars.forEach((s, i) => s.classList.toggle('selected', i <= index));
                saveRating(movie.id, index + 1, null, null); // save rating only
            });
        });

        // Comment form submit
        commentForm.querySelector('button').addEventListener('click', () => {
            const name = commentForm.querySelector('.user-name').value || 'Anonymous';
            const comment = commentForm.querySelector('.user-comment').value;
            const rating = [...stars].filter(s => s.classList.contains('selected')).length;

            if(!comment) return alert("Please enter a comment");

            saveRating(movie.id, rating, name, comment);
            displayComments(movie.id, commentsContainer);
            commentForm.querySelector('.user-comment').value = '';
            commentForm.querySelector('.user-name').value = '';
        });

        displayComments(movie.id, commentsContainer);
    });
}

function createStars() {
    return Array(5).fill('<i class="fa-regular fa-star"></i>').join('');
}

// Local storage functions
function saveRating(movieId, rating, name, comment) {
    const stored = JSON.parse(localStorage.getItem('movieRatings')) || {};
    if(!stored[movieId]) stored[movieId] = { ratings: [], comments: [] };

    if(rating) stored[movieId].ratings.push(rating);
    if(name && comment) stored[movieId].comments.push({ name, comment, rating });

    localStorage.setItem('movieRatings', JSON.stringify(stored));
}

function loadRatings(movieId, stars, commentsContainer) {
    const stored = JSON.parse(localStorage.getItem('movieRatings')) || {};
    if(stored[movieId]?.ratings) {
        const lastRating = stored[movieId].ratings.slice(-1)[0];
        stars.forEach((s, i) => s.classList.toggle('selected', i < lastRating));
    }
    displayComments(movieId, commentsContainer);
}

function displayComments(movieId, container) {
    const stored = JSON.parse(localStorage.getItem('movieRatings')) || {};
    const comments = stored[movieId]?.comments || [];
    container.innerHTML = comments.map(c => `<div class="comment"><strong>${c.name}</strong> (${c.rating}⭐): ${c.comment}</div>`).join('');
}

// Initialize
getMovies();

