import axios from 'axios';
import Notiflix from 'notiflix';
import { fetchImages } from './pixabay-api';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let searchQuery = '';
let currentPage = 1;
const perPage = 40;

form.addEventListener('submit', onSearch);
loadMoreBtn.addEventListener('click', onLoadMore);

async function onSearch(e) {
  e.preventDefault();
  searchQuery = e.target.searchQuery.value.trim();
  currentPage = 1;
  
  if (searchQuery === '') {
    Notiflix.Notify.warning('Please enter a search query.');
    return;
  }

  clearGallery();
  loadMoreBtn.classList.add('hidden');

  try {
    const { hits, totalHits } = await fetchImages(searchQuery, currentPage, perPage);
    
    if (hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');
      return;
    }

    renderGallery(hits);
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`);

    if (totalHits > perPage) {
      loadMoreBtn.classList.remove('hidden');
    }
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
  }
}

async function onLoadMore() {
  currentPage += 1;

  try {
    const { hits, totalHits } = await fetchImages(searchQuery, currentPage, perPage);

    renderGallery(hits);

    const totalLoadedImages = currentPage * perPage;
    if (totalLoadedImages >= totalHits) {
      loadMoreBtn.classList.add('hidden');
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    console.error(error);
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
  }
}

function renderGallery(images) {
  const markup = images.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
    return `
      <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
          <p class="info-item"><b>Likes</b> ${likes}</p>
          <p class="info-item"><b>Views</b> ${views}</p>
          <p class="info-item"><b>Comments</b> ${comments}</p>
          <p class="info-item"><b>Downloads</b> ${downloads}</p>
        </div>
      </div>
    `;
  }).join('');
  
  gallery.insertAdjacentHTML('beforeend', markup);
}

function clearGallery() {
  gallery.innerHTML = '';
}
