(function() {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function() {
      mobileNav.classList.toggle('open');
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
      current = (index + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  document.querySelectorAll('[data-filter-root]').forEach(function(root) {
    var container = root.parentElement || document;
    var cards = Array.prototype.slice.call(container.querySelectorAll('[data-card]'));
    var input = root.querySelector('[data-search-input]');
    var typeSelect = root.querySelector('[data-type-filter]');
    var yearSelect = root.querySelector('[data-year-filter]');
    var reset = root.querySelector('[data-reset-filter]');

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';

      cards.forEach(function(card) {
        var searchable = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-type') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
        var typeOk = !type || card.getAttribute('data-type') === type;
        var yearOk = !year || card.getAttribute('data-year') === year;
        var queryOk = !query || searchable.indexOf(query) !== -1;
        card.classList.toggle('is-filtered-out', !(typeOk && yearOk && queryOk));
      });
    }

    if (input) {
      input.addEventListener('input', apply);
    }
    if (typeSelect) {
      typeSelect.addEventListener('change', apply);
    }
    if (yearSelect) {
      yearSelect.addEventListener('change', apply);
    }
    if (reset) {
      reset.addEventListener('click', function() {
        if (input) {
          input.value = '';
        }
        if (typeSelect) {
          typeSelect.value = '';
        }
        if (yearSelect) {
          yearSelect.value = '';
        }
        apply();
      });
    }
  });
})();
