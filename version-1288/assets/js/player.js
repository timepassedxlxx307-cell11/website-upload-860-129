(function () {
  function initMoviePlayer(source) {
    var video = document.getElementById("movie-video");
    var button = document.getElementById("movie-play-button");
    if (!video || !button || !source) {
      return;
    }
    var prepared = false;
    var hlsInstance = null;

    function bindSource() {
      if (prepared) {
        return;
      }
      prepared = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = source;
    }

    function playVideo() {
      bindSource();
      button.style.display = "none";
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          button.style.display = "grid";
        });
      }
    }

    button.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      button.style.display = "none";
    });
    video.addEventListener("pause", function () {
      if (!video.ended) {
        button.style.display = "grid";
      }
    });
    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  window.initMoviePlayer = initMoviePlayer;
}());
