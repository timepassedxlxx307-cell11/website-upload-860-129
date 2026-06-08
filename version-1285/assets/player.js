(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
            return;
        }
        document.addEventListener('DOMContentLoaded', fn);
    }

    ready(function () {
        var video = document.getElementById('movie-player');
        var overlay = document.getElementById('play-overlay');
        if (!video) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared || !stream) {
                return;
            }
            prepared = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }
            video.src = stream;
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener('click', play);
        }

        video.addEventListener('click', function () {
            if (!prepared || video.paused) {
                play();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    });
}());
