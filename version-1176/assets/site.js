(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  ready(function () {
    var menuButton = document.querySelector("[data-mobile-menu]");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
    var prev = document.querySelector(".hero-prev");
    var next = document.querySelector(".hero-next");
    var active = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      active = (index + slides.length) % slides.length;

      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });

      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    }

    function startSlider() {
      if (slides.length < 2) {
        return;
      }

      timer = window.setInterval(function () {
        showSlide(active + 1);
      }, 5200);
    }

    function resetSlider() {
      if (timer) {
        window.clearInterval(timer);
      }

      startSlider();
    }

    if (prev) {
      prev.addEventListener("click", function () {
        showSlide(active - 1);
        resetSlider();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        showSlide(active + 1);
        resetSlider();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        showSlide(i);
        resetSlider();
      });
    });

    showSlide(0);
    startSlider();

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-input]")).forEach(function (input) {
      var scope = input.closest("[data-filter-scope]") || document;
      var empty = scope.querySelector(".empty-state");

      input.addEventListener("input", function () {
        var keyword = input.value.trim().toLowerCase();
        var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-filter-text]"));
        var visible = 0;

        cards.forEach(function (card) {
          var text = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
          var matched = keyword === "" || text.indexOf(keyword) !== -1;

          card.classList.toggle("hidden-by-filter", !matched);

          if (matched) {
            visible += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visible === 0);
        }
      });
    });

    Array.prototype.slice.call(document.querySelectorAll(".player-frame")).forEach(function (frame) {
      var video = frame.querySelector("video");
      var button = frame.querySelector(".play-button");

      if (!video || !button) {
        return;
      }

      function loadVideo() {
        var stream = video.getAttribute("data-stream");

        if (!stream) {
          return;
        }

        if (!video.getAttribute("data-ready")) {
          if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(stream);
            hls.attachMedia(video);
          } else {
            video.src = stream;
          }

          video.setAttribute("data-ready", "1");
        }

        frame.classList.add("is-playing");
        var promise = video.play();

        if (promise && promise.catch) {
          promise.catch(function () {});
        }
      }

      button.addEventListener("click", loadVideo);
    });
  });
})();
