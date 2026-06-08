
(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var navButton = document.querySelector("[data-nav-toggle]");
        var navMenu = document.querySelector("[data-nav-menu]");
        if (navButton && navMenu) {
            navButton.addEventListener("click", function () {
                navMenu.classList.toggle("is-open");
            });
        }

        setupHero();
        setupFilters();
    });

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }

        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var images = Array.prototype.slice.call(root.querySelectorAll("[data-hero-image]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        if (!slides.length) {
            return;
        }

        var index = 0;
        var timer = null;

        function show(next) {
            index = (next + slides.length) % slides.length;
            slides.forEach(function (item, itemIndex) {
                item.classList.toggle("is-active", itemIndex === index);
            });
            images.forEach(function (item, itemIndex) {
                item.classList.toggle("is-active", itemIndex === index);
            });
            dots.forEach(function (item, itemIndex) {
                item.classList.toggle("is-active", itemIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener("click", function () {
                show(dotIndex);
                restart();
            });
        });

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        restart();
    }

    function setupFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var area = panel.parentElement;
            var input = panel.querySelector("[data-search-input]");
            var region = panel.querySelector("[data-region-filter]");
            var type = panel.querySelector("[data-type-filter]");
            var year = panel.querySelector("[data-year-filter]");
            var cards = Array.prototype.slice.call(area.querySelectorAll(".movie-card"));
            var empty = area.querySelector("[data-empty-state]");

            function apply() {
                var query = input ? input.value.trim().toLowerCase() : "";
                var regionValue = region ? region.value : "";
                var typeValue = type ? type.value : "";
                var yearValue = year ? year.value : "";
                var visible = 0;

                cards.forEach(function (card) {
                    var text = [
                        card.getAttribute("data-title"),
                        card.getAttribute("data-region"),
                        card.getAttribute("data-type"),
                        card.getAttribute("data-year"),
                        card.getAttribute("data-tags")
                    ].join(" ").toLowerCase();

                    var matched = true;
                    if (query && text.indexOf(query) === -1) {
                        matched = false;
                    }
                    if (regionValue && card.getAttribute("data-region") !== regionValue) {
                        matched = false;
                    }
                    if (typeValue && card.getAttribute("data-type") !== typeValue) {
                        matched = false;
                    }
                    if (yearValue && card.getAttribute("data-year") !== yearValue) {
                        matched = false;
                    }

                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });

                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            [input, region, type, year].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    window.initVideo = function (videoUrl) {
        var video = document.getElementById("main-video");
        var cover = document.getElementById("play-cover");
        if (!video || !videoUrl) {
            return;
        }

        var loaded = false;
        var hls = null;

        function attach() {
            if (loaded) {
                return;
            }
            loaded = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = videoUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(videoUrl);
                hls.attachMedia(video);
            } else {
                video.src = videoUrl;
            }
        }

        function start() {
            attach();
            if (cover) {
                cover.classList.add("is-hidden");
            }
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === "function") {
                playPromise.catch(function () {});
            }
        }

        if (cover) {
            cover.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (!loaded) {
                start();
                return;
            }
            if (video.paused) {
                video.play().catch(function () {});
            } else {
                video.pause();
            }
        });

        video.addEventListener("play", function () {
            if (cover) {
                cover.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hls && typeof hls.destroy === "function") {
                hls.destroy();
            }
        });
    };
})();
