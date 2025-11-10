// 注文モーダルの挙動
(function(){
  const init = () => {
    const backdrop = document.querySelector('.order-backdrop');
    if (!backdrop) return;
  const modal = backdrop.querySelector('.order-modal');
  const closeBtn = backdrop.querySelector('.order-close');
  const form = backdrop.querySelector('.order-form');
  const previewImg = backdrop.querySelector('#order-preview-img');
  const previewCap = backdrop.querySelector('#order-preview-caption');
  const previewPrice = backdrop.querySelector('#order-preview-price');
  const postalInput = () => form.querySelector('input[name="postal"]');

  const samples = {
    desk: {
      src: 'image2/卓上カレンダー見本.jpg',
      caption: '卓上カレンダー 見本'
    },
    wall: {
      src: 'image2/壁掛けカレンダー見本.jpg',
      caption: '壁掛けカレンダー 見本'
    }
  };
  const prices = {
    desk: { eth: '0.005ETH', jpyc: '3000円' },
    wall: { eth: '0.009ETH', jpyc: '5500円' }
  };

  const open = () => {
    backdrop.hidden = false;
    document.body.style.overflow = 'hidden';
    // 初期プレビュー（卓上）
    setPreview('desk');
    // フォーカス移動
    try { modal.querySelector('input[name="x_handle"]').focus(); } catch(_){}
  };
  const close = () => {
    backdrop.hidden = true;
    document.body.style.overflow = '';
  };

  // 背景クリックやEscキーでは閉じないように捕捉（右上ボタンのみで閉じる）
  // 背景クリックの捕捉（キャプチャ段階で停止）
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop && !backdrop.hidden) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, true);
  // Escキーの捕捉（キャプチャ段階で停止）
  document.addEventListener('keydown', (e) => {
    if (e && e.key === 'Escape' && !backdrop.hidden) {
      e.preventDefault();
      e.stopPropagation();
      if (e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
  }, true);

  function setPreview(kind){
    const s = samples[kind] || samples.desk;
    if (previewImg) previewImg.src = s.src;
    if (previewCap) previewCap.textContent = s.caption;
  }
  function updatePrice(){
    const prodEl = form.querySelector('input[name="product"]:checked');
    const payEl = form.querySelector('input[name="payment"]:checked');
    const prod = (prodEl && prodEl.value) ? prodEl.value : 'desk';
    const pay = (payEl && payEl.value) ? payEl.value : 'eth';
    const val = (prices[prod] && prices[prod][pay]) ? prices[prod][pay] : '';
    if (previewPrice) previewPrice.textContent = val;
  }

  // ボタンクリックで開く（サイト内の .btn-buy 全て）
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a.btn-buy');
    if (!a) return;
    // このページ内の注文誘導はモーダルを優先
    e.preventDefault();
    updatePrice();
    open();
  });

  // 商品/支払い選択でプレビュー・価格を更新
  form.addEventListener('change', (e) => {
    const t = e.target;
    if (t && t.name === 'product') {
      setPreview(t.value);
    }
    if (t && (t.name === 'product' || t.name === 'payment')) {
      updatePrice();
    }
  });

  // 注文確定ボタンクリックで送信
  document.addEventListener('click', (ev) => {
    const btn = ev.target && ev.target.closest('.order-submit');
    if (!btn) return;
    ev.preventDefault();
    // HTML標準のバリデーション
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const getVal = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      return el ? (el.value || '').trim() : '';
    };
    const prodEl = form.querySelector('input[name="product"]:checked');
    const payEl = form.querySelector('input[name="payment"]:checked');
    const prodKey = (prodEl && prodEl.value) || 'desk';
    const payKey = (payEl && payEl.value) || 'eth';
    const prodLabel = prodKey === 'desk' ? '卓上カレンダー' : 'A3縦サイズ壁掛けカレンダー';
    const payLabel = payKey === 'eth' ? 'ETH払い' : 'JPYC払い';
    const lines = [
      `Xのユーザ名：${getVal('x_handle')}`,
      `メールアドレス：${getVal('email')}`,
      `ウォレットアドレス：${getVal('wallet')}`,
      `商品：${prodLabel}`,
      `お支払い方法：${payLabel}`,
      `お届け先の郵便番号：${getVal('postal')}`,
      `お届け先の住所：${getVal('address')}`,
      `お届け先の電話番号：${getVal('phone')}`,
      `お届け先の氏名：${getVal('fullname')}`,
      `備考欄：${getVal('notes')}`
    ];
    const payload = {
      x_handle: getVal('x_handle'),
      email: getVal('email'),
      wallet: getVal('wallet'),
      product: prodLabel,
      payment: payLabel,
      postal: getVal('postal'),
      address: getVal('address'),
      phone: getVal('phone'),
      fullname: getVal('fullname'),
      notes: getVal('notes')
    };
    const subject = (function(){
      const base = 'NOAカレンダー注文情報';
      return base + ((payload.notes && payload.notes.trim()) ? '（備考あり）' : '');
    })();
    const bodyText = lines.join('\r\n');

    const endpoint = (window && window.ORDER_ENDPOINT) ? String(window.ORDER_ENDPOINT) : '';
    const finish = (ok) => {
      if (ok) {
        alert('ご注文内容を送信しました。ありがとうございました！');
        close();
      } else {
        // フォールバック: メールクライアント起動
        const mailto = `mailto:sumitomo_kenji@yahoo.co.jp?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
        window.location.href = mailto;
        setTimeout(close, 300);
      }
    };

    // 送信中のUI
    const prevText = btn.textContent;
    btn.disabled = true;
    btn.textContent = '送信中…';

    if (endpoint) {
      const formBody = new URLSearchParams({
        to: 'sumitomo_kenji@yahoo.co.jp',
        subject,
        body: bodyText,
        x_handle: payload.x_handle,
        email: payload.email,
        wallet: payload.wallet,
        product: payload.product,
        payment: payload.payment,
        postal: payload.postal,
        address: payload.address,
        phone: payload.phone,
        fullname: payload.fullname,
        notes: payload.notes,
        remarks: payload.notes,
        note: payload.notes,
        memo: payload.notes
      }).toString();
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: formBody
      }).then((res) => {
        btn.disabled = false;
        btn.textContent = prevText;
        finish(res && res.ok);
      }).catch(() => {
        btn.disabled = false;
        btn.textContent = prevText;
        finish(false);
      });
    } else {
      // エンドポイント未設定時はフォールバック
      btn.disabled = false;
      btn.textContent = prevText;
      finish(false);
    }
  });

  // 郵便番号: 数字のみ + 自動ハイフン挿入（3-4）
  const p = postalInput();
  if (p) {
    // 表示・制約をJSで上書き
    try {
      p.placeholder = '1234567';
      p.setAttribute('pattern', '\\d{7}');
      p.setAttribute('maxlength', '7');
      const hintEl = p.parentElement ? p.parentElement.querySelector('.hint') : null;
      if (hintEl) hintEl.textContent = '半角数字7桁（ハイフンなし）';
    } catch (_) {}

    // 数字のみ + 7桁に制限（ハイフンは付与しない）
    p.addEventListener('input', () => {
      const digits = p.value.replace(/\D/g, '').slice(0, 7);
      p.value = digits;
    });
  }

  // 住所・電話のプレースホルダーも調整
  try {
    const addr = form.querySelector('textarea[name="address"]');
    if (addr) addr.placeholder = '東京都〇〇区〇〇 1-2-3 NOAビル 101';
    const ph = form.querySelector('input[name="phone"]');
    if (ph) ph.placeholder = '09012345678';
    const w = form.querySelector('input[name="wallet"]');
    if (w) {
      const wl = w.parentElement ? w.parentElement.querySelector('.label') : null;
      if (wl) wl.textContent = 'あなたのウォレットアドレス(0xから始まる数字）';
    }

    // Xのユーザ名の直下にメールアドレス欄を挿入
    const xHandle = form.querySelector('input[name="x_handle"]');
    if (xHandle) {
      const xLabel = xHandle.closest('.field');
      if (xLabel && xLabel.parentElement) {
        const emailLabel = document.createElement('label');
        emailLabel.className = 'field';
        emailLabel.innerHTML = `
          <span class="label">メールアドレス</span>
          <input type="email" name="email" placeholder="example@example.com" required>
        `;
        xLabel.parentElement.insertBefore(emailLabel, xLabel.nextSibling);
      }
    }
  } catch (_) {}

  // 背景クリックで閉じる
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) close();
  });
  // ×ボタン
  closeBtn.addEventListener('click', close);
  // Escで閉じる
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !backdrop.hidden) close();
  });

  // 送信（デモ動作）
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    // 簡易必須チェック
    const required = form.querySelectorAll('[required]');
    for (const el of required) {
      if (!el.value || !el.value.trim()) {
        el.focus();
        el.reportValidity ? el.reportValidity() : null;
        return;
      }
    }
    // ウォレットアドレスの形式チェック（0x/0X + 40桁の16進、全42文字）
    const walletEl = form.querySelector('input[name="wallet"]');
    if (walletEl) {
      const v = walletEl.value.trim();
      if (!/^0[xX][0-9A-Fa-f]{40}$/.test(v)) {
        alert('ウォレットアドレスは0xから始まる42桁の英数字で入力してください');
        walletEl.focus();
        return;
      }
    }
    // 郵便番号の形式チェック（7桁）
    const postal = postalInput();
    if (postal) {
      const digits = postal.value.replace(/\D/g,'');
      if (digits.length !== 7) {
        alert('郵便番号は7桁で入力してください');
        postal.focus();
        return;
      }
    }
    alert('ご注文内容を受け付けました！\n（デモ表示：実際の決済・送信は未接続です）');
    close();
  });
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
