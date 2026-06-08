(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector("#mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!panel || !cards.length) {
      return;
    }
    var input = panel.querySelector("[data-filter-input]");
    var selects = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-select]"));
    var empty = document.querySelector("[data-empty-state]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function matches(card, key, value) {
      if (!value) {
        return true;
      }
      return normalize(card.getAttribute("data-" + key)).indexOf(normalize(value)) !== -1;
    }

    function apply() {
      var query = normalize(input ? input.value : "");
      var shown = 0;
      var selected = {};
      selects.forEach(function (select) {
        selected[select.getAttribute("data-filter-select")] = select.value;
      });
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        var visible = (!query || text.indexOf(query) !== -1) &&
          matches(card, "category", selected.category) &&
          matches(card, "year", selected.year) &&
          matches(card, "type", selected.type);
        card.style.display = visible ? "" : "none";
        if (visible) {
          shown += 1;
        }
      });
      if (empty) {
        empty.classList.toggle("is-visible", shown === 0);
      }
    }

    if (input) {
      input.addEventListener("input", apply);
    }
    selects.forEach(function (select) {
      select.addEventListener("change", apply);
    });
    apply();
  }

  function mountPlayer(videoId, layerId, buttonId, source) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var button = document.getElementById(buttonId);
    if (!video || !layer || !button || !source) {
      return;
    }
    var loaded = false;

    function attach() {
      if (loaded) {
        video.play().catch(function () {});
        return;
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        video._hls = hls;
      } else {
        video.src = source;
      }
      video.setAttribute("controls", "controls");
      layer.classList.add("is-hidden");
      video.play().catch(function () {});
    }

    layer.addEventListener("click", attach);
    button.addEventListener("click", function (event) {
      event.stopPropagation();
      attach();
    });
    video.addEventListener("click", function () {
      if (video.paused) {
        attach();
      }
    });
  }

  window.SitePlayer = {
    mount: mountPlayer
  };

  ready(function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
