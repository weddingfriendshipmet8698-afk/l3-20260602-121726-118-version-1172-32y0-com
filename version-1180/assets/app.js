(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("open");
    });
  }

  function initHero() {
    var root = document.querySelector("[data-hero-carousel]");
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
    var prev = root.querySelector("[data-hero-prev]");
    var next = root.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === index);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === index);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, itemIndex) {
      dot.addEventListener("click", function () {
        show(itemIndex);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function initFilters() {
    var root = document.querySelector("[data-filter-root]");
    if (!root) {
      return;
    }
    var list = document.querySelector("[data-filter-list]");
    var items = Array.prototype.slice.call(list ? list.querySelectorAll(".movie-card") : []);
    var search = root.querySelector("[data-filter-search]");
    var year = root.querySelector("[data-filter-year]");
    var sort = root.querySelector("[data-filter-sort]");
    var regionButtons = Array.prototype.slice.call(root.querySelectorAll("[data-region-value]"));
    var region = "";

    function apply() {
      var keyword = normalize(search && search.value);
      var selectedYear = year ? year.value : "";
      items.forEach(function (item) {
        var haystack = normalize([
          item.dataset.title,
          item.dataset.region,
          item.dataset.year,
          item.dataset.type,
          item.dataset.category
        ].join(" "));
        var matchKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchYear = !selectedYear || item.dataset.year === selectedYear;
        var matchRegion = !region || item.dataset.region === region;
        item.style.display = matchKeyword && matchYear && matchRegion ? "" : "none";
      });

      if (sort && sort.value !== "default") {
        var visible = items.slice().sort(function (a, b) {
          if (sort.value === "new") {
            return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
          }
          return normalize(a.dataset.title).localeCompare(normalize(b.dataset.title), "zh-Hans-CN");
        });
        visible.forEach(function (item) {
          list.appendChild(item);
        });
      }
    }

    if (search) {
      search.addEventListener("input", apply);
    }
    if (year) {
      year.addEventListener("change", apply);
    }
    if (sort) {
      sort.addEventListener("change", apply);
    }
    regionButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        region = button.dataset.regionValue || "";
        regionButtons.forEach(function (other) {
          other.classList.toggle("active", other === button);
        });
        apply();
      });
    });
  }

  function movieCard(movie) {
    var tags = (movie.tags || []).slice(0, 3).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");
    return "<article class=\"movie-card\">" +
      "<a class=\"poster-link\" href=\"" + escapeHtml(movie.file) + "\">" +
      "<img src=\"" + escapeHtml(movie.image) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span><span class=\"poster-play\">▶</span>" +
      "<span class=\"poster-meta\">" + escapeHtml(movie.year) + "</span></a>" +
      "<div class=\"movie-card-body\"><a class=\"movie-title\" href=\"" + escapeHtml(movie.file) + "\">" +
      escapeHtml(movie.title) + "</a><p>" + escapeHtml(movie.desc) + "</p>" +
      "<div class=\"tag-line\">" + tags + "</div>" +
      "<div class=\"movie-meta\"><span>" + escapeHtml(movie.region) + "</span><span>" + escapeHtml(movie.category) + "</span></div></div></article>";
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initSearchPage() {
    var root = document.querySelector("[data-search-page]");
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var input = root.querySelector("[data-search-input]");
    var results = root.querySelector("[data-search-results]");
    var title = root.querySelector("[data-search-title]");
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    if (input) {
      input.value = query;
    }

    function render(value) {
      var keyword = normalize(value);
      var data = window.SEARCH_MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.desc,
          movie.region,
          movie.year,
          movie.category,
          (movie.tags || []).join(" ")
        ].join(" "));
        return !keyword || haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);
      if (title) {
        title.textContent = keyword ? "搜索结果" : "热门影片推荐";
      }
      if (results) {
        results.innerHTML = data.map(movieCard).join("");
      }
    }

    if (input) {
      input.addEventListener("input", function () {
        render(input.value);
      });
    }
    render(query);
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll(".player-card"));
    players.forEach(function (player) {
      var video = player.querySelector("video");
      var overlay = player.querySelector(".player-overlay");
      var streamUrl = player.dataset.streamUrl;
      var hlsInstance = null;
      var initialized = false;

      function bindStream() {
        if (initialized || !video || !streamUrl) {
          return;
        }
        initialized = true;
        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(streamUrl);
          hlsInstance.attachMedia(video);
        } else {
          video.src = streamUrl;
        }
      }

      function play() {
        bindStream();
        player.classList.add("is-playing");
        if (video) {
          var promise = video.play();
          if (promise && typeof promise.catch === "function") {
            promise.catch(function () {
              player.classList.remove("is-playing");
            });
          }
        }
      }

      if (overlay) {
        overlay.addEventListener("click", play);
      }
      if (video) {
        video.addEventListener("click", function () {
          if (!initialized || video.paused) {
            play();
          }
        });
        video.addEventListener("play", function () {
          player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
          if (video.currentTime === 0) {
            player.classList.remove("is-playing");
          }
        });
        window.addEventListener("pagehide", function () {
          if (hlsInstance) {
            hlsInstance.destroy();
          }
        });
      }
    });
  }

  ready(function () {
    initMenu();
    initHero();
    initFilters();
    initSearchPage();
    initPlayers();
  });
})();
