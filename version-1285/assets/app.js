(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var toggle = document.querySelector('[data-menu-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');
        if (toggle && panel) {
            toggle.addEventListener('click', function () {
                panel.classList.toggle('is-open');
            });
        }

        var hero = document.querySelector('[data-hero]');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
            var previous = hero.querySelector('[data-hero-prev]');
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
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot) {
                dot.addEventListener('click', function () {
                    show(Number(dot.getAttribute('data-hero-dot')) || 0);
                    start();
                });
            });

            if (previous) {
                previous.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }

            hero.addEventListener('mouseenter', stop);
            hero.addEventListener('mouseleave', start);
            show(0);
            start();
        }

        var queryInput = document.querySelector('[data-query-input]');
        if (queryInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q') || '';
            queryInput.value = q;
        }

        var filterInput = document.querySelector('[data-local-search]');
        var scope = document.querySelector('.filter-scope');
        var filterValue = 'all';

        function applyFilter() {
            if (!scope) {
                return;
            }
            var text = filterInput ? filterInput.value.trim().toLowerCase() : '';
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .ranking-card'));
            cards.forEach(function (card) {
                var searchable = (card.getAttribute('data-search') || '').toLowerCase();
                var matchesText = !text || searchable.indexOf(text) !== -1;
                var matchesFilter = filterValue === 'all' || searchable.indexOf(filterValue.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
            });
        }

        if (filterInput) {
            filterInput.addEventListener('input', applyFilter);
        }

        Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]')).forEach(function (button) {
            button.addEventListener('click', function () {
                Array.prototype.slice.call(button.parentNode.querySelectorAll('[data-filter-value]')).forEach(function (item) {
                    item.classList.remove('is-active');
                });
                button.classList.add('is-active');
                filterValue = button.getAttribute('data-filter-value') || 'all';
                applyFilter();
            });
        });

        applyFilter();
    });
}());
