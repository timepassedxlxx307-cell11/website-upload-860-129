(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var header = document.querySelector("[data-site-header]");
        var menuButton = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");

        if (header) {
            var updateHeader = function () {
                header.classList.toggle("is-scrolled", window.scrollY > 20);
            };
            updateHeader();
            window.addEventListener("scroll", updateHeader, { passive: true });
        }

        if (menuButton && mobileNav) {
            menuButton.addEventListener("click", function () {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("img").forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("image-missing");
            });
        });

        initialiseHero();
        initialiseFilters();
    });

    function initialiseHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }

        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var previous = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }

            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle("is-active", position === activeIndex);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle("is-active", position === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5000);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        if (previous) {
            previous.addEventListener("click", function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        showSlide(0);
        startTimer();
    }

    function initialiseFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-filter-list]");
        if (!panel || !list) {
            return;
        }

        var keywordInput = panel.querySelector("[data-filter-keyword]");
        var regionSelect = panel.querySelector("[data-filter-region]");
        var typeSelect = panel.querySelector("[data-filter-type]");
        var yearSelect = panel.querySelector("[data-filter-year]");
        var resetButton = panel.querySelector("[data-filter-reset]");
        var count = document.querySelector("[data-filter-count]");
        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        var query = new URLSearchParams(window.location.search).get("q");
        if (query && keywordInput) {
            keywordInput.value = query;
        }

        function normalise(value) {
            return String(value || "").trim().toLowerCase();
        }

        function cardText(card) {
            return [
                card.getAttribute("data-title"),
                card.getAttribute("data-region"),
                card.getAttribute("data-type"),
                card.getAttribute("data-year"),
                card.getAttribute("data-tags"),
                card.getAttribute("data-category")
            ].join(" ").toLowerCase();
        }

        function applyFilters() {
            var keyword = normalise(keywordInput && keywordInput.value);
            var region = normalise(regionSelect && regionSelect.value);
            var type = normalise(typeSelect && typeSelect.value);
            var year = normalise(yearSelect && yearSelect.value);
            var visible = 0;

            cards.forEach(function (card) {
                var matches = true;
                var haystack = cardText(card);

                if (keyword && haystack.indexOf(keyword) === -1) {
                    matches = false;
                }
                if (region && normalise(card.getAttribute("data-region")) !== region) {
                    matches = false;
                }
                if (type && normalise(card.getAttribute("data-type")) !== type) {
                    matches = false;
                }
                if (year && normalise(card.getAttribute("data-year")) !== year) {
                    matches = false;
                }

                card.classList.toggle("is-hidden", !matches);
                if (matches) {
                    visible += 1;
                }
            });

            if (count) {
                count.textContent = "共 " + visible + " 部影片";
            }
        }

        [keywordInput, regionSelect, typeSelect, yearSelect].forEach(function (control) {
            if (control) {
                control.addEventListener("input", applyFilters);
                control.addEventListener("change", applyFilters);
            }
        });

        if (resetButton) {
            resetButton.addEventListener("click", function () {
                if (keywordInput) {
                    keywordInput.value = "";
                }
                if (regionSelect) {
                    regionSelect.value = "";
                }
                if (typeSelect) {
                    typeSelect.value = "";
                }
                if (yearSelect) {
                    yearSelect.value = "";
                }
                applyFilters();
            });
        }

        applyFilters();
    }
})();
