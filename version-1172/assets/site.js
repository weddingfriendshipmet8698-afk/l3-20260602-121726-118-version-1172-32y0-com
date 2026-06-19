
(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        setupMobileMenu();
        setupHeroCarousel();
        setupCardSearch();
        setupPlayers();
    });

    function setupMobileMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-site-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHeroCarousel() {
        var carousel = document.querySelector('[data-hero-carousel]');
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var prev = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 6000);
        }

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
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                show(dotIndex);
                restart();
            });
        });
        show(0);
        restart();
    }

    function setupCardSearch() {
        var input = document.querySelector('[data-search-input]');
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll('[data-search]'));
        var count = document.querySelector('[data-search-count]');
        var categorySelect = document.querySelector('[data-category-filter]');
        var yearSelect = document.querySelector('[data-year-filter]');

        function normalize(value) {
            return String(value || '').toLowerCase().trim();
        }

        function applyFilter() {
            var keyword = normalize(input.value);
            var selectedCategory = categorySelect ? categorySelect.value : '';
            var selectedYear = yearSelect ? yearSelect.value : '';
            var visible = 0;
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                var category = card.getAttribute('data-category') || '';
                var year = card.getAttribute('data-year') || '';
                var keywordMatch = !keyword || text.indexOf(keyword) !== -1;
                var categoryMatch = !selectedCategory || category === selectedCategory;
                var yearMatch = !selectedYear || year === selectedYear;
                var shouldShow = keywordMatch && categoryMatch && yearMatch;
                card.classList.toggle('hidden-by-filter', !shouldShow);
                if (shouldShow) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = String(visible);
            }
        }

        input.addEventListener('input', applyFilter);
        if (categorySelect) {
            categorySelect.addEventListener('change', applyFilter);
        }
        if (yearSelect) {
            yearSelect.addEventListener('change', applyFilter);
        }
        applyFilter();
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
        players.forEach(function (player) {
            var button = player.querySelector('[data-play-button]');
            var video = player.querySelector('video');
            var poster = player.querySelector('.player-poster');
            var source = player.getAttribute('data-video-src');
            if (!button || !video || !source) {
                return;
            }
            button.addEventListener('click', function () {
                if (poster) {
                    poster.style.display = 'none';
                }
                startVideo(video, source);
            });
        });
    }

    function startVideo(video, source) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.play();
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            if (video._hlsInstance) {
                video._hlsInstance.destroy();
            }
            var hls = new window.Hls();
            video._hlsInstance = hls;
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.play();
            });
            return;
        }
        video.src = source;
        video.play();
    }
})();
