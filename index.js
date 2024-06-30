"use strict";

const clientId = "tw24k2z29pj4lk5dtz7u85t8jqdmfy";
const clientSecret = "u9tqrr4zz82lqqsf3x6tgg0op5817p";

const apiUrl = "https://api.igdb.com/v4/games";
const searchUrl = "https://api.igdb.com/v4/search";
const proxyUrl = "http://localhost:8080/";

const searchEl = document.getElementById("search");
const formEl = document.getElementById("form");
const searchBtn = document.querySelector(".searchbar button");
const favoriteBtn = document.querySelector(".favorite i");
const labelText = document.querySelector(".label");
const gamesContainer = document.querySelector(".games-details");
const paginationEL = document.querySelectorAll(".pagination ul li");
const paginationContainer = document.querySelector(".pagination ul");

let cachedToken = null;
let tokenExpiry = null;
let currentGames = [];

// get the token

async function getAccessToken() {
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }

  const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`;
  try {
    const response = await axios.post(authUrl);
    cachedToken = response.data.access_token;
    tokenExpiry = Date.now() + 3600 * 1000; // Example: token expires in 1 hour
    return cachedToken;
  } catch (error) {
    console.error("Error fetching access token:", error);
    return null;
  }
}

// get the games

getGames();

async function getGames(searchTerm = "") {
  gamesContainer.innerHTML = "";
  const token = await getAccessToken();
  if (token) {
    let endpoint = searchTerm ? searchUrl : apiUrl;
    let query = searchTerm
      ? `fields name, game.name, game.genres.name, game.cover.url, game.release_dates.y, game.platforms.name; search "${searchTerm}"; limit 40;`
      : "fields name, release_dates.y, genres.name, cover.url; sort aggregated_rating_count desc; where cover.url != null; limit 200;";

    try {
      const response = await axios.post(proxyUrl + endpoint, query, {
        headers: {
          Accept: "application/json", // For searchUrl header
          "Content-Type": "text/plain", // For apiUrl headerthe IGDB API
          "Client-ID": clientId,
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data.length);
      currentGames = response.data;
      showGames(1);
      setupPagination(currentGames);
      return currentGames;
    } catch (error) {
      console.error("Error fetching games:", error);
      return [];
    }
  } else {
    console.error("Failed to get access token.");
    return [];
  }
}

// display games

let currentPage = 1;
let numPages = 0;
const itemsPerPage = 20;

function showGames(page) {
  const startIndex = (page - 1) * 20;
  const endIndex = startIndex + 20;
  const gamesToDisplay = currentGames.slice(startIndex, endIndex);

  gamesContainer.innerHTML = "";
  gamesToDisplay.forEach((game) => {
    const gameData = game.game || game;
    const { name, release_dates, genres, cover } = gameData;

    const imageUrl =
      cover && cover.url
        ? cover.url.replace("t_thumb", "t_720p")
        : "./images/placeholder.jpeg";

    const releaseYear =
      release_dates && release_dates.length > 0 && release_dates[0].y
        ? release_dates[0].y
        : "No release date";

    const genreNames =
      genres && genres.length > 0
        ? genres.slice(0, 1).map((genre) => genre.name)
        : "No genre info.";

    const gamesDisplay = document.createElement("div");
    gamesDisplay.classList.add("games");
    gamesDisplay.innerHTML = `
      <img src="${imageUrl}" alt="Cover image for ${name}" />
      <p class="game-title">${name}</p>
      <div class="short-des">
        <p class="year">${releaseYear}</p>
        <p class="genre">${genreNames}</p>
      </div>
    `;
    gamesContainer.appendChild(gamesDisplay);
  });
}
// search

formEl.addEventListener("submit", startSearch);
searchBtn.addEventListener("click", startSearch);

async function startSearch(e) {
  e.preventDefault();
  const searchTerm = searchEl.value;
  if (searchTerm && searchTerm !== "") {
    const searchResults = await getGames(searchTerm);
    labelText.innerHTML = `${searchResults.length} Results for "${searchTerm}"`;
    searchEl.value = "";
  }
}

//favorite

favoriteBtn.onmouseover = () => {
  favoriteBtn.classList.remove("fa-regular");
  favoriteBtn.classList.add("fa-solid");
  favoriteBtn.classList.add("fa-beat-fade");
  favoriteBtn.style.color = "red";
};

favoriteBtn.onmouseout = () => {
  favoriteBtn.classList.remove("fa-solid");
  favoriteBtn.classList.remove("fa-beat-fade");
  favoriteBtn.classList.add("fa-regular");
  favoriteBtn.style.color = " #ddd";
};
// pagination

function setupPagination(games) {
  const numPages = Math.ceil(games.length / itemsPerPage);

  paginationContainer.innerHTML = ""; // Clear existing

  const prevLi = document.createElement("li");
  prevLi.textContent = "Previous";
  prevLi.onclick = () => {
    if (currentPage > 1) {
      currentPage -= 1;
      showGames(games, currentPage);
    }
  };
  paginationContainer.appendChild(prevLi);

  for (let i = 1; i <= numPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.textContent = i;
    pageItem.addEventListener("click", () => showGames(games, i));
    if (i === currentPage) {
      pageItem.classList.add("active");
    }
    paginationContainer.appendChild(pageItem);
    console.log(pageItem);
  }

  const nextLi = document.createElement("li");
  nextLi.textContent = "Next";
  nextLi.onclick = () => {
    if (currentPage < numPages) {
      currentPage += 1;
      showGames(games, currentPage);
    }
  };
  paginationContainer.appendChild(nextLi);
}

function updatePaginationActiveClass() {
  const pageItems = paginationContainer.querySelectorAll("li");
  pageItems.forEach((item, index) => {
    if (parseInt(item.textContent) === currentPage) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

paginationContainer.addEventListener("click", function (event) {
  const target = event.target;
  if (target.tagName === "LI") {
    const value = target.textContent.trim();
    if (value === "Next" && currentPage < numPages) {
      currentPage++;
    } else if (value === "Previous" && currentPage > 1) {
      currentPage--;
    } else if (!isNaN(parseInt(value))) {
      currentPage = parseInt(value);
    }
    showGames(currentPage);
    updatePaginationActiveClass();
  }
});
