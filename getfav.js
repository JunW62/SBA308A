"use strict";

import {
  showGames,
  setupPagination,
  gamesContainer,
  labelText,
} from "./index.js";

const getFavoriteBtn = document.querySelector(".get-favorite i");
export const favoriteBtn = document.querySelectorAll(".favorite i");

export let favorites = [];
let showingFavorites = false;

//Get favorite

getFavoriteBtn.addEventListener("mouseover", () => {
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

export function toggleFavorite(game, buttonElement) {
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
    console.log(buttonElement);
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
