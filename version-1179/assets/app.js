(function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;
        var timer = null;

        function setSlide(next) {
            index = next;
            slides.forEach(function (slide, i) {
                slide.classList.toggle('active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('active', i === index);
            });
        }

        function startTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                setSlide((index + 1) % slides.length);
            }, 5200);
        }

        dots.forEach(function (dot, i) {
            dot.addEventListener('click', function () {
                setSlide(i);
                startTimer();
            });
        });

        if (slides.length > 1) {
            startTimer();
        }
    }

    function bindPlayer(shell) {
        var video = shell.querySelector('video[data-stream]');
        var button = shell.querySelector('[data-play-button]');

        if (!video) {
            return;
        }

        var source = video.getAttribute('data-stream');
        var ready = false;

        function loadSource() {
            if (ready || !source) {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            ready = true;
        }

        function playVideo() {
            loadSource();
            var promise = video.play();
            shell.classList.add('is-playing');
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    shell.classList.remove('is-playing');
                });
            }
        }

        if (button) {
            button.addEventListener('click', playVideo);
        }

        video.addEventListener('play', function () {
            shell.classList.add('is-playing');
        });

        video.addEventListener('pause', function () {
            if (video.currentTime === 0 || video.ended) {
                shell.classList.remove('is-playing');
            }
        });

        video.addEventListener('click', function () {
            if (!ready) {
                playVideo();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(bindPlayer);

    var searchData = window.siteSearchData || [];
    var resultBox = document.querySelector('[data-search-results]');
    var titleBox = document.querySelector('[data-search-title]');
    var input = document.querySelector('[data-search-input]');

    if (resultBox && searchData.length) {
        var params = new URLSearchParams(window.location.search);
        var query = (params.get('q') || '').trim();

        if (input) {
            input.value = query;
        }

        function render(items, q) {
            if (titleBox) {
                titleBox.textContent = q ? '搜索结果' : '精选推荐';
            }

            if (!items.length) {
                resultBox.innerHTML = '<div class="story-block"><h2>暂无匹配影片</h2><p>可以尝试更换片名、地区、年份或类型关键词。</p></div>';
                return;
            }

            resultBox.innerHTML = items.slice(0, 80).map(function (item) {
                var tags = item.tags.slice(0, 3).map(function (tag) {
                    return '<span>' + escapeHtml(tag) + '</span>';
                }).join('');

                return '' +
                    '<article class="movie-card">' +
                        '<a class="card-media" href="' + item.file + '" aria-label="' + escapeHtml(item.title) + '">' +
                            '<span class="poster-frame">' +
                                '<img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '" loading="lazy" onerror="this.classList.add(\'is-hidden\')">' +
                            '</span>' +
                            '<span class="card-badge">' + item.year + '</span>' +
                        '</a>' +
                        '<div class="card-body">' +
                            '<a class="card-title" href="' + item.file + '">' + escapeHtml(item.title) + '</a>' +
                            '<p>' + escapeHtml(item.oneLine) + '</p>' +
                            '<div class="tag-row">' + tags + '</div>' +
                            '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.type) + '</span></div>' +
                        '</div>' +
                    '</article>';
            }).join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        if (query) {
            var low = query.toLowerCase();
            var matched = searchData.filter(function (item) {
                return item.searchText.indexOf(low) !== -1;
            });
            render(matched, query);
        }
    }
})();
