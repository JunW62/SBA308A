"use strict";

import { getGames } from "./api.js";
import { toggleFavorite, favorites, favoriteBtn } from "./getfav.js";

const searchEl = document.getElementById("search");
const formEl = document.getElementById("form");
const searchBtn = document.querySelector(".searchbar button");
const gameBtn = document.querySelector(".goback-game");
export const labelText = document.querySelector(".label");
export const gamesContainer = document.querySelector(".games-details");
const paginationEL = document.querySelectorAll(".pagination ul li");
const paginationContainer = document.querySelector(".pagination ul");

export let currentGames = [];

//Setup after DOM fully loaded

document.addEventListener("DOMContentLoaded", () => {
  gamesContainer.innerHTML = "";
  if (gameBtn) {
    gameBtn.addEventListener("click", () => {
      getGames().then((games) => {
        currentGames = games;
        showGames(1, false);
        setupPagination(currentGames, false);
      });
      labelText.innerHTML = `What's Popular`;
    });
  }
  setupEventLisenter();
  getGames().then((games) => {
    currentGames = games;
    showGames(1, false);
    setupPagination(currentGames, false);
  });
  // console.log(currentGames);
});

// display games

let currentPage = 1;
let numPages = 0;
const itemsPerPage = 20;

export function showGames(page, showFav = false) {
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
    console.log(event.target);
  });

  gamesContainer.addEventListener("mouseout", function (event) {
    if (event.target.classList.contains("unclicked")) {
      event.target.classList.remove("fa-solid", "fa-beat-fade");
      event.target.classList.add("fa-regular");
      event.target.style.color = "#ddd";
    }
    if (event.target.classList.contains("favSelected")) {
      console.log(event.target);
      event.target.classList.remove("fa-beat-fade");
      event.target.classList.add("fa-solid");
      event.target.style.color = "red";
      console.log("Mouseout event triggered");
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
    currentGames = searchResults;
    showGames(1, false);
    setupPagination(currentGames, false);
    labelText.innerHTML = `${searchResults.length} Results for "${searchTerm}"`;
    searchEl.value = "";
  }
}

// pagination

export function setupPagination(games, showFav) {
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
