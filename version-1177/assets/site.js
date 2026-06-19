(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector('.mobile-menu-button');
    var menu = document.querySelector('.mobile-nav');
    if (!button || !menu) {
      return;
    }
    button.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      menu.hidden = !open;
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function setupHero() {
    var root = document.querySelector('.hero-slider');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('.hero-dot'));
    var prev = root.querySelector('.hero-prev');
    var next = root.querySelector('.hero-next');
    var index = 0;
    var timer;

    function show(target) {
      if (!slides.length) {
        return;
      }
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-slide')) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        restart();
      });
    }

    restart();
  }

  function setupSearch() {
    var data = window.SITE_MOVIES || [];
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.site-search-input'));
    inputs.forEach(function (input) {
      var panel = input.parentElement.querySelector('.search-panel');
      if (!panel) {
        return;
      }
      input.addEventListener('input', function () {
        var keyword = input.value.trim().toLowerCase();
        if (!keyword) {
          panel.hidden = true;
          panel.innerHTML = '';
          return;
        }
        var results = data.filter(function (item) {
          return item.title.toLowerCase().indexOf(keyword) !== -1 ||
            item.region.toLowerCase().indexOf(keyword) !== -1 ||
            item.year.toLowerCase().indexOf(keyword) !== -1 ||
            item.genre.toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 12);
        panel.innerHTML = results.map(function (item) {
          return '<a class="search-result" href="./' + item.url + '"><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region + ' · ' + item.year + ' · ' + item.genre) + '</span></a>';
        }).join('') || '<div class="search-result"><strong>暂无匹配影片</strong><span>请尝试其他关键词</span></div>';
        panel.hidden = false;
      });
    });
    document.addEventListener('click', function (event) {
      inputs.forEach(function (input) {
        var wrap = input.parentElement;
        var panel = wrap.querySelector('.search-panel');
        if (panel && !wrap.contains(event.target)) {
          panel.hidden = true;
        }
      });
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function setupFilters() {
    var panel = document.querySelector('.filter-panel');
    if (!panel) {
      return;
    }
    var keyword = panel.querySelector('.filter-keyword');
    var region = panel.querySelector('.filter-region');
    var year = panel.querySelector('.filter-year');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.catalog-card'));
    var regions = [];
    var years = [];

    cards.forEach(function (card) {
      var r = card.getAttribute('data-region') || '';
      var y = card.getAttribute('data-year') || '';
      if (r && regions.indexOf(r) === -1) {
        regions.push(r);
      }
      if (y && years.indexOf(y) === -1) {
        years.push(y);
      }
    });

    regions.sort().forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      region.appendChild(option);
    });

    years.sort().reverse().forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      year.appendChild(option);
    });

    function update() {
      var key = keyword.value.trim().toLowerCase();
      var r = region.value;
      var y = year.value;
      cards.forEach(function (card) {
        var text = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
        var ok = (!key || text.indexOf(key) !== -1) &&
          (!r || card.getAttribute('data-region') === r) &&
          (!y || card.getAttribute('data-year') === y);
        card.classList.toggle('is-hidden', !ok);
      });
    }

    [keyword, region, year].forEach(function (element) {
      element.addEventListener('input', update);
      element.addEventListener('change', update);
    });
  }

  window.initMoviePlayer = function (videoId, sourceUrl, overlayId, buttonId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var button = document.getElementById(buttonId);
    var hls;
    var loaded = false;
    var loading = false;

    if (!video) {
      return;
    }

    function hideLayer() {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function attachSource(callback) {
      if (loaded) {
        callback();
        return;
      }
      if (loading) {
        video.addEventListener('loadedmetadata', callback, { once: true });
        return;
      }
      loading = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        video.addEventListener('loadedmetadata', function () {
          loaded = true;
          loading = false;
          callback();
        }, { once: true });
        video.load();
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(sourceUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          loaded = true;
          loading = false;
          callback();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            hls = null;
            loading = false;
          }
        });
      } else {
        video.src = sourceUrl;
        loaded = true;
        loading = false;
        callback();
      }
    }

    function playVideo(event) {
      if (event) {
        event.preventDefault();
      }
      hideLayer();
      attachSource(function () {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function (event) {
      if (!loaded) {
        playVideo(event);
        return;
      }
      if (video.paused) {
        var promise = video.play();
        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', hideLayer);
  };

  ready(function () {
    setupMobileMenu();
    setupHero();
    setupSearch();
    setupFilters();
  });
}());
