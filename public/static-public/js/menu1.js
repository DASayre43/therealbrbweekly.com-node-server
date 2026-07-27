// const menuBtn = document.getElementById("menuBtn");
// const closeBtn = document.getElementById("closeBtn");
// const overlayMenu = document.getElementById("overlayMenu");

// menuBtn.addEventListener("click", () => {
//     overlayMenu.classList.add("active");
// });

// closeBtn.addEventListener("click", () => {
//     overlayMenu.classList.remove("active");
// });

// document.addEventListener("navLoaded", () => {
  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("closeBtn");
  const overlayMenu = document.getElementById("overlayMenu");

  menuBtn.addEventListener("click", () => {
      overlayMenu.classList.add("active");
  });

  closeBtn.addEventListener("click", () => {
      overlayMenu.classList.remove("active");
  });
// });