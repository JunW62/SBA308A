"use strict";

const clientId = "tw24k2z29pj4lk5dtz7u85t8jqdmfy";
const clientSecret = "hs2my9szra9hcrn0y8ce28dxun4mit";

let cachedToken = null;
let tokenExpiry = null;

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

async function getGames() {
  const token = await getAccessToken();

  if (token) {
    const apiUrl = "https://api.igdb.com/v4/games";
    const proxyUrl = "http://localhost:8080/";

    try {
      const response = await axios.post(
        proxyUrl + apiUrl, // Assuming your proxy forwards correctly
        "fields name,genres.name,cover.url; limit 10;", // Query for IGDB
        {
          headers: {
            "Content-Type": "text/plain", // Required by IGDB
            "Client-ID": clientId,
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
    } catch (error) {
      console.error("Error fetching games:", error);
    }
  } else {
    console.error("Failed to get access token.");
  }
}

getGames();
