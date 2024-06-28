"use strict";

const clientId = "tw24k2z29pj4lk5dtz7u85t8jqdmfy";
const clientSecret = "u9tqrr4zz82lqqsf3x6tgg0op5817p";

const apiUrl = "https://api.igdb.com/v4/games";
const proxyUrl = "http://localhost:8080/";

const searchEl = document.getElementById("search");
const formEl = document.getElementById("form");
const gamesContainer = document.querySelector(".games-details");
const paginationEL = document.querySelectorAll(".pagination ul li");
const paginationContainer = document.querySelector(".pagination ul");

let cachedToken = null;
let tokenExpiry = null;

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

async function getGames() {
  const token = await getAccessToken();

  if (token) {
    try {
      const response = await axios.post(
        proxyUrl + apiUrl, // Assuming your proxy forwards correctly
        "fields name, release_dates.y, genres.name, cover.url; sort aggregated_rating_count desc; where cover.url != null; limit 200;", // Query for IGDB  & release_dates.y != null & genres.name != null
        {
          headers: {
            "Content-Type": "text/plain", // Required by IGDB
            "Client-ID": clientId,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // console.log(response.data);
      showGames(response.data, 1);
      setupPagination(response.data);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  } else {
    console.error("Failed to get access token.");
  }
}

// display games

let currentPage = 1;
let numPages = 0;
const itemsPerPage = 20;

function showGames(games, page) {
  const startIndex = (page - 1) * 20;
  const endIndex = startIndex + 20;
  const gamesToDisplay = games.slice(startIndex, endIndex);

  gamesContainer.innerHTML = "";
  gamesToDisplay.forEach((game) => {
    const { name, release_dates, genres, cover } = game;

    const imageUrl =
      cover && cover.url
        ? cover.url.replace("t_thumb", "t_720p")
        : "./images/placeholder.jpeg";

    const releaseYear =
      release_dates && release_dates.length > 0
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

paginationContainer.addEventListener("click", function (event) {
  const target = event.target;
  if (target.tagName === "LI") {
    const value = target.textContent.trim();
    if (value === "Next" && currentPage < totalPages) {
      currentPage++;
    } else if (value === "Previous" && currentPage > 1) {
      currentPage--;
    } else if (!isNaN(parseInt(value))) {
      currentPage = parseInt(value);
    }
    showGames(games, currentPage);
  }
});
