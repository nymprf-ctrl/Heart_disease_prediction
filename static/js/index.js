(function () {
  const p = document.getElementById('ecgPath');
  if (!p) return;

  let len = 2500;
  try {
    const l = p.getTotalLength();
    if (l > 100) len = l;
  } catch (_) {}

  p.style.strokeDasharray  = len;
  p.style.strokeDashoffset = len;

  const draw = p.animate(
    [{ strokeDashoffset: len }, { strokeDashoffset: 0 }],
    { duration: 2200, delay: 450, easing: 'cubic-bezier(0.4,0,0.2,1)', fill: 'forwards' }
  );

  draw.onfinish = () => {
    p.style.strokeDashoffset = 0;
    p.animate(
      [{ opacity: 1 }, { opacity: .48 }, { opacity: 1 }],
      { duration: 3500, iterations: Infinity, easing: 'ease-in-out' }
    );
  };
})();

function runCounters() {
  document.querySelectorAll('.sn[data-to]').forEach(el => {
    const target  = +el.dataset.to;
    const sfx     = el.dataset.sfx || '';
    const sfxHtml = sfx ? `<span class="a">${sfx}</span>` : '';
    const dur     = 1300;
    const t0      = performance.now();

    (function tick(now) {
      const prog = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - prog, 3);
      el.innerHTML = Math.round(target * ease) + sfxHtml;
      if (prog < 1) requestAnimationFrame(tick);
    })(t0);
  });
}

const statsEl = document.querySelector('.stats');
if (statsEl && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { runCounters(); io.disconnect(); }
  }, { threshold: 0.3 });
  io.observe(statsEl);
} else {
  runCounters();
}
