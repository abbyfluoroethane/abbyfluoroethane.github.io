(function () {
  var STORAGE_KEY = 'winState';

  document.addEventListener('DOMContentLoaded', function () {
    initCloseButton();
    initZoomButton();
    initDragAndResize();
    initDesktopIcons();
  });

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function initCloseButton() {
    var closeBtn = document.getElementById('main-close');
    if (!closeBtn) return;

    var currentPath = window.location.pathname;

    if (currentPath === '/' || currentPath === '/index.html') {
      closeBtn.classList.add('disabled');
      closeBtn.style.pointerEvents = 'none';
    } else {
      closeBtn.addEventListener('click', function () {
        window.location.href = '/';
      });
    }
  }

  function initZoomButton() {
    var resizeBtn = document.getElementById('main-resize');
    var win = document.getElementById('main-window');
    if (!resizeBtn || !win) return;

    // Restore saved zoom state
    if (localStorage.getItem('zoomed') === 'true') {
      win.classList.add('zoomed');
    }

    resizeBtn.addEventListener('click', function () {
      win.classList.toggle('zoomed');
      localStorage.setItem('zoomed', win.classList.contains('zoomed'));
    });
  }

  // ---- Drag (title bar) + free resize (corner grip) ----

  function initDragAndResize() {
    var win = document.getElementById('main-window');
    var bar = document.getElementById('main-title-bar');
    var grip = document.getElementById('main-resize-grip');
    var desktop = document.getElementById('desktop');
    if (!win || !bar || !desktop) return;

    // Take the window out of flex flow and pin it at its current spot the
    // first time the user interacts. Width is locked so absolute positioning
    // doesn't collapse it; height stays natural until an explicit resize.
    function ensurePositioned() {
      if (win.classList.contains('positioned')) return;
      var rect = win.getBoundingClientRect();
      var drect = desktop.getBoundingClientRect();
      win.style.width = rect.width + 'px';
      win.style.left = (rect.left - drect.left) + 'px';
      win.style.top = (rect.top - drect.top) + 'px';
      win.classList.add('positioned');
    }

    function save() {
      if (!win.classList.contains('positioned')) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        left: parseFloat(win.style.left) || 0,
        top: parseFloat(win.style.top) || 0,
        width: win.offsetWidth,
        // only persist height if the user explicitly resized
        height: win.style.height ? win.offsetHeight : null
      }));
    }

    function restore() {
      var saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      var s;
      try { s = JSON.parse(saved); } catch (e) { return; }
      var drect = desktop.getBoundingClientRect();
      var w = Math.min(s.width || win.offsetWidth, drect.width);
      win.classList.add('positioned');
      win.style.width = w + 'px';
      if (s.height) win.style.height = Math.min(s.height, drect.height) + 'px';
      var h = win.offsetHeight;
      win.style.left = clamp(s.left, 0, Math.max(0, drect.width - w)) + 'px';
      win.style.top = clamp(s.top, 0, Math.max(0, drect.height - h)) + 'px';
    }

    function clampIntoView() {
      if (!win.classList.contains('positioned')) return;
      var drect = desktop.getBoundingClientRect();
      var w = win.offsetWidth, h = win.offsetHeight;
      win.style.left = clamp(parseFloat(win.style.left) || 0, 0, Math.max(0, drect.width - w)) + 'px';
      win.style.top = clamp(parseFloat(win.style.top) || 0, 0, Math.max(0, drect.height - h)) + 'px';
    }

    // On mobile the window is full-width; clear any desktop positioning so the
    // responsive CSS can take over. Re-apply saved state when back on desktop.
    function applyMode() {
      if (isMobile()) {
        win.classList.remove('positioned');
        win.style.left = win.style.top = win.style.width = win.style.height = '';
      } else if (win.classList.contains('positioned')) {
        clampIntoView();
      } else {
        restore();
      }
    }

    // --- Drag ---
    var dragging = false, dStartX, dStartY, dStartLeft, dStartTop;

    bar.addEventListener('pointerdown', function (e) {
      if (isMobile() || win.classList.contains('zoomed')) return;
      if (e.target.closest('button')) return; // let close/zoom buttons work
      ensurePositioned();
      dragging = true;
      dStartX = e.clientX;
      dStartY = e.clientY;
      dStartLeft = parseFloat(win.style.left) || 0;
      dStartTop = parseFloat(win.style.top) || 0;
      win.classList.add('dragging');
      bar.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    bar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var drect = desktop.getBoundingClientRect();
      var left = clamp(dStartLeft + (e.clientX - dStartX), 0, Math.max(0, drect.width - win.offsetWidth));
      var top = clamp(dStartTop + (e.clientY - dStartY), 0, Math.max(0, drect.height - win.offsetHeight));
      win.style.left = left + 'px';
      win.style.top = top + 'px';
    });

    function endDrag() {
      if (!dragging) return;
      dragging = false;
      win.classList.remove('dragging');
      save();
    }
    bar.addEventListener('pointerup', endDrag);
    bar.addEventListener('pointercancel', endDrag);

    // --- Resize ---
    if (grip) {
      var resizing = false, rStartX, rStartY, rStartW, rStartH;

      grip.addEventListener('pointerdown', function (e) {
        if (isMobile() || win.classList.contains('zoomed')) return;
        ensurePositioned();
        resizing = true;
        rStartX = e.clientX;
        rStartY = e.clientY;
        rStartW = win.offsetWidth;
        rStartH = win.offsetHeight;
        win.classList.add('resizing');
        grip.setPointerCapture(e.pointerId);
        e.preventDefault();
        e.stopPropagation();
      });

      grip.addEventListener('pointermove', function (e) {
        if (!resizing) return;
        var drect = desktop.getBoundingClientRect();
        var left = parseFloat(win.style.left) || 0;
        var top = parseFloat(win.style.top) || 0;
        var w = clamp(rStartW + (e.clientX - rStartX), 320, drect.width - left);
        var h = clamp(rStartH + (e.clientY - rStartY), 200, drect.height - top);
        win.style.width = w + 'px';
        win.style.height = h + 'px';
      });

      function endResize() {
        if (!resizing) return;
        resizing = false;
        win.classList.remove('resizing');
        save();
      }
      grip.addEventListener('pointerup', endResize);
      grip.addEventListener('pointercancel', endResize);
    }

    window.addEventListener('resize', applyMode);
    applyMode();
  }

  // ---- Desktop icons: click to select, double-click / Enter to open ----

  function initDesktopIcons() {
    var icons = document.querySelectorAll('.desktop-icon');
    if (!icons.length) return;

    // Touch devices have no double-click affordance — a single tap opens.
    var coarse = window.matchMedia('(hover: none)').matches;

    function clearSelection() {
      icons.forEach(function (i) { i.classList.remove('selected'); });
    }

    function open(href) {
      if (href) window.location.href = href;
    }

    icons.forEach(function (icon) {
      icon.addEventListener('click', function (e) {
        if (coarse) return; // allow default navigation on touch
        e.preventDefault();
        clearSelection();
        icon.classList.add('selected');
      });

      icon.addEventListener('dblclick', function (e) {
        e.preventDefault();
        open(icon.getAttribute('href'));
      });

      icon.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          open(icon.getAttribute('href'));
        }
      });
    });

    // Click on empty desktop clears the selection
    var desktop = document.getElementById('desktop');
    if (desktop) {
      desktop.addEventListener('click', function (e) {
        if (!e.target.closest('.desktop-icon')) clearSelection();
      });
    }
  }
})();
