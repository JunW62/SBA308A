"use strict";

const searchEl = document.getElementById("search");
const formEl = document.getElementById("form");

//tw24k2z29pj4lk5dtz7u85t8jqdmfy

// axios.defaults.baseURL = "https://api.igdb.com/v4";

const clientId = "tw24k2z29pj4lk5dtz7u85t8jqdmfy";
const clientSecret = "4zcz1nf8dn5308ye9ugzkamjb87ris";
const grantType = "client_credentials";

const authUrl = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=${grantType}`;

axios
  .post(authUrl)
  .then((response) => {
    const { access_token, expires_in, token_type } = response.data;
    console.log("Access Token:", access_token);
    console.log("Expires In:", expires_in);
    console.log("Token Type:", token_type);
  })
  .catch((error) => {
    console.error("Error fetching access token:", error);
  });
