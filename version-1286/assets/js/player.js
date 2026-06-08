import { H as Hls } from "./hls-dru42stk.js";

(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        document.querySelectorAll("[data-player]").forEach(function (player) {
            var video = player.querySelector("video");
            var button = player.querySelector("[data-player-start]");
            var status = player.querySelector("[data-player-status]");
            var source = player.getAttribute("data-m3u8");
            var title = player.getAttribute("data-title") || "影片";
            var hlsInstance = null;

            function setStatus(message) {
                if (status) {
                    status.textContent = message;
                }
            }

            function loadNative() {
                video.src = source;
                video.addEventListener("loadedmetadata", function () {
                    setStatus("播放源已加载：" + title);
                }, { once: true });
                return video.play();
            }

            function loadWithHls() {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: false,
                    backBufferLength: 90
                });

                hlsInstance.on(Hls.Events.ERROR, function (eventName, data) {
                    if (data && data.fatal) {
                        setStatus("播放源加载失败，请稍后重试");
                    }
                });

                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);

                return new Promise(function (resolve) {
                    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                        setStatus("播放源已加载：" + title);
                        resolve(video.play());
                    });
                });
            }

            if (!video || !button) {
                return;
            }

            button.addEventListener("click", function () {
                if (!source) {
                    setStatus("当前影片缺少播放源");
                    return;
                }

                button.classList.add("is-hidden");
                setStatus("正在加载播放源...");

                var playPromise;
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    playPromise = loadNative();
                } else if (Hls && Hls.isSupported()) {
                    playPromise = loadWithHls();
                } else {
                    video.src = source;
                    playPromise = video.play();
                    setStatus("浏览器不支持 HLS，已尝试直接打开播放源");
                }

                Promise.resolve(playPromise).catch(function () {
                    setStatus("浏览器阻止自动播放，请再次点击视频播放键");
                });
            });

            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    });
})();
