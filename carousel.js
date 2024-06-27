const header = document.querySelector("header");
const sliders = document.querySelectorAll(".slide");
const sliderContent = document.querySelectorAll(".slider-content");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

let activeSlide = 1;

function setBgBody() {
  header.style.backgroundImage = sliders[activeSlide].style.backgroundImage;
}

setBgBody();

function setActiveSlide() {
  sliders.forEach((slides) => slides.classList.remove("active"));
  sliders[activeSlide].classList.add("active");
}

function setContent() {
  sliderContent.forEach((sliderContents) =>
    sliderContents.classList.remove("active")
  );
  sliderContent[activeSlide].classList.add("active");
  console.log(sliderContent);
}

rightBtn.addEventListener("click", () => {
  nextSlide();
  setBgBody();
  setActiveSlide();
  setContent();
});

leftBtn.addEventListener("click", () => {
  previousSlide();
  setBgBody();
  setActiveSlide();
  setContent();
});

function nextSlide() {
  activeSlide++;
  if (activeSlide > sliders.length - 1) {
    activeSlide = 0;
  }
}

function previousSlide() {
  activeSlide--;
  if (activeSlide < 0) {
    activeSlide = sliders.length - 1;
  }
}

setInterval(() => {
  nextSlide();
  setBgBody();
  setActiveSlide();
  setContent();
}, 7000);
