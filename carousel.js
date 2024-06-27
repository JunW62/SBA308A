const body = document.body;
const sliders = document.querySelectorAll(".slide");
const leftBtn = document.getElementById("left");
const rightBtn = document.getElementById("right");

let activeSlide = 1;

function setBgBody() {
  body.style.backgroundImage = sliders[activeSlide].style.backgroundImage;
}

setBgBody();

function setActiveSlide() {
  sliders.forEach((slides) => slides.classList.remove("active"));
  sliders[activeSlide].classList.add("active");
}

rightBtn.addEventListener("click", () => {
  nextSlide();
  setBgBody();
  setActiveSlide();
});

leftBtn.addEventListener("click", () => {
  previousSlide();
  setBgBody();
  setActiveSlide();
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
}, 7000);
