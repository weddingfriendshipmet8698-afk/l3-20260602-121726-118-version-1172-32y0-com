(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var siteNav = document.querySelector('[data-site-nav]');

  if (menuButton && siteNav) {
    menuButton.addEventListener('click', function () {
      siteNav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    function startTimer() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        startTimer();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(active - 1);
        startTimer();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(active + 1);
        startTimer();
      });
    }

    showSlide(0);
    startTimer();
  }

  var searchInput = document.querySelector('[data-search-input]');
  var searchGrid = document.querySelector('[data-search-grid]');

  if (searchInput && searchGrid) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q') || '';
    var cards = Array.prototype.slice.call(searchGrid.querySelectorAll('[data-search]'));

    searchInput.value = initialQuery;

    function applySearch() {
      var query = searchInput.value.trim().toLowerCase();

      cards.forEach(function (card) {
        var text = (card.getAttribute('data-search') || '').toLowerCase();
        card.classList.toggle('is-hidden', Boolean(query) && text.indexOf(query) === -1);
      });
    }

    searchInput.addEventListener('input', applySearch);
    applySearch();
  }

  var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

  players.forEach(function (player) {
    var video = player.querySelector('video');
    var button = player.querySelector('[data-play-button]');
    var hls = null;

    if (!video || !button) {
      return;
    }

    function attachVideo() {
      var url = video.getAttribute('data-video');

      if (!url) {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!hls) {
          hls = new window.Hls({ enableWorker: true });
          hls.loadSource(url);
          hls.attachMedia(video);
        }
      } else {
        video.src = url;
      }
    }

    function playVideo() {
      attachVideo();
      button.classList.add('is-hidden');
      var result = video.play();

      if (result && typeof result.catch === 'function') {
        result.catch(function () {});
      }
    }

    button.addEventListener('click', playVideo);

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      }
    });

    video.addEventListener('play', function () {
      button.classList.add('is-hidden');
    });
  });
})();
