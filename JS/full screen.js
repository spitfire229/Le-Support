const imageContainers = document.querySelectorAll(".image-container");
      
imageContainers.forEach(container => {
  container.addEventListener("click", () => {
    const image = container.querySelector("img");
    const fullscreen = document.createElement("div");
    fullscreen.classList.add("fullscreen");

    const fullscreenImage = document.createElement("img");
    fullscreenImage.src = image.src;

    fullscreen.appendChild(fullscreenImage);
    document.body.appendChild(fullscreen);

    fullscreen.addEventListener("click", () => {
      fullscreen.remove();
    });
  });
});