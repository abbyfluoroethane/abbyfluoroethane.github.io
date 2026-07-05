/* ==========================================================================
   Classic Mac OS window manager
   Turns the site into a persistent desktop: clicking an icon or internal link
   fetches that page and opens its content as a new floating window instead of
   reloading. Windows can be dragged (ghost outline), resized, zoomed, rolled up
   (WindowShade), focused (active/inactive), and closed — many open at once.

   Progressive enhancement: a direct visit still renders the page as the initial
   window (works with no JS); the manager only takes over subsequent navigation.
   On touch / narrow layouts it stays out of the way and lets normal full-page
   navigation happen.
   ========================================================================== */
(function () {
  'use strict';

  var desktop;
  var openList = [];      // all open windows, in creation order (root first)
  var zCounter = 20;      // running z-index for focus stacking
  var histDepth = 0;      // history depth of the frontmost-opened window

  function isMobile() {
    return window.matchMedia('(max-width: 768px)').matches;
  }
  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  // Normalise a same-origin href to a bare pathname for de-duplication.
  function normalize(href) {
    try {
      var u = new URL(href, window.location.href);
      var p = u.pathname;
      if (p.length > 1 && p.charAt(p.length - 1) === '/') p = p.slice(0, -1);
      return p || '/';
    } catch (e) {
      return href;
    }
  }
  function samePath(a, b) {
    return normalize(a) === normalize(b);
  }
  function isHome(url) {
    return normalize(url) === '/' || normalize(url) === '/index.html';
  }

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    desktop = document.getElementById('desktop');
    if (!desktop) return;

    var main = document.getElementById('main-window');
    if (main) {
      main.classList.add('mac-window');
      main._url = normalize(window.location.pathname);
      main._isRoot = true;
      main._depth = 0;
      main._title = document.title;
      wireWindow(main);
      openList.push(main);
      focusWindow(main);
    }

    wireModals();
    initDesktopIcons();
    initLinkInterception();
    initHistory();
  }

  /* ---- Per-window behaviour: focus, drag, resize, shade, zoom, close ---- */

  function wireWindow(win) {
    var bar = win.querySelector(':scope > .title-bar');
    var grip = win.querySelector(':scope > .window-bottom-bar > .resize-grip');
    var closeBtn = bar && bar.querySelector('button.close');
    var zoomBtn = bar && bar.querySelector('button.resize');

    // Clicking anywhere in a window brings it to the front.
    win.addEventListener('pointerdown', function () {
      focusWindow(win);
    }, true);

    if (bar) {
      enableOutlineDrag(win, bar);
      // Double-click title bar = WindowShade roll-up.
      bar.addEventListener('dblclick', function (e) {
        if (e.target.closest('button')) return;
        toggleShade(win);
      });
    }
    if (grip) enableOutlineResize(win, grip);

    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        closeWindow(win);
      });
    }
    if (zoomBtn && !zoomBtn.classList.contains('hidden')) {
      zoomBtn.addEventListener('click', function (e) {
        e.preventDefault();
        toggleZoom(win);
      });
    }

    attachScrollbar(win);
  }

  /* ---- Fake vertical scrollbar for browsers without ::-webkit-scrollbar ----
     (i.e. Firefox). Overlays the pane's right edge and mirrors the webkit look.
     Enable in Chrome for testing with ?fakescroll=1. Native scrolling (wheel,
     keyboard, trackpad) keeps working — this only replaces the visual bar and
     adds thumb/arrow/track interaction for the mouse. */

  var USE_FAKE_SCROLLBAR = (function () {
    if (/[?&]fakescroll=1/.test(window.location.search)) return true;
    try {
      return !(window.CSS && CSS.supports && CSS.supports('selector(::-webkit-scrollbar)'));
    } catch (e) {
      return false;
    }
  })();

  function attachScrollbar(win) {
    if (!USE_FAKE_SCROLLBAR) return;
    var pane = win.querySelector(':scope > .window-pane');
    if (!pane || pane._fakeSb) return;
    pane.classList.add('has-fake-scrollbar');

    var sb = document.createElement('div');
    sb.className = 'vscroll';
    sb.innerHTML =
      '<div class="vscroll-btn vscroll-up"></div>' +
      '<div class="vscroll-track"><div class="vscroll-thumb"></div></div>' +
      '<div class="vscroll-btn vscroll-down"></div>';
    win.appendChild(sb);
    pane._fakeSb = sb;

    var track = sb.querySelector('.vscroll-track');
    var thumb = sb.querySelector('.vscroll-thumb');
    var up = sb.querySelector('.vscroll-up');
    var down = sb.querySelector('.vscroll-down');

    function geom() {
      // Overlay exactly the pane's box within the window (the window is the
      // pane's offsetParent: #main-window is position:relative, opened windows
      // are position:absolute).
      sb.style.top = pane.offsetTop + 'px';
      sb.style.height = pane.clientHeight + 'px';
      render();
    }
    function render() {
      var sh = pane.scrollHeight, ch = pane.clientHeight;
      if (sh <= ch + 1) { sb.style.display = 'none'; return; }
      sb.style.display = '';
      var trackH = track.clientHeight;
      var thumbH = Math.max(24, Math.round(trackH * ch / sh));
      var maxScroll = sh - ch;
      var maxThumb = trackH - thumbH;
      var y = maxScroll > 0 ? Math.round((pane.scrollTop / maxScroll) * maxThumb) : 0;
      thumb.style.height = thumbH + 'px';
      thumb.style.top = y + 'px';
    }

    pane.addEventListener('scroll', render);

    // Elevator (thumb) drag.
    var dragging = false, startY, startTop;
    thumb.addEventListener('pointerdown', function (e) {
      dragging = true;
      startY = e.clientY;
      startTop = parseFloat(thumb.style.top) || 0;
      thumb.setPointerCapture(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    });
    thumb.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var maxThumb = track.clientHeight - thumb.offsetHeight;
      var ny = clamp(startTop + (e.clientY - startY), 0, maxThumb);
      var range = pane.scrollHeight - pane.clientHeight;
      pane.scrollTop = maxThumb > 0 ? (ny / maxThumb) * range : 0;
    });
    function endDrag() { dragging = false; }
    thumb.addEventListener('pointerup', endDrag);
    thumb.addEventListener('pointercancel', endDrag);

    // Arrow buttons: step on click, repeat while held.
    function stepper(dir) {
      return function (e) {
        e.preventDefault();
        e.stopPropagation();
        pane.scrollTop += dir * 40;
        var interval = null;
        var timeout = setTimeout(function () {
          interval = setInterval(function () { pane.scrollTop += dir * 40; }, 60);
        }, 300);
        function stop() {
          clearTimeout(timeout);
          if (interval) clearInterval(interval);
          document.removeEventListener('pointerup', stop);
          document.removeEventListener('pointercancel', stop);
        }
        document.addEventListener('pointerup', stop);
        document.addEventListener('pointercancel', stop);
      };
    }
    up.addEventListener('pointerdown', stepper(-1));
    down.addEventListener('pointerdown', stepper(1));

    // Click the track above/below the elevator to page.
    track.addEventListener('pointerdown', function (e) {
      if (e.target === thumb) return;
      var rect = track.getBoundingClientRect();
      var clickY = e.clientY - rect.top;
      var thumbTop = parseFloat(thumb.style.top) || 0;
      pane.scrollTop += (clickY < thumbTop ? -1 : 1) * pane.clientHeight * 0.9;
    });

    // Keep in sync as the window resizes or content loads in.
    if (window.ResizeObserver) new ResizeObserver(geom).observe(pane);
    if (window.MutationObserver) {
      new MutationObserver(render).observe(pane, { childList: true, subtree: true });
    }
    window.addEventListener('resize', geom);

    geom();
  }

  function focusWindow(win) {
    if (!win) return;
    win.style.zIndex = ++zCounter;
    if (win.classList.contains('active')) return;
    openList.forEach(function (w) {
      w.classList.toggle('active', w === win);
    });
    if (win._url) {
      document.title = win._title || document.title;
      // Track the focused window in the URL bar without adding history.
      if (!samePath(window.location.pathname, win._url)) {
        history.replaceState({ depth: win._depth, url: win._url }, '', win._url);
      }
    }
  }

  // Pin a window at its current spot with an explicit size the first time it is
  // dragged/resized/shaded, so switching to absolute positioning doesn't reflow
  // it (the flex:1 pane would otherwise snap the height).
  function ensurePositioned(win) {
    if (win.classList.contains('positioned')) return;
    var rect = win.getBoundingClientRect();
    var drect = desktop.getBoundingClientRect();
    win.style.width = rect.width + 'px';
    win.style.height = rect.height + 'px';
    win.style.left = (rect.left - drect.left) + 'px';
    win.style.top = (rect.top - drect.top) + 'px';
    win.classList.add('positioned');
  }

  function toggleShade(win) {
    if (win.classList.contains('zoomed')) return;
    ensurePositioned(win);
    if (win.classList.contains('shaded')) {
      win.classList.remove('shaded');
      if (win._preShadeHeight != null) win.style.height = win._preShadeHeight;
    } else {
      win._preShadeHeight = win.style.height;
      win.classList.add('shaded');
      win.style.height = '';
    }
  }

  function toggleZoom(win) {
    if (win.classList.contains('zoomed')) {
      win.classList.remove('zoomed');
    } else {
      if (win.classList.contains('shaded')) toggleShade(win);
      ensurePositioned(win);
      win.classList.add('zoomed');
    }
  }

  function closeWindow(win) {
    var idx = openList.indexOf(win);
    if (idx >= 0) openList.splice(idx, 1);
    win.remove();
    if (openList.length === 0) {
      // Every window closed — leave a bare desktop, like closing all Finder
      // windows. Point the URL back at the desktop root; a refresh reopens Home.
      histDepth = 0;
      history.replaceState({ depth: 0, url: '/' }, '', '/');
      return;
    }
    if (histDepth > 0) histDepth--;
    var next = openList[openList.length - 1];
    next.classList.remove('active'); // force focusWindow to re-run
    focusWindow(next);
  }

  /* ---- Ghost-outline drag & resize ---- */

  function makeOutline(win) {
    var o = document.createElement('div');
    o.className = 'window-outline';
    o.style.left = (parseFloat(win.style.left) || 0) + 'px';
    o.style.top = (parseFloat(win.style.top) || 0) + 'px';
    o.style.width = win.offsetWidth + 'px';
    o.style.height = win.offsetHeight + 'px';
    o._left = parseFloat(win.style.left) || 0;
    o._top = parseFloat(win.style.top) || 0;
    o._w = win.offsetWidth;
    o._h = win.offsetHeight;
    desktop.appendChild(o);
    return o;
  }

  function enableOutlineDrag(win, bar) {
    var dragging = false, sx, sy, startLeft, startTop, outline;

    bar.addEventListener('pointerdown', function (e) {
      if (isMobile() || win.classList.contains('zoomed')) return;
      if (e.target.closest('button')) return;
      ensurePositioned(win);
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      startLeft = parseFloat(win.style.left) || 0;
      startTop = parseFloat(win.style.top) || 0;
      outline = makeOutline(win);
      bar.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    bar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var drect = desktop.getBoundingClientRect();
      var left = clamp(startLeft + (e.clientX - sx), 0, Math.max(0, drect.width - outline._w));
      var top = clamp(startTop + (e.clientY - sy), 0, Math.max(0, drect.height - outline._h));
      outline.style.left = left + 'px';
      outline.style.top = top + 'px';
      outline._left = left; outline._top = top;
    });

    function end() {
      if (!dragging) return;
      dragging = false;
      if (outline) {
        win.style.left = outline._left + 'px';
        win.style.top = outline._top + 'px';
        outline.remove();
        outline = null;
      }
    }
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
  }

  function enableOutlineResize(win, grip) {
    var resizing = false, sx, sy, outline;

    grip.addEventListener('pointerdown', function (e) {
      if (isMobile() || win.classList.contains('zoomed') || win.classList.contains('shaded')) return;
      ensurePositioned(win);
      resizing = true;
      sx = e.clientX; sy = e.clientY;
      outline = makeOutline(win);
      grip.setPointerCapture(e.pointerId);
      e.preventDefault();
      e.stopPropagation();
    });

    grip.addEventListener('pointermove', function (e) {
      if (!resizing) return;
      var drect = desktop.getBoundingClientRect();
      var w = clamp(outline._w + (e.clientX - sx), 320, drect.width - outline._left);
      var h = clamp(outline._h + (e.clientY - sy), 120, drect.height - outline._top);
      outline.style.width = w + 'px';
      outline.style.height = h + 'px';
      outline._newW = w; outline._newH = h;
    });

    function end() {
      if (!resizing) return;
      resizing = false;
      if (outline) {
        if (outline._newW) win.style.width = outline._newW + 'px';
        if (outline._newH) win.style.height = outline._newH + 'px';
        outline.remove();
        outline = null;
      }
    }
    grip.addEventListener('pointerup', end);
    grip.addEventListener('pointercancel', end);
  }

  /* ---- Opening windows by fetching pages ---- */

  function findWindow(url) {
    for (var i = 0; i < openList.length; i++) {
      if (samePath(openList[i]._url, url)) return openList[i];
    }
    return null;
  }

  function cascadeGeometry() {
    var drect = desktop.getBoundingClientRect();
    var w = Math.min(720, Math.round(drect.width * 0.82));
    var h = Math.min(Math.round(drect.height * 0.74), Math.max(200, drect.height - 20));
    var step = 26 * openList.length;
    var left = clamp(36 + step, 0, Math.max(0, drect.width - w));
    var top = clamp(24 + step, 0, Math.max(0, drect.height - h));
    return { left: left, top: top, w: w, h: h };
  }

  function buildWindow(title, paneHTML, url) {
    var win = document.createElement('div');
    win.className = 'window mac-window positioned';
    win.innerHTML =
      '<div class="title-bar">' +
        '<button class="close" aria-label="Close"></button>' +
        '<h1 class="title"></h1>' +
        '<button class="resize" aria-label="Zoom"></button>' +
      '</div>' +
      '<div class="separator"></div>' +
      '<div class="window-pane"></div>' +
      '<div class="window-bottom-bar" aria-hidden="true">' +
        '<span class="hscroll-arrow hscroll-left"></span>' +
        '<span class="hscroll-track"></span>' +
        '<span class="hscroll-arrow hscroll-right"></span>' +
        '<div class="resize-grip"></div>' +
      '</div>';
    win.querySelector('.title').textContent = title;
    win.querySelector('.window-pane').innerHTML = paneHTML;
    win._url = normalize(url);
    win._isRoot = false;
    return win;
  }

  // <script> nodes set via innerHTML never execute — re-create them so inline
  // widgets (last.fm, gallery, fedi embeds) run. Most of these gate their setup
  // on DOMContentLoaded, which already fired, so while the injected scripts run
  // we intercept DOMContentLoaded registrations and invoke them immediately
  // (the DOM is ready). The patch is active only for the synchronous execution
  // of these inline scripts, so the page's own init handlers are untouched.
  function runScripts(pane, sourcePane) {
    if (!sourcePane) return;
    var scripts = sourcePane.querySelectorAll('script');
    if (!scripts.length) return;

    var origAdd = document.addEventListener;
    document.addEventListener = function (type, fn) {
      if (type === 'DOMContentLoaded' && typeof fn === 'function') {
        try { fn(); } catch (e) { /* keep other scripts running */ }
        return;
      }
      return origAdd.apply(document, arguments);
    };
    try {
      scripts.forEach(function (old) {
        var s = document.createElement('script');
        for (var i = 0; i < old.attributes.length; i++) {
          s.setAttribute(old.attributes[i].name, old.attributes[i].value);
        }
        if (!old.src) s.textContent = old.textContent;
        pane.appendChild(s); // inline scripts execute synchronously here
      });
    } finally {
      document.addEventListener = origAdd;
    }
  }

  function openWindow(href) {
    var url = normalize(href);

    // Close any open menu.
    if (document.activeElement && document.activeElement.blur) {
      document.activeElement.blur();
    }

    var existing = findWindow(url);
    if (existing) {
      if (existing.classList.contains('shaded')) toggleShade(existing);
      focusWindow(existing);
      pushHistory(existing);
      return;
    }

    fetch(url, { headers: { 'X-Requested-With': 'window-manager' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var srcMain = doc.getElementById('main-window');
        if (!srcMain) throw new Error('no window content');
        var titleEl = srcMain.querySelector('.title');
        var paneSrc = srcMain.querySelector('.window-pane');
        var win = buildWindow(
          titleEl ? titleEl.textContent.trim() : (doc.title || ''),
          paneSrc ? paneSrc.innerHTML : '',
          url
        );
        win._title = doc.title || (titleEl ? titleEl.textContent.trim() : '');

        var g = cascadeGeometry();
        win.style.left = g.left + 'px';
        win.style.top = g.top + 'px';
        win.style.width = g.w + 'px';
        win.style.height = g.h + 'px';

        desktop.appendChild(win);
        wireWindow(win);
        openList.push(win);
        runScripts(win.querySelector('.window-pane'), paneSrc);
        focusWindow(win);
        pushHistory(win);
      })
      .catch(function () {
        // Anything unexpected: fall back to a real navigation.
        window.location.href = url;
      });
  }

  // Expose for headless/manual testing.
  window.__desktopOpenWindow = openWindow;

  /* ---- History: URL tracks the focused window ---- */

  function pushHistory(win) {
    win._depth = ++histDepth;
    history.pushState({ depth: win._depth, url: win._url }, '', win._url);
    if (win._title) document.title = win._title;
  }

  function initHistory() {
    history.replaceState({ depth: 0, url: normalize(window.location.pathname) }, '',
      window.location.pathname);

    window.addEventListener('popstate', function (e) {
      var st = e.state || {};
      var targetDepth = typeof st.depth === 'number' ? st.depth : 0;

      // Going back closes every window opened after the target depth.
      openList.slice().forEach(function (w) {
        if (!w._isRoot && w._depth > targetDepth) {
          var i = openList.indexOf(w);
          if (i >= 0) openList.splice(i, 1);
          w.remove();
        }
      });
      histDepth = targetDepth;

      var match = st.url ? findWindow(st.url) : null;
      if (!match && st.url && !findWindow(st.url)) {
        // Target isn't open (forward nav / deep link) — open it fresh.
        if (!isMobile()) { openWindow(st.url); return; }
        window.location.href = st.url;
        return;
      }
      focusWindow(match || openList[openList.length - 1]);
    });
  }

  /* ---- Intercept internal navigation ---- */

  function shouldIntercept(a) {
    if (!a) return false;
    if (isMobile()) return false;
    if (a.target && a.target !== '' && a.target !== '_self') return false;
    if (a.hasAttribute('download')) return false;
    var href = a.getAttribute('href');
    if (!href) return false;
    if (href.charAt(0) === '#') return false;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return false;
    if (a.origin && a.origin !== window.location.origin) return false;
    // Skip links to real files (feeds, downloads, assets).
    if (/\.(pdf|zip|xml|json|png|jpe?g|gif|svg|mp3|mp4|webm)$/i.test(a.pathname || '')) return false;
    return true;
  }

  function initLinkInterception() {
    document.addEventListener('click', function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey ||
          e.shiftKey || e.altKey) return;
      var a = e.target.closest('a');
      if (!a || a.classList.contains('desktop-icon')) return; // icons handled below
      if (!shouldIntercept(a)) return;
      e.preventDefault();
      openWindow(a.pathname + (a.search || ''));
    });
  }

  /* ---- Modals (About / Acknowledgements): make them movable ----
     Modals live in a fixed, full-screen .modal-overlay and keep their natural
     (content-sized) height, so they deliberately do NOT get .mac-window (that
     would collapse their pane). Close + backdrop-dismiss are wired in
     menubar.html; this just adds live dragging by the title bar, positioned
     within the overlay. */

  function wireModals() {
    document.querySelectorAll('.modal-overlay > .window').forEach(function (win) {
      var bar = win.querySelector(':scope > .title-bar');
      if (bar) enableModalDrag(win, bar);
    });
  }

  function enableModalDrag(win, bar) {
    var dragging = false, sx, sy, startLeft, startTop;
    bar.style.cursor = 'move';

    bar.addEventListener('pointerdown', function (e) {
      if (isMobile() || e.target.closest('button')) return;
      var rect = win.getBoundingClientRect();
      // Pin at current spot inside the fixed overlay, then move freely.
      startLeft = rect.left;
      startTop = rect.top;
      win.style.position = 'absolute';
      win.style.margin = '0';
      win.style.left = startLeft + 'px';
      win.style.top = startTop + 'px';
      dragging = true;
      sx = e.clientX; sy = e.clientY;
      bar.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    bar.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      win.style.left = (startLeft + e.clientX - sx) + 'px';
      win.style.top = (startTop + e.clientY - sy) + 'px';
    });

    function end() { dragging = false; }
    bar.addEventListener('pointerup', end);
    bar.addEventListener('pointercancel', end);
  }

  /* ---- Desktop icons: select, then open on double-click / Enter ---- */

  function initDesktopIcons() {
    var icons = document.querySelectorAll('.desktop-icon');
    if (!icons.length) return;

    var coarse = window.matchMedia('(hover: none)').matches;

    function clearSelection() {
      icons.forEach(function (i) { i.classList.remove('selected'); });
    }
    function open(href) {
      if (!href) return;
      if (isMobile()) { window.location.href = href; return; }
      openWindow(href);
    }

    icons.forEach(function (icon) {
      icon.addEventListener('click', function (e) {
        if (coarse) return; // single tap opens on touch (default navigation)
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

    if (desktop) {
      desktop.addEventListener('click', function (e) {
        if (!e.target.closest('.desktop-icon') && !e.target.closest('.mac-window')) {
          clearSelection();
        }
      });
    }
  }
})();
