(function () {
  const remote = require('electron').remote; 

  function init() { 
    document.querySelector("#min-btn").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow();
      window.minimize(); 
    });

    document.querySelector("#max-btn").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow();
      if (!window.isMaximized()) {
        window.maximize();
      } else {
        window.unmaximize();
      }	 
    });

    document.querySelector("#close-btn").addEventListener("click", function (e) {
      const window = remote.getCurrentWindow();
      window.close();
    });

    document.querySelector("#modeSelector").addEventListener("click", function () {
      this.innerHTML = toggleWindowSize();
    });

  };

  function toggleWindowSize() {
    const window = remote.getCurrentWindow();
    [x,y] = window.getSize();
    if (x == 400) {
      window.setSize(900, 600, true);
      return "Skinny Mode";
    }
    else {
      window.setSize(400, 600, true);
      return "Wide Mode";
    }
  } 

  document.onreadystatechange = function () {
    if (document.readyState == "complete") {
      init();
    }
  };
})();