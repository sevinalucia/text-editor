var config = {
  "count": 0,
  "files": {},
  "directories": {},
  "current": {"path": null},
  "custom": {"style": null},
  "download": {"id": '', "url": '', "saveAs": false},
  "support": {"fileio": {"new": false, "old": false}},
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
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
  "make": {
    "random": {
      "name": function makeid() {
        var text = '', possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (var i = 0; i < 7; i++) text += possible.charAt(Math.floor(Math.random() * possible.length));
        return text;
      }
    }
  },
  "reset": function () {
    var result = window.confirm("Do you really want to restore the app to factory settings?");
    if (result) {
      chrome.storage.local.clear(function () {
        document.getElementById("reloadApp").click();
      });
    }
  },
  "sort": {
    "array": function (e) {return e.sort()},
    "object": function (e) {
      var keys = Object.keys(e);
      return keys.sort().reduce((a, v) => {
        a[v] = e[v];
        return a;
      }, {});
    }
  },
  "storage": {
    "object": {},
    "defaults": {
      "tabs": {},
      "files": {},
			"cursor": {},
      "sorted": [],
      "active": null,
      "directories": {},
      "open-left": "open",
      "open-right": "close",
      "sidebar-left": "open",
      "sidebar-right": "close"
    },
    "read": function (id) {return config.storage.object[id]},
    "write": function (id, data) {
      var tmp = {};
      tmp[id] = data;
      config.storage.object[id] = data;
      chrome.storage.local.set(tmp, function () {});
    }
  },
  "color": {
    "check": function (color) {
      var r, g, b, hsp;
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
  "check": {
    "file": {
      "picker": function () {
        var a = window.showOpenFilePicker;
        var b = window.showSaveFilePicker;
        return a !== undefined && b !== undefined;
      }
    },
    "permission": {
      "downloads": function () {
        return new Promise(resolve => {
          try {
            chrome.permissions.contains({"permissions": ["downloads"]}, function (granted) {
              if (granted) resolve(granted);
              else {
                var p = document.createElement("p");
                var div = document.createElement("div");
                var span = document.createElement("span");
                var modal = document.createElement("div");
                /*  */
                span.textContent = "OK";
                p.textContent = "Text Editor extension needs - downloads - permission to be able to read and write text files to disk (in the default download folder). You can change the download folder path via the settings tab in your browser.";
                modal.setAttribute("class", "modal");
                div.setAttribute("class", "modal-window");
                span.addEventListener("click", function () {
                  modal.style.display = "none";
                  /*  */
                  try {
                    chrome.permissions.request({"permissions": ["downloads"]}, function (granted) {
                      resolve(granted);
                    });
                  } catch (e) {}
                });
                /*  */
                modal.appendChild(div);
                div.appendChild(p);
                div.appendChild(span);
                document.body.appendChild(modal);
              }
            });
          } catch (e) {
            resolve(false);
          }
        });
      }
    }
  },
  "excluded": {
    "intelliSense": {
      "trigger": {
        "keys": {
          "8": "backspace",
          "9": "tab",
          "13": "enter",
          "16": "shift",
          "17": "ctrl",
          "18": "alt",
          "19": "pause",
          "20": "capslock",
          "27": "escape",
          "33": "pageup",
          "34": "pagedown",
          "35": "end",
          "36": "home",
          "37": "left",
          "38": "up",
          "39": "right",
          "40": "down",
          "45": "insert",
          "46": "delete",
          "67": "c",
          "83": "s",
          "86": "v",
          "90": "z",
          "91": "left window key",
          "92": "right window key",
          "93": "select",
          "107": "add",
          "109": "subtract",
          "110": "decimal point",
          "111": "divide",
          "112": "f1",
          "113": "f2",
          "114": "f3",
          "115": "f4",
          "116": "f5",
          "117": "f6",
          "118": "f7",
          "119": "f8",
          "120": "f9",
          "121": "f10",
          "122": "f11",
          "123": "f12",
          "144": "numlock",
          "145": "scrolllock",
          "186": "semicolon",
          "187": "equalsign",
          "188": "comma",
          "189": "dash",
          "191": "slash",
          "192": "graveaccent",
          "220": "backslash",
          "222": "quote"
        }
      }
    }
  }
};
