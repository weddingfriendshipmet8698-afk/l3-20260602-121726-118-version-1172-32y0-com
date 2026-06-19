function initPlayer(stream) {
  var video = document.getElementById('movieVideo');
  var overlay = document.getElementById('playOverlay');
  var ready = false;
  var hlsInstance = null;

  if (!video || !overlay || !stream) {
    return;
  }

  function prepare() {
    if (ready) {
      return;
    }
    ready = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
    } else if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
    } else {
      video.src = stream;
    }
  }

  function start() {
    prepare();
    overlay.classList.add('is-hidden');
    var playRequest = video.play();
    if (playRequest && typeof playRequest.catch === 'function') {
      playRequest.catch(function() {
        overlay.classList.remove('is-hidden');
      });
    }
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function() {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function() {
    overlay.classList.add('is-hidden');
  });
  video.addEventListener('pause', function() {
    if (video.currentTime === 0 || video.ended) {
      overlay.classList.remove('is-hidden');
    }
  });
  window.addEventListener('beforeunload', function() {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
