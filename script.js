// Año en footer
document.getElementById('year').textContent = new Date().getFullYear();

// Avance de obra (círculos de progreso, datos en avance-obra.js)
if (typeof avanceObra !== 'undefined') {
  const RADIUS = 60;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const DURATION = 1800; // ms

  const items = Array.from(document.querySelectorAll('.avance-item')).map(item => {
    const key = item.getAttribute('data-key');
    const percent = Math.max(0, Math.min(100, Number(avanceObra[key]) || 0));
    const progressCircle = item.querySelector('.avance-progress');
    const percentLabel = item.querySelector('.avance-percent');

    progressCircle.style.strokeDasharray = `${CIRCUMFERENCE}`;
    progressCircle.style.strokeDashoffset = `${CIRCUMFERENCE}`;
    percentLabel.textContent = '0%';

    return { percent, progressCircle, percentLabel, animated: false };
  });

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function animateItem(it) {
    if (it.animated) return;
    it.animated = true;
    const start = performance.now();

    function tick(now) {
      const t = Math.min(1, (now - start) / DURATION);
      const eased = easeOutCubic(t);
      const current = Math.round(it.percent * eased);
      const offset = CIRCUMFERENCE * (1 - (it.percent * eased) / 100);
      it.progressCircle.style.strokeDashoffset = `${offset}`;
      it.percentLabel.textContent = `${current}%`;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const avanceSection = document.getElementById('avance');
  if ('IntersectionObserver' in window && avanceSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          items.forEach(animateItem);
          observer.disconnect();
        }
      });
    }, { threshold: 0.35 });
    observer.observe(avanceSection);
  } else {
    items.forEach(animateItem);
  }
}

// Menú mobile
const navToggle = document.getElementById('navToggle');
const nav = document.getElementById('nav');
navToggle.addEventListener('click', () => nav.classList.toggle('open'));
nav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => nav.classList.remove('open'));
});

// Carrusel de renders
(function () {
  const carousel = document.getElementById('rendersCarousel');
  if (!carousel) return;
  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const thumbs = Array.from(carousel.querySelectorAll('.carousel-thumb'));
  const prevBtn = carousel.querySelector('.carousel-prev');
  const nextBtn = carousel.querySelector('.carousel-next');
  let index = 0;

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    thumbs.forEach((t, ti) => t.classList.toggle('is-active', ti === index));
  }

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  thumbs.forEach((t, ti) => t.addEventListener('click', () => goTo(ti)));

  let startX = null;
  track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const diff = e.changedTouches[0].clientX - startX;
    if (Math.abs(diff) > 40) goTo(index + (diff < 0 ? 1 : -1));
    startX = null;
  });

  goTo(0);
})();

// Lightbox para renders y plano
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');

document.querySelectorAll('[data-full]').forEach(el => {
  el.addEventListener('click', () => {
    lightboxImg.src = el.getAttribute('data-full');
    lightboxImg.alt = el.querySelector('img') ? el.querySelector('img').alt : '';
    lightbox.classList.add('open');
  });
});

function closeLightbox() {
  lightbox.classList.remove('open');
  lightboxImg.src = '';
}
lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeLightbox();
});
