"use strict";

const clientId = "tw24k2z29pj4lk5dtz7u85t8jqdmfy";
const clientSecret = "u9tqrr4zz82lqqsf3x6tgg0op5817p";

const apiUrl = "https://api.igdb.com/v4/games";
const proxyUrl = "http://localhost:8080/";

const searchEl = document.getElementById("search");
const formEl = document.getElementById("form");
const searchBtn = document.querySelector(".searchbar button");
const gameBtn = document.querySelector(".goback-game");
const getFavoriteBtn = document.querySelector(".get-favorite I");
const favoriteBtn = document.querySelectorAll(".favorite i");
const labelText = document.querySelector(".label");
const gamesContainer = document.querySelector(".games-details");
const paginationEL = document.querySelectorAll(".pagination ul li");
const paginationContainer = document.querySelector(".pagination ul");

let cachedToken = null;
let tokenExpiry = null;
let currentGames = [];
let favorites = [];
let showingFavorites = false;

//Setup after DOM fully loaded

document.addEventListener("DOMContentLoaded", () => {
  if (gameBtn) {
    gameBtn.addEventListener("click", () => {
      getGames();
      labelText.innerHTML = `What's Popular`;
    });
  }
  setupEventLisenter();
  getGames();
});

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
    let query = searchTerm
      ? `fields name, name, genres.name, cover.url, release_dates.y, platforms.name; search "${searchTerm}"; limit 40;`
      : "fields name, release_dates.y, genres.name, cover.url; sort aggregated_rating_count desc; where cover.url != null; limit 200;";

    try {
      const response = await axios.post(proxyUrl + apiUrl, query, {
        headers: {
          "Content-Type": "text/plain", // For apiUrl headerthe IGDB API
          "Client-ID": clientId,
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(response.data);

      currentGames = response.data;
      showGames(1, false);
      setupPagination(currentGames, false);
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

function showGames(page, showFav = false) {
  let gamesToDisplay = showFav ? favorites : currentGames;
  if (showFav) {
    gamesToDisplay = favorites;
  } else {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    gamesToDisplay = gamesToDisplay.slice(startIndex, endIndex);
  }
  gamesContainer.innerHTML = "";
  gamesToDisplay.forEach((game) => {
    const gameData = game;
    const { id, name, release_dates, genres, cover } = gameData;

    const isFavorite = favorites.some((fav) => fav.id === id);
    const favoriteClass = isFavorite ? "fa-solid" : "fa-regular";
    const favoriteColor = isFavorite ? "red" : "#ddd";

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
    gamesDisplay.dataset.gameId = id;
    gamesDisplay.innerHTML = `
      <button type="button" class="favorite ${favoriteClass} fa-heart" style="color: ${favoriteColor};"></button>
      <img src="${imageUrl}" alt="Cover image for ${name}" />   
      <p class="game-title">${name}</p>
      <div class="short-des">
        <p class="year">${releaseYear}</p>
        <p class="genre">${genreNames}</p>
      </div>
    `;
    gamesContainer.appendChild(gamesDisplay);
    // console.log(gameData);
    // console.log(currentGames);
  });

  gamesContainer.addEventListener("mouseover", function (event) {
    event.stopPropagation();
    if (event.target.classList.contains("fa-heart")) {
      event.target.classList.remove("fa-regular");
      event.target.classList.add("fa-solid", "fa-beat-fade", "unclicked");
      event.target.style.color = "red";
    }
  });
}

function setupEventLisenter() {
  gamesContainer.addEventListener("click", function (event) {
    const gameDiv = event.target.closest(".games");
    if (!gameDiv) {
      console.error("Failed to find gameDiv");
      return;
    }

    const gameIndex = gameDiv.dataset.gameId;
    const game = currentGames.find((g) => g.id.toString() === gameIndex);
    console.log(game);
    console.log(gameIndex);

    if (game) {
      toggleFavorite(game, event.target);
    } else {
      console.error("Game data not found for ID:", gameIndex);
    }
  });

  gamesContainer.addEventListener("mouseout", function (event) {
    if (event.target.classList.contains("unclicked")) {
      event.target.classList.remove("fa-solid", "fa-beat-fade");
      event.target.classList.add("fa-regular");
      event.target.style.color = "#ddd";
    }
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

//Get favorite

getFavoriteBtn.addEventListener("mouseover", () => {
  console.log("Mouseover event triggered");
  getFavoriteBtn.classList.remove("fa-regular");
  getFavoriteBtn.classList.add("fa-solid");
  getFavoriteBtn.classList.add("fa-beat-fade");
  getFavoriteBtn.style.color = "red";
});

getFavoriteBtn.addEventListener("mouseout", () => {
  getFavoriteBtn.classList.remove("fa-solid");
  getFavoriteBtn.classList.remove("fa-beat-fade");
  getFavoriteBtn.classList.add("fa-regular");
  getFavoriteBtn.style.color = " #ddd";
});

function toggleFavorite(game, buttonElement) {
  const gameId = game.id;
  const isFavorite = favorites.some((fav) => fav.id === gameId);
  if (isFavorite) {
    favorites = favorites.filter((fav) => fav.id !== gameId); // Remove from favorites
    buttonElement.classList.remove(
      "favSelected",
      "fa-solid",
      "fa-beat-fade",
      "unclicked"
    );
    buttonElement.classList.add("fa-regular");
    buttonElement.style.color = "#ddd";
    console.log("Removed from favorites:", game.name);
  } else {
    favorites.push(game); // Add to favorites
    buttonElement.classList.add("favSelected");
    buttonElement.classList.remove("fa-beat-fade", "unclicked");
    console.log("Added to favorites:", game.name);
  }
  console.log(isFavorite);
}

getFavoriteBtn.addEventListener("click", (e) => {
  showingFavorites = !showingFavorites;
  if (favorites.length === 0) {
    labelText.innerHTML = `Your have 0 Favorite Game`;
    gamesContainer.innerHTML =
      "<p class='no-favorite'>No favorite game has been selected.</p>";
    setupPagination([], true);
  } else if (favorites.length === 1) {
    showGames(1, true);
    labelText.innerHTML = `Your have 1 Favorite Game`;
    setupPagination(favorites, true);
  } else {
    showGames(1, true);
    labelText.innerHTML = `Your have ${favorites.length} Favorite Games`;
    setupPagination(favorites, true);
  }
  // console.log(favorites);
  // console.log(favGames);
});

// pagination

function setupPagination(games, showFav) {
  const numPages = Math.ceil(games.length / itemsPerPage);

  paginationContainer.innerHTML = ""; // Clear existing

  const prevLi = document.createElement("li");
  prevLi.textContent = "Previous";
  prevLi.onclick = () => {
    if (currentPage > 1) {
      currentPage -= 1;
      showGames(currentPage, showFav);
    }
  };
  paginationContainer.appendChild(prevLi);

  for (let i = 1; i <= numPages; i++) {
    const pageItem = document.createElement("li");
    pageItem.textContent = i;
    pageItem.addEventListener("click", () => {
      currentPage = i;
      showGames(currentPage, showFav);
    });
    if (i === currentPage) {
      pageItem.classList.add("active");
    }
    paginationContainer.appendChild(pageItem);
    // console.log(pageItem);
  }

  const nextLi = document.createElement("li");
  nextLi.textContent = "Next";
  nextLi.onclick = () => {
    if (currentPage < numPages) {
      currentPage += 1;
      showGames(currentPage, showFav);
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
