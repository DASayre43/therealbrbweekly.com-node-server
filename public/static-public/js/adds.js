const ads = [
  {
    video: "adds/VID_20260126_160900477.mp4",
    image: "adds/Kazari's price slashing rampage.png"
  },
  {
    video: "adds/VID_20260126_162254833.mp4",
    image: "adds/Kazari's price slashing rampage.png"
  },
  
];

// document.addEventListener("addLoaded", () => {
    const videoEl = document.getElementById("adVideo");
    const imageEl = document.getElementById("adImage");
    const replayBtn = document.getElementById("replayBtn");
    const rerollBtn = document.getElementById("rerollBtn");

    let currentAd = null;

    /* Pick a random ad */
    function pickRandomAd() {
      const index = Math.floor(Math.random() * ads.length);
      currentAd = ads[index];
    }

    /* Load and play the current ad */
    function playAd() {
      imageEl.style.display = "none";
      videoEl.style.display = "block";

      videoEl.src = currentAd.video;
      videoEl.currentTime = 0;
      videoEl.play();
    }

    /* When video finishes, show static image */
    videoEl.addEventListener("ended", () => {
      videoEl.style.display = "none";
      imageEl.src = currentAd.image;
      imageEl.style.display = "block";
    });

    /* Button actions */
    replayBtn.addEventListener("click", () => {
      playAd();
    });

    rerollBtn.addEventListener("click", () => {
      pickRandomAd();
      playAd();
    });

    /* On page load */
    window.addEventListener("load", () => {
     pickRandomAd();
      playAd();
    });
// });