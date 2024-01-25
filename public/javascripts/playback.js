if (IVSPlayer.isPlayerSupported) {
  const player = IVSPlayer.create();
  player.attachHTMLVideoElement(document.getElementById("video-player"));
  player.load(
    "https://548ea801f896.eu-west-1.playback.live-video.net/api/video/v1/eu-west-1.117906616901.channel.uxd2qrftIatO.m3u8"
  );
  player.play();
}
