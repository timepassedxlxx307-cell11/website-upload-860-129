(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function bindNavigation() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var menu = document.querySelector("[data-nav-menu]");
    if (!toggle || !menu) {
      return;
    }
    toggle.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function bindHero() {
    var hero = document.querySelector("[data-hero-carousel]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    var prev = document.querySelector("[data-hero-prev]");
    var next = document.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function bindLocalFilter() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
    forms.forEach(function (form) {
      var input = form.querySelector("input[type='search']");
      var scopeId = form.getAttribute("data-local-filter");
      var scope = document.getElementById(scopeId);
      if (!input || !scope) {
        return;
      }
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
      input.addEventListener("input", function () {
        var query = input.value.trim().toLowerCase();
        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          card.style.display = !query || haystack.indexOf(query) !== -1 ? "" : "none";
        });
      });
    });
  }

  window.initMoviePlayer = function (videoId, url, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var started = false;

    if (!video) {
      return;
    }

    function load() {
      if (started) {
        return;
      }
      started = true;

      if (button) {
        button.classList.add("is-hidden");
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
      } else {
        video.src = url;
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {});
      }
    }

    if (button) {
      button.addEventListener("click", load);
    }

    video.addEventListener("click", load);
  };

  window.initSearchPage = function () {
    var form = document.querySelector("[data-search-page]");
    var results = document.querySelector("[data-search-results]");
    if (!form || !results || !window.PJ_MOVIES) {
      return;
    }
    var input = form.querySelector("input[name='q']");
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;

    function createCard(movie) {
      var tags = movie.tags.slice(0, 3).map(function (tag) {
        return "<span>" + tag + "</span>";
      }).join("");
      return "<article class=\"movie-card\" data-search=\"\">" +
        "<a class=\"poster-link\" href=\"" + movie.url + "\" aria-label=\"" + movie.title + "\">" +
        "<div class=\"poster-wrap\"><img src=\"" + movie.cover + "\" alt=\"" + movie.title + "\" loading=\"lazy\"><span class=\"poster-shade\"></span><span class=\"poster-play\">播放</span></div>" +
        "</a><div class=\"card-body\"><a class=\"card-title\" href=\"" + movie.url + "\">" + movie.title + "</a>" +
        "<p class=\"card-desc\">" + movie.desc + "</p>" +
        "<div class=\"card-meta\"><span>" + movie.year + "</span><span>" + movie.region + "</span><span>" + movie.type + "</span></div>" +
        "<div class=\"tag-row\">" + tags + "</div></div></article>";
    }

    function run() {
      var query = input.value.trim().toLowerCase();
      var list = window.PJ_MOVIES.filter(function (movie) {
        return !query || movie.search.indexOf(query) !== -1;
      }).slice(0, 96);

      if (!list.length) {
        results.innerHTML = "<div class=\"empty-state\">未找到相关影片，请尝试其他关键词。</div>";
        return;
      }

      results.innerHTML = "<div class=\"movie-grid\">" + list.map(createCard).join("") + "</div>";
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var target = query ? "./search.html?q=" + encodeURIComponent(query) : "./search.html";
      window.history.replaceState(null, "", target);
      run();
    });

    input.addEventListener("input", run);
    run();
  };

  ready(function () {
    bindNavigation();
    bindHero();
    bindLocalFilter();
  });
})();
