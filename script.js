
/* KEIRROX — lightweight, multi-video player */
const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${secs}`;
};

document.querySelectorAll(".video-wrap, .showreel-video-wrap").forEach((wrap) => {
  const video = wrap.querySelector(".project-video");
  if (!video) return;

  const playButtons = wrap.querySelectorAll(".center-play, .control-play");
  const mute = wrap.querySelector(".mute-button");
  const fullscreen = wrap.querySelector(".fullscreen-button");
  const progress = wrap.querySelector(".progress");
  const current = wrap.querySelector(".time-current");
  const total = wrap.querySelector(".time-total");

  video.autoplay = false;
  video.muted = false;
  video.loop = false;
  video.playsInline = true;
  video.pause();

  const state = () => {
    const playing = !video.paused;
    wrap.classList.toggle("is-playing", playing);
    wrap.classList.toggle("is-paused", !playing);
    playButtons.forEach(btn => btn.textContent = playing ? "❚❚" : "▶");
  };

  const togglePlay = (event) => {
    event?.stopPropagation();
    if (video.paused) {
      video.play().catch(() => {
        // Some browsers require a user gesture; this click already is one.
      });
    } else {
      video.pause();
    }
  };

  playButtons.forEach(btn => btn.addEventListener("click", togglePlay));

  video.addEventListener("click", (event) => {
    if (event.target === video) togglePlay(event);
  });

  video.addEventListener("play", state);
  video.addEventListener("pause", state);
  video.addEventListener("ended", () => {
    video.currentTime = 0;
    video.pause();
    state();
  });

  video.addEventListener("loadedmetadata", () => {
    if (total) total.textContent = formatTime(video.duration);
  });

  video.addEventListener("timeupdate", () => {
    if (current) current.textContent = formatTime(video.currentTime);
    if (progress && video.duration) {
      progress.value = (video.currentTime / video.duration) * 100;
    }
  });

  progress?.addEventListener("input", (event) => {
    event.stopPropagation();
    if (video.duration) video.currentTime = (Number(event.target.value) / 100) * video.duration;
  });

  const updateMuteButton = () => {
    if (!mute) return;
    mute.classList.toggle("is-muted", video.muted);
    mute.setAttribute("aria-label", video.muted ? "Turn sound on" : "Mute video");
  };

  mute?.addEventListener("click", (event) => {
    event.stopPropagation();
    video.muted = !video.muted;
    updateMuteButton();
  });

  video.addEventListener("volumechange", updateMuteButton);

  fullscreen?.addEventListener("click", async (event) => {
    event.stopPropagation();
    try {
      if (!document.fullscreenElement) await wrap.requestFullscreen();
      else await document.exitFullscreen();
    } catch {}
  });

  updateMuteButton();
  state();
});

const preloader = document.getElementById("preloader");
const started = performance.now();

function finishLoading() {
  const wait = Math.max(0, 1100 - (performance.now() - started));
  setTimeout(() => {
    preloader?.classList.add("hide");
    document.body.classList.remove("is-loading");
    setTimeout(() => preloader?.remove(), 700);
  }, wait);
}
if (document.readyState === "complete") finishLoading();
else window.addEventListener("load", finishLoading, { once: true });

const revealItems = document.querySelectorAll(".reveal");
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealItems.forEach(item => observer.observe(item));

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", (event) => {
    const target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
/* ===== Spacebar Play/Pause ===== */

document.addEventListener("keydown", (e) => {
  // Ignore when typing in an input or textarea
  const tag = document.activeElement.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA") return;

  // Spacebar
  if (e.code === "Space") {
    e.preventDefault();

    // Find the first visible portfolio video
    const videos = document.querySelectorAll(".portfolio-video");

    for (const video of videos) {
      const rect = video.getBoundingClientRect();

      // Video currently on screen
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        if (video.paused) {
          video.play();
        } else {
          video.pause();
        }
        break;
      }
    }
  }
});
