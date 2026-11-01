
  const input = document.getElementById('input');
  const textEl = document.getElementById('text');
  const display = document.getElementById('display');
  const controls = document.getElementById('controls');
  const hint = document.getElementById('hint');
  const colorPicker = document.getElementById('colorPicker');
  const bgPicker = document.getElementById('bgPicker');
  const sizeSlider = document.getElementById('sizeSlider');
  const speedSlider = document.getElementById('speedSlider');

  let currentSize = 150;
  let scrollSpeed = 8;   // seconds for one full scroll
  let controlsVisible = true;
  let scrollEnabled = true;

  /* -------- Core render -------- */
  function render() {
    const msg = input.value || '...';
    textEl.textContent = msg;

    // Reset any scroll animation
    display.classList.remove('scrolling');
    textEl.style.animation = 'none';
    textEl.style.transform = 'none';

    // Measure with current size
    textEl.style.fontSize = currentSize + 'px';
    // Force layout
    void textEl.offsetWidth;

    const displayWidth  = display.clientWidth  - 40;
    const textWidth     = textEl.scrollWidth;

    if (!scrollEnabled || textWidth <= displayWidth) {
      // Fits — keep big & centered
      autoFit(msg);
    } else {
      // Too long — SCROLL
      enableScroll(msg);
    }
  }

  /* Shrink to fit (only when short enough) */
  function autoFit(msg) {
    if (!msg || msg === '...') {
      textEl.style.fontSize = currentSize + 'px';
      return;
    }
    textEl.style.fontSize = '20px';
    const dispRect = display.getBoundingClientRect();
    let low = 20, high = Math.min(dispRect.height, dispRect.width) * 1.5, best = 20;
    for (let i = 0; i < 12; i++) {
      const mid = (low + high) / 2;
      textEl.style.fontSize = mid + 'px';
      const fits = textEl.scrollWidth <= dispRect.width - 40 &&
                   textEl.scrollHeight <= dispRect.height - 40;
      if (fits) { best = mid; low = mid; }
      else { high = mid; }
    }
    const final = Math.min(best, currentSize * 3);
    textEl.style.fontSize = final + 'px';
  }

  /* Marquee scroll for long text */
  function enableScroll(msg) {
    // Use the size the user picked (or a comfortable large size)
    const size = Math.max(60, Math.min(currentSize, Math.floor(display.clientHeight * 0.7)));
    textEl.style.fontSize = size + 'px';
    textEl.style.whiteSpace = 'nowrap';

    // Duplicate text so it loops seamlessly
    textEl.innerHTML = '';
    const span1 = document.createElement('span');
    span1.textContent = msg + '     ';
    const span2 = document.createElement('span');
    span2.textContent = msg + '     ';
    // Add a gap
    const gap1 = document.createElement('span');
    gap1.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';
    const gap2 = document.createElement('span');
    gap2.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;';

    textEl.appendChild(span1);
    textEl.appendChild(gap1);
    textEl.appendChild(span2);
    textEl.appendChild(gap2);

    display.classList.add('scrolling');

    // Restart animation with user speed
    textEl.style.animation = 'none';
    void textEl.offsetWidth;
    textEl.style.animation = `marquee ${scrollSpeed}s linear infinite`;
  }

  /* -------- Live events -------- */
  input.addEventListener('input', render);

  document.getElementById('showBtn').addEventListener('click', () => {
    render();
    input.blur();
  });

  document.getElementById('clearBtn').addEventListener('click', () => {
    input.value = '';
    render();
    input.focus();
  });

  colorPicker.addEventListener('input', () => textEl.style.color = colorPicker.value);
  bgPicker.addEventListener('input', () => document.body.style.background = bgPicker.value);

  sizeSlider.addEventListener('input', () => {
    currentSize = parseInt(sizeSlider.value);
    render();
  });

  speedSlider.addEventListener('input', () => {
    scrollSpeed = 30 - parseInt(speedSlider.value); // higher slider = faster
    if (display.classList.contains('scrolling')) {
      textEl.style.animationDuration = scrollSpeed + 's';
    }
  });

  /* Tap display to hide controls */
  display.addEventListener('click', () => {
    controlsVisible = !controlsVisible;
    controls.classList.toggle('hidden', !controlsVisible);
  });

  setTimeout(() => hint.classList.add('fade'), 3000);
  input.addEventListener('focus', () => hint.classList.add('fade'));

  // Prevent double-tap zoom
  let lastTouch = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouch <= 300) e.preventDefault();
    lastTouch = now;
  }, { passive: false });

  // Re-render on rotate / resize
  window.addEventListener('resize', render);
