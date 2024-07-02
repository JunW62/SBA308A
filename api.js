"use strict";
import { labelText } from "./index.js";

const clientId = "tw24k2z29pj4lk5dtz7u85t8jqdmfy";
const clientSecret = "u9tqrr4zz82lqqsf3x6tgg0op5817p";

const apiUrl = "https://api.igdb.com/v4/games";
const proxyUrl = "http://localhost:8080/";

let cachedToken = null;
let tokenExpiry = null;

// get the token

export async function getAccessToken() {
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

export async function getGames(searchTerm = "") {
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
      return response.data;
    } catch (error) {
      console.error("Error fetching games:", error);
      return [];
    }
  } else {
    console.error("Failed to get access token.");
    return [];
  }
}
