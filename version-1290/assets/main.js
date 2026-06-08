(function() {
    const mobileToggle = document.querySelector('.mobile-toggle');
    const mobilePanel = document.querySelector('.mobile-panel');

    if (mobileToggle && mobilePanel) {
        mobileToggle.addEventListener('click', function() {
            const opened = mobilePanel.classList.toggle('is-open');
            mobileToggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
            mobileToggle.textContent = opened ? '×' : '☰';
        });
    }

    const hero = document.querySelector('.hero-carousel');
    if (hero) {
        const slides = Array.from(hero.querySelectorAll('.hero-slide'));
        const dots = Array.from(hero.querySelectorAll('.hero-dot'));
        const prev = hero.querySelector('.hero-prev');
        const next = hero.querySelector('.hero-next');
        let index = Math.max(0, slides.findIndex(function(slide) {
            return slide.classList.contains('is-active');
        }));

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function(slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function(dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        if (prev) {
            prev.addEventListener('click', function() {
                show(index - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function() {
                show(index + 1);
            });
        }
        dots.forEach(function(dot, dotIndex) {
            dot.addEventListener('click', function() {
                show(dotIndex);
            });
        });
        if (slides.length > 1) {
            setInterval(function() {
                show(index + 1);
            }, 5000);
        }
    }

    const params = new URLSearchParams(window.location.search);
    const queryFromUrl = params.get('q') || '';
    const pageSearch = document.querySelector('.page-search');
    const genreFilter = document.querySelector('.genre-filter');
    const cards = Array.from(document.querySelectorAll('.filter-results .movie-card'));
    const emptyState = document.querySelector('.empty-state');

    if (pageSearch && queryFromUrl) {
        pageSearch.value = queryFromUrl;
    }

    function normalize(value) {
        return (value || '').toString().trim().toLowerCase();
    }

    function filterCards() {
        if (!cards.length) {
            return;
        }
        const keyword = normalize(pageSearch ? pageSearch.value : '');
        const genre = normalize(genreFilter ? genreFilter.value : '');
        let visible = 0;

        cards.forEach(function(card) {
            const haystack = normalize([
                card.dataset.title,
                card.dataset.tags,
                card.dataset.genre,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.textContent
            ].join(' '));
            const matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            const matchedGenre = !genre || haystack.indexOf(genre) !== -1;
            const matched = matchedKeyword && matchedGenre;
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.hidden = visible !== 0;
        }
    }

    if (pageSearch) {
        pageSearch.addEventListener('input', filterCards);
    }
    if (genreFilter) {
        genreFilter.addEventListener('change', filterCards);
    }
    filterCards();
})();
