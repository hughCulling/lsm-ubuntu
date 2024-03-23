// document.addEventListener("DOMContentLoaded", function () {
//   // Access the 'streamKey' value from the data attribute.
//   playbackUrl = document
//     .querySelector("script[data-playback-url]")
//     .getAttribute("data-playback-url");

//   // Use the 'streamKey' variable as needed.
//   console.log(playbackUrl);

//   if (IVSPlayer.isPlayerSupported) {
//     const player = IVSPlayer.create();
//     player.attachHTMLVideoElement(document.getElementById("video-player"));
//     player.load(`${playbackUrl}`);
//     player.play();
//   }
// });

// let playbackUrl = "";

// if (IVSPlayer.isPlayerSupported) {
//   const player = IVSPlayer.create();
//   player.attachHTMLVideoElement(document.getElementById("video-player"));
//   player.load(`${playbackUrl}`);
//   player.play();
// }

import { createRoot } from "react-dom/client";

// Clear the existing HTML content
document.body.innerHTML = '<div id="app"></div>';

// Render your React component instead
const root = createRoot(document.getElementById("app"));
root.render(<h1>Hello, world</h1>);
