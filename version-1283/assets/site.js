(function () {
  function ready(callback) {
    if (document.readyState !== "loading") {
      callback();
      return;
    }
    document.addEventListener("DOMContentLoaded", callback);
  }

  function setMobileMenu() {
    var button = document.querySelector(".mobile-menu-button");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      var expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setHeroSlider() {
    var slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dots button"));
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    show(0);
    start();
  }

  function setFilterLists() {
    var input = document.querySelector("[data-filter-input]");
    var list = document.querySelector("[data-filter-list]");
    if (!input || !list) {
      return;
    }
    var cards = Array.prototype.slice.call(list.querySelectorAll("[data-search]"));
    input.addEventListener("input", function () {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      cards.forEach(function (card) {
        var text = (card.getAttribute("data-search") || "").toLowerCase();
        var matched = !value || text.indexOf(value) !== -1;
        card.classList.toggle("is-filtered-out", !matched);
        if (matched) {
          visible += 1;
        }
      });
      var empty = list.querySelector(".empty-state");
      if (!visible) {
        if (!empty) {
          empty = document.createElement("div");
          empty.className = "empty-state";
          empty.textContent = "未找到相关影视";
          list.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    });
  }

  function createSearchCard(movie) {
    var link = document.createElement("a");
    link.className = "movie-card";
    link.href = movie.file;
    link.setAttribute("data-search", [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags].join(" "));
    var tags = movie.tags ? movie.tags.split(" ").slice(0, 2).join(" · ") : movie.genre;
    link.innerHTML = "" +
      "<span class=\"poster-frame\">" +
      "<img src=\"" + movie.cover + "\" alt=\"" + movie.title.replace(/\"/g, "&quot;") + "\" loading=\"lazy\">" +
      "<span class=\"poster-shade\"></span>" +
      "<span class=\"play-badge\">▶</span>" +
      "</span>" +
      "<span class=\"card-body\">" +
      "<span class=\"card-meta\">" + [movie.year, movie.region, movie.type, tags].filter(Boolean).join(" · ") + "</span>" +
      "<strong>" + movie.title + "</strong>" +
      "<span class=\"card-desc\">" + movie.oneLine + "</span>" +
      "</span>";
    return link;
  }

  function setSearchPage() {
    var input = document.getElementById("search-page-input");
    var form = document.getElementById("search-page-form");
    var results = document.getElementById("search-results");
    if (!input || !form || !results || !window.SiteMovies) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function render(value) {
      var words = value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      results.innerHTML = "";
      if (!words.length) {
        window.SiteMovies.slice(0, 24).forEach(function (movie) {
          results.appendChild(createSearchCard(movie));
        });
        return;
      }
      var matched = window.SiteMovies.filter(function (movie) {
        var text = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags, movie.oneLine].join(" ").toLowerCase();
        return words.every(function (word) {
          return text.indexOf(word) !== -1;
        });
      }).slice(0, 120);
      if (!matched.length) {
        var empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = "未找到相关影视";
        results.appendChild(empty);
        return;
      }
      matched.forEach(function (movie) {
        results.appendChild(createSearchCard(movie));
      });
    }
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var value = input.value.trim();
      var url = value ? "search.html?q=" + encodeURIComponent(value) : "search.html";
      window.history.replaceState({}, "", url);
      render(value);
    });
    input.addEventListener("input", function () {
      render(input.value);
    });
    render(initial);
  }

  window.startMoviePlayer = function (source) {
    ready(function () {
      var video = document.getElementById("movie-player");
      var button = document.getElementById("movie-start");
      if (!video || !button || !source) {
        return;
      }
      var hls = null;
      var attached = false;
      function playVideo() {
        button.classList.add("is-hidden");
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          if (!attached) {
            video.src = source;
            attached = true;
          }
          video.play().catch(function () {
            button.classList.remove("is-hidden");
          });
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          if (!attached) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              video.play().catch(function () {
                button.classList.remove("is-hidden");
              });
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                button.classList.remove("is-hidden");
              }
            });
            attached = true;
          } else {
            video.play().catch(function () {
              button.classList.remove("is-hidden");
            });
          }
          return;
        }
        video.src = source;
        video.play().catch(function () {
          button.classList.remove("is-hidden");
        });
      }
      button.addEventListener("click", playVideo);
      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });
      video.addEventListener("pause", function () {
        if (!video.ended) {
          button.classList.remove("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  };

  ready(function () {
    setMobileMenu();
    setHeroSlider();
    setFilterLists();
    setSearchPage();
  });
})();
