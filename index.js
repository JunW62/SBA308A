document.getElementById("search-box").addEventListener("input", function () {
  const colorInput = this.value.trim();
  if (colorInput.length === 0) {
    document.getElementById("palette-container").innerHTML = ""; // Clear previous results if input is empty
    return;
  }

  // Validate and format color input for API request
  let formattedColor = colorInput.startsWith("#")
    ? colorInput.substring(1)
    : colorInput;
  formattedColor = formattedColor.replace("#", ""); // Ensuring no hash is present before sending to API

  // Use the API to get a palette based on the input color
  generatePaletteFromAPI("#" + formattedColor);
});

function generatePaletteFromAPI(baseColor) {
  axios
    .get(
      `https://www.thecolorapi.com/scheme?hex=${baseColor.substring(
        1
      )}&mode=monochrome&count=4`
    )
    .then((response) => {
      const colors = response.data.colors.map((color) => color.hex.value);
      displayPalette(colors);
    })
    .catch((error) => console.error("Error fetching color data:", error));
}

function displayPalette(colors) {
  const paletteContainer = document.getElementById("palette-container");
  paletteContainer.innerHTML = ""; // Clear previous results
  const paletteDiv = document.createElement("div");
  paletteDiv.className = "palette";
  colors.forEach((color) => {
    const colorDiv = document.createElement("div");
    colorDiv.style.backgroundColor = color;
    colorDiv.className = "color";
    paletteDiv.appendChild(colorDiv);
  });
  paletteContainer.appendChild(paletteDiv);
}
