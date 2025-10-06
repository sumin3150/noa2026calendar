// 画像拡大（ライトボックス）
(function(){
  const backdrop = document.querySelector('.lightbox-backdrop');
  const img = backdrop ? backdrop.querySelector('.lightbox-img') : null;
  if (!backdrop || !img) return;

  // Ensure sample images are zoomable on click
  try {
    document.querySelectorAll('img.sample-img').forEach((el) => {
      if (!el.classList.contains('zoomable')) el.classList.add('zoomable');
    });
  } catch (_) {}

  const open = (src, alt) => {
    img.src = src; img.alt = alt || '拡大画像';
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    backdrop.hidden = true;
    img.removeAttribute('src');
    document.body.style.overflow = '';
  };

  // 画像クリックで開く
  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target && target.matches('img.zoomable')) {
      e.preventDefault();
      open(target.currentSrc || target.src, target.alt);
    }
  });

  // 背景クリックで閉じる
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });

  // Escで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop.hidden) close();
  });
})();
