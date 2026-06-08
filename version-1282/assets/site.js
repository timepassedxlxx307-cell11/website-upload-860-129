(function () {
  function toArray(value) {
    return Array.prototype.slice.call(value || []);
  }

  function setupMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = toArray(hero.querySelectorAll('[data-hero-slide]'));
    var dots = toArray(hero.querySelectorAll('[data-hero-to]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5000);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-to') || 0));
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function setupFilters() {
    var scopes = toArray(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var query = scope.querySelector('[data-filter-query]');
      var region = scope.querySelector('[data-filter-region]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');
      var cards = toArray(scope.querySelectorAll('.movie-card'));
      var empty = scope.querySelector('[data-empty-state]');

      if (scope.hasAttribute('data-search-page') && query) {
        var params = new URLSearchParams(window.location.search);
        var value = params.get('q');
        if (value) {
          query.value = value;
        }
      }

      function matches(card, key, regionValue, typeValue, yearValue) {
        var text = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-year'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category'),
          card.textContent
        ].join(' ').toLowerCase();
        var cardRegion = card.getAttribute('data-region') || '';
        var cardType = card.getAttribute('data-type') || '';
        var cardYear = card.getAttribute('data-year') || '';
        return (!key || text.indexOf(key) !== -1) &&
          (!regionValue || cardRegion === regionValue) &&
          (!typeValue || cardType === typeValue) &&
          (!yearValue || cardYear === yearValue);
      }

      function apply() {
        var key = query ? query.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var typeValue = type ? type.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var ok = matches(card, key, regionValue, typeValue, yearValue);
          card.hidden = !ok;
          if (ok) {
            visible += 1;
          }
        });
        if (empty) {
          empty.hidden = visible !== 0;
        }
      }

      [query, region, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupPlayers() {
    var players = toArray(document.querySelectorAll('[data-player]'));
    players.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('[data-play]');
      var errorBox = shell.querySelector('[data-player-error]');
      var url = shell.getAttribute('data-video-url');
      var initialized = false;
      var waiting = false;
      var hlsInstance = null;

      function showError() {
        waiting = false;
        shell.classList.remove('is-loading');
        if (errorBox) {
          errorBox.hidden = false;
        }
      }

      function attachMedia() {
        return new Promise(function (resolve, reject) {
          if (!video || !url) {
            reject(new Error('empty'));
            return;
          }
          if (initialized) {
            resolve();
            return;
          }
          initialized = true;
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
            resolve();
            return;
          }
          if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
            hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                reject(new Error('fatal'));
              }
            });
            return;
          }
          video.src = url;
          resolve();
        });
      }

      function start() {
        if (waiting) {
          return;
        }
        waiting = true;
        shell.classList.add('is-loading');
        if (errorBox) {
          errorBox.hidden = true;
        }
        attachMedia().then(function () {
          waiting = false;
          shell.classList.remove('is-loading');
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
          var playResult = video.play();
          if (playResult && playResult.catch) {
            playResult.catch(function () {
              if (overlay) {
                overlay.classList.remove('is-hidden');
              }
            });
          }
        }).catch(showError);
      }

      if (overlay) {
        overlay.addEventListener('click', start);
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!initialized) {
            start();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) {
            overlay.classList.add('is-hidden');
          }
        });
        video.addEventListener('error', function () {
          if (initialized) {
            showError();
          }
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupFilters();
    setupPlayers();
  });
})();
