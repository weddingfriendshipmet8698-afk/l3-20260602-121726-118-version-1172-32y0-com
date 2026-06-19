(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  ready(function () {
    var toggle = document.querySelector('[data-mobile-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
      var prev = hero.querySelector('[data-hero-prev]');
      var next = hero.querySelector('[data-hero-next]');
      var current = 0;
      var timer = null;

      function show(index) {
        if (!slides.length) {
          return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === current);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === current);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(current + 1);
        }, 5200);
      }

      function restart() {
        window.clearInterval(timer);
        start();
      }

      dots.forEach(function (dot) {
        dot.addEventListener('click', function () {
          show(Number(dot.getAttribute('data-hero-dot')) || 0);
          restart();
        });
      });

      if (prev) {
        prev.addEventListener('click', function () {
          show(current - 1);
          restart();
        });
      }

      if (next) {
        next.addEventListener('click', function () {
          show(current + 1);
          restart();
        });
      }

      show(0);
      start();
    }

    var searchInput = document.querySelector('[data-search-input]');
    var yearFilter = document.querySelector('[data-year-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));

    function filterCards() {
      var keyword = searchInput ? searchInput.value.trim().toLowerCase() : '';
      var year = yearFilter ? yearFilter.value : '';
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre')
        ].join(' ').toLowerCase();
        var cardYear = card.getAttribute('data-year') || '';
        var matchedKeyword = !keyword || text.indexOf(keyword) !== -1;
        var matchedYear = !year || cardYear === year;
        card.classList.toggle('is-hidden', !(matchedKeyword && matchedYear));
      });
    }

    if (searchInput) {
      searchInput.addEventListener('input', filterCards);
    }
    if (yearFilter) {
      yearFilter.addEventListener('change', filterCards);
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (box) {
      var video = box.querySelector('video');
      var button = box.querySelector('[data-play-button]');
      var src = box.getAttribute('data-src');
      var initialized = false;

      function initPlayer() {
        if (!video || !src || initialized) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(src);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        } else {
          video.src = src;
        }
      }

      function playVideo() {
        initPlayer();
        box.classList.add('is-playing');
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {
            box.classList.remove('is-playing');
          });
        }
      }

      if (button) {
        button.addEventListener('click', playVideo);
      }
      if (video) {
        video.addEventListener('click', initPlayer);
        video.addEventListener('play', function () {
          box.classList.add('is-playing');
        });
      }
    });
  });
})();
