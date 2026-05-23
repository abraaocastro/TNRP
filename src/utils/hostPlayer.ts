/**
 * T7.1 — Pause/Play da transmissão original.
 *
 * Encontra o maior elemento <video> visível na página host
 * (geralmente o player principal) e faz toggle de play/pause.
 */
export function toggleHostPlayback(): void {
  const videos = Array.from(document.querySelectorAll("video"));

  if (videos.length === 0) return;

  // Prioriza o maior vídeo visível (mais provável de ser o principal)
  const mainVideo = videos
    .filter((v) => {
      const rect = v.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    })
    .sort((a, b) => {
      const areaA = a.getBoundingClientRect().width * a.getBoundingClientRect().height;
      const areaB = b.getBoundingClientRect().width * b.getBoundingClientRect().height;
      return areaB - areaA;
    })[0];

  if (!mainVideo) return;

  if (mainVideo.paused) {
    mainVideo.play();
  } else {
    mainVideo.pause();
  }
}
