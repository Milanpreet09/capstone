const API_KEY = 'JXS4BMEl7v3CP8fFR9jFWqIJeB15cfNgoee1EJ6g';

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('date-form');
    const dateInput = document.getElementById('date-input');
    const pictureContainer = document.getElementById('picture-container');
    const favouritesContainer = document.getElementById('favourites-container');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const date = dateInput.value;
        if (isValidDate(date)) {
            const pictureData = await fetchAPOD(date);
            displayPicture(pictureData);
        } else {
            alert('Please enter a valid date in the format YYYY-MM-DD.');
        }
    });

    favouritesContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-favourite')) {
            const date = event.target.dataset.date;
            removeFavourite(date);
        }
    });

    loadFavourites();

    async function fetchAPOD(date) {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${API_KEY}&date=${date}`);
        return response.json();
    }

    function displayPicture(pictureData) {
        pictureContainer.innerHTML = `
            <h2>${pictureData.title}</h2>
            <p>${pictureData.date}</p>
            <p>${pictureData.explanation}</p>
            ${pictureData.media_type === 'image' ? `<img src="${pictureData.url}" alt="${pictureData.title}" id="apod-image">` : `<iframe src="${pictureData.url}" frameborder="0" allowfullscreen></iframe>`}
            <button id="save-favourite" data-date="${pictureData.date}">Save as Favourite</button>
        `;

        document.getElementById('save-favourite').addEventListener('click', () => {
            saveFavourite(pictureData);
        });

        if (pictureData.media_type === 'image') {
            document.getElementById('apod-image').addEventListener('click', () => {
                window.open(pictureData.hdurl, '_blank');
            });
        }
    }

    function saveFavourite(pictureData) {
        const favourites = getFavourites();
        favourites[pictureData.date] = pictureData;
        localStorage.setItem('favourites', JSON.stringify(favourites));
        loadFavourites();
    }

    function removeFavourite(date) {
        const favourites = getFavourites();
        delete favourites[date];
        localStorage.setItem('favourites', JSON.stringify(favourites));
        loadFavourites();
    }

    function loadFavourites() {
        const favourites = getFavourites();
        favouritesContainer.innerHTML = Object.keys(favourites).map(date => {
            const pictureData = favourites[date];
            return `
                <div class="favourite-item">
                    <h3>${pictureData.title}</h3>
                    <p>${pictureData.date}</p>
                    <button class="remove-favourite" data-date="${date}">Remove</button>
                </div>
            `;
        }).join('');
    }

    function getFavourites() {
        return JSON.parse(localStorage.getItem('favourites')) || {};
    }

    function isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateString.match(regex)) return false;
        const date = new Date(dateString);
        const timestamp = date.getTime();
        if (typeof timestamp !== 'number' || Number.isNaN(timestamp)) return false;
        return dateString === date.toISOString().split('T')[0];
    }
});
