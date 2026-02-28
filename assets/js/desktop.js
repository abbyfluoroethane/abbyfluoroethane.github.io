(function () {
  document.addEventListener('DOMContentLoaded', function () {
    initCloseButton();
    initResizeButton();
  });

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

  function initResizeButton() {
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
})();
