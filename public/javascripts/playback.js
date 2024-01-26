document.addEventListener("DOMContentLoaded", function () {
  // Access the streamKey value from the data attribute
  playbackUrl = document
    .querySelector("script[data-playback-url]")
    .getAttribute("data-playback-url");

  // Use the streamKey variable as needed
  console.log(playbackUrl);
});

let playbackUrl = "";

if (IVSPlayer.isPlayerSupported) {
  const player = IVSPlayer.create();
  player.attachHTMLVideoElement(document.getElementById("video-player"));
  player.load(`${playbackUrl}`);
  player.play();
}
