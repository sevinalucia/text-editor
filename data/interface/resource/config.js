var config = {
  "count": 0,
  "files": {},
  "editor": {},
  "options": {},
  "directories": {},
  "current": {
    "path": null
  },
  "custom": {
    "style": null
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "download": {
    "id": '', 
    "url": '', 
    "saveAs": false
  },
  "elements": {
    "toggle": {},
    "sidebar": {
      "resize": {
        "threshold": 3,
        "action": false
      }
    }
  },
  "reset": function () {
    let result = window.confirm("Do you really want to restore the app to factory settings?");
    if (result) {
      chrome.storage.local.clear(function () {
        document.getElementById("reload").click();
      });
    }
  },
  "sort": {
    "array": function (e) {return e.sort()},
    "object": function (e) {
      let keys = Object.keys(e);
      return keys.sort().reduce((a, v) => {
        a[v] = e[v];
        return a;
      }, {});
    }
  },
  "make": {
    "random": {
      "name": function makeid() {
        let text = '';
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (let i = 0; i < 7; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        /*  */
        return text;
      }
    }
  },
  "color": {
    "check": function (color) {
      let r, g, b, hsp;
      if (color.match(/^rgb/)) {
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        r = color[1];
        g = color[2];
        b = color[3];
      } else {
        color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
      }
      /*  */
      hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
      return hsp > 127.5 ? "light" : "dark";
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          let current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      let context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?win") config.port.name = "win";
            background.connect(chrome.runtime.connect({"name": config.port.name}));
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "defaults": {
      "tabs": {},
      "files": {},
      "cmv": "v5",
			"cursor": {},
      "sorted": [],
      "active": null,
      "directories": {},
      "open-left": "open",
      "open-right": "close",
      "sidebar-left": "open",
      "sidebar-right": "close"
    },
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp);
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id);
        }
      }
    }
  },
  "app": {
    "start": async function () {
      for (let id in config.storage.defaults) {
        let valid = config.storage.local[id] !== undefined;
        config.storage.local[id] = valid ? config.storage.local[id] : config.storage.defaults[id];
      }
      /*  */
      config.elements.toggle.left.setAttribute("state", config.storage.local["open-left"]);
      config.elements.toggle.right.setAttribute("state", config.storage.local["open-right"]);
      config.elements.sidebar.left.setAttribute("state", config.storage.local["sidebar-left"]);
      config.elements.sidebar.right.setAttribute("state", config.storage.local["sidebar-right"]);
      /*  */
      await config.fileio.init();
      await config.sidebar.render();
      /*  */
      config.listeners.update.info();
      config.listeners.action("left", false);
      config.listeners.action("right", false);
      /*  */
      if (config.support.fileio.old) {
        let openFolder = document.getElementById("openFolder");
        let container = document.querySelector('div[class*="sidebar"] .files-container')
        /*  */
        if (container) container.style.height = "calc(100% - 198px)";
        if (openFolder) openFolder.closest("tr").style.display = "none";
      }
      /*  */
      new Sortable(config.elements.tabs, {
        "delay": 0, 
        "scroll": true, 
        "animation": 300, 
        "scrollSpeed": 100, 
        "bubbleScroll": true, 
        "onEnd": config.sorted,
        "scrollSensitivity": 30
      });
      /*  */
      window.setTimeout(function () {
        document.getElementById("new").click();
      }, 300);
    }
  },
  "load": function () {
    const reset = document.getElementById("reset");
    const reload = document.getElementById("reload");
    const refresh = document.getElementById("refresh");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    /*  */
    reset.addEventListener("click", function () {
      config.reset();
    });
    /*  */
    refresh.addEventListener("click", function () {
      const active = config.editor[config.storage.local["cmv"]].codemirror[config.current.path];
      if (active) active.refresh();
    });
    /*  */
    support.addEventListener("click", function () {
      const url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      const url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    reload.addEventListener("click", function () {
      if (config.listeners.changed.check.all()) {
        return window.confirm("There are some unsaved changes! Please save all files before reloading the app.");
      } else {}
      //
      document.location.reload();
    });
    /*  */
    config.custom.style = document.createElement("style");
    config.elements.tabs = document.querySelector(".tabs");
    config.elements.container = document.querySelector(".container");
    config.elements.toggle.left = document.querySelector(".open-left");
    config.elements.toggle.right = document.querySelector(".open-right");
    config.elements.sidebar.left = document.querySelector(".sidebar-left");
    config.elements.sidebar.right = document.querySelector(".sidebar-right");
    /*  */
    config.custom.style.textContent = '';
    document.documentElement.appendChild(config.custom.style);
    chrome.storage.onChanged.addListener(function (e) {if ("tabs" in e) config.sorted()});
    config.elements.toggle.left.addEventListener("click", function () {config.listeners.action("left", true)});
    config.elements.toggle.right.addEventListener("click", function () {config.listeners.action("right", true)});
    /*  */
    config.storage.load(config.app.start);
    window.removeEventListener("load", config.load, false);
  }
};