(function() {
  const remote = require('electron').remote;

  function init() {
    document.querySelector("#min-btn").addEventListener("click", function(e) {
      const window = remote.getCurrentWindow();
      window.minimize();
    });

    document.querySelector("#max-btn").addEventListener("click", function(e) {
      const window = remote.getCurrentWindow();
      if (!window.isMaximized()) {
        window.maximize();
      }
      else {
        window.unmaximize();
      }
    });

    document.querySelector("#max-btn").style.display = "none";

    document.querySelector("#close-btn").addEventListener("click", function(e) {
      const window = remote.getCurrentWindow();
      window.close();
    });

    document.querySelector("#modeSelector").addEventListener("click", function() {
      toggleWindowSize();
      this.innerHTML = updateButtonText();
    });

  };

  function toggleWindowSize() {
    const window = remote.getCurrentWindow();
    [x, y] = window.getSize();
    if (x == 400) {
      window.setSize(900, 600, true);
    }
    else {
      window.setSize(400, 600, true);
    }
  }

  function updateButtonText() {
    const window = remote.getCurrentWindow();
    [x, y] = window.getSize();
    if (x == 400) {
      return "Wide Mode";
    }
    else {
      return "Skinny Mode";
    }
  }

  document.onreadystatechange = function() {
    if (document.readyState == "complete") {
      init();
      document.querySelector("#modeSelector").innerHTML = updateButtonText();
    }
  };
})();
