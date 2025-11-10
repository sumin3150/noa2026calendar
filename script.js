// スムーズスクロール（主要ナビ）
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const href = a.getAttribute('href');
    const target = href && document.querySelector(href);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// 購入リンク：準備中トースト
const showToast = (msg) => {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(showToast._t);
  showToast._t = setTimeout(() => toast.classList.remove('show'), 2600);
};

document.querySelectorAll('[data-action="coming-soon"]').forEach((el) => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('購入リンクは準備中です。公開までお待ちください。');
  });
});

