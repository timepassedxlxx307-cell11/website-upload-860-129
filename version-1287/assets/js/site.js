(function () {
  var Site = {};

  Site.ready = function (callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  };

  Site.initHeader = function () {
    var header = document.querySelector(".site-header");
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    function syncHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 16) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    syncHeader();
    window.addEventListener("scroll", syncHeader, { passive: true });

    if (toggle && panel) {
      toggle.addEventListener("click", function () {
        panel.classList.toggle("is-open");
      });
    }
  };

  Site.initImages = function () {
    var images = document.querySelectorAll("img");
    images.forEach(function (image) {
      image.addEventListener("error", function () {
        image.classList.add("is-empty-image");
      });
    });
  };

  Site.initHero = function () {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var active = 0;
    var timer = null;

    function setActive(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        setActive(active + 1);
      }, 5000);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        setActive(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        setActive(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        setActive(index);
        restart();
      });
    });

    setActive(0);
    restart();
  };

  Site.initFilters = function () {
    var forms = document.querySelectorAll("[data-filter-form]");

    forms.forEach(function (form) {
      var scope = form.closest("[data-search-scope]") || document;
      var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
      var empty = scope.querySelector("[data-empty-state]");
      var textInput = form.querySelector("[data-filter-text]");
      var selects = Array.prototype.slice.call(form.querySelectorAll("[data-filter-select]"));

      function normalize(value) {
        return String(value || "").toLowerCase().trim();
      }

      function applyFilters() {
        var keyword = normalize(textInput ? textInput.value : "");
        var visibleCount = 0;

        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          var pass = !keyword || text.indexOf(keyword) !== -1;

          selects.forEach(function (select) {
            var key = select.getAttribute("data-filter-select");
            var value = normalize(select.value);
            var cardValue = normalize(card.getAttribute("data-" + key));
            if (value && cardValue !== value) {
              pass = false;
            }
          });

          card.style.display = pass ? "" : "none";
          if (pass) {
            visibleCount += 1;
          }
        });

        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        applyFilters();
      });

      if (textInput) {
        textInput.addEventListener("input", applyFilters);
      }

      selects.forEach(function (select) {
        select.addEventListener("change", applyFilters);
      });

      var params = new URLSearchParams(window.location.search);
      var query = params.get("q");
      if (query && textInput) {
        textInput.value = query;
      }
      applyFilters();
    });

    var globalForms = document.querySelectorAll("[data-global-search]");
    globalForms.forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector("input");
        var query = input ? input.value.trim() : "";
        if (query) {
          window.location.href = "index.html?q=" + encodeURIComponent(query) + "#library";
        }
      });
    });
  };

  Site.initMoviePlayer = function (sourceUrl) {
    var video = document.querySelector("[data-player-video]");
    var overlay = document.querySelector("[data-player-overlay]");
    var starts = document.querySelectorAll("[data-player-start]");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !sourceUrl) {
      return;
    }

    function loadVideo() {
      if (loaded) {
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = sourceUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls();
        hlsInstance.loadSource(sourceUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = sourceUrl;
      }

      loaded = true;
    }

    function startPlayback() {
      loadVideo();
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {});
      }
    }

    starts.forEach(function (button) {
      button.addEventListener("click", startPlayback);
    });

    if (overlay) {
      overlay.addEventListener("click", startPlayback);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        startPlayback();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };

  Site.init = function () {
    Site.initHeader();
    Site.initImages();
    Site.initHero();
    Site.initFilters();
  };

  window.Site = Site;
  Site.ready(Site.init);
})();
