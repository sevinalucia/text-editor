config.listeners = {
  "timeout": null,
  "mouseup": function () {
    document.body.style.cursor = "default";
    config.elements.sidebar.resize.action = false;
  },
  "mousedown": function (e) {
    var offset = Math.abs(e.target.offsetWidth - e.offsetX);
    var threshold = config.elements.sidebar.resize.threshold;
    if (offset < threshold) config.elements.sidebar.resize.action = true;
    /*  */
    if (e.which === 2) {
      var close = config.elements.tabs.querySelector("div[for='" + e.target.id + "']");
      if (close) close.click();
    }
  },
  "keydown": function (e) {
    var isSKey = e.which === 83 || e.keyCode === 83 || e.key === 's' || e.code === "KeyS";
    /*  */
    if (e.ctrlKey && isSKey) {
      e.preventDefault();
      e.stopPropagation();
      document.getElementById("save").click();
    }
  },
  "active": {
    "save": function (e) {
      if (e.isTrusted) {
        chrome.storage.local.set({"active": config.current.path}, function () {
          config.storage.object.active = config.current.path
        });
      }
    }
  },
	"update": {
		"info": function (cursor) {
			if (cursor) {
				if (config.current.path) {
					var name = config.current.path.split('/').pop();
          var a = "read/write files - chrome.downloads";
          var b = "read/write files - file system access";
          var info = name + ' ' + cursor.line + ':' + cursor.ch;
          /*  */
          document.querySelector(".info").textContent = info;
          document.querySelector("#version").setAttribute("title", config.support.fileio.new ? b : a);
          document.querySelector("#version").setAttribute("value", config.support.fileio.new ? 'b' : 'a');
				}
			}
		}
	},
  "cursor": {
    "add": function (e) {
			config.listeners.update.info(e.getCursor());
			/*  */
      if (e.path.indexOf("undefined") !== 0) {
        config.store("cursor", {
          "fullPath": e.path,
          "pos": e.getCursor(),
          "end": e.getCursor(false),
          "start": e.getCursor(true),
          "scroll": e.getScrollInfo(),
          "selection": e.getSelection()
        });
      }
    }
  },
  "resize": function () {
    if (config.listeners.timeout) window.clearTimeout(config.listeners.timeout);
    config.listeners.timeout = window.setTimeout(function () {
      if (chrome) {
        if (chrome.windows) {
          if (chrome.windows.getCurrent) {
            chrome.windows.getCurrent(function (win) {
              chrome.storage.local.set({"top": win.top}, function () {});
              chrome.storage.local.set({"left": win.left}, function () {});
              chrome.storage.local.set({"width": win.width}, function () {});
              chrome.storage.local.set({"height": win.height}, function () {});
            });   
          }
        }
      }
    }, 300);
  },
  "action": function (d, t) {
    var element = config.elements.sidebar[d];
    var key = d === "right" ? "marginRight" : "marginLeft";
    var attribute = element.getAttribute("state") || "close";
    var state = t ? (attribute === "open" ? "close" : "open") : attribute;
    /*  */
    config.elements.toggle[d].setAttribute("state", state);
    config.elements.sidebar[d].setAttribute("state", state);
    var width = parseInt(window.getComputedStyle(config.elements.sidebar[d]).width) + 2;
    config.elements.sidebar[d].style[key] = state === "open" ? '0' : '-' + width + "px";
    config.elements.toggle[d].textContent = state === "open" ? (d === "right" ? "›" : "‹") : (d === "right" ? "‹" : "›");
    /*  */
    var tmp = {};
    tmp["open-" + d] = state;
    tmp["sidebar-" + d] = state;
    chrome.storage.local.set(tmp, function () {});
    var timeout = navigator.userAgent.indexOf("Firefox") !== -1 ? 0 : 500;
    window.setTimeout(config.editor.update.codemirror, (state === "open" ? timeout : 500));
  },
  "downloads": function (e) {
    const OLD = config.current.path;
    /*  */
    if (e.id === config.download.id) {
      if (e.state) {
        if (e.state.current === "complete")  {
          chrome.downloads.search({"id": e.id}, function (items) {
            chrome.downloads.erase({}, function () {
              URL.revokeObjectURL(config.download.url);
              /*  */
              if (config.download.saveAs) {
                var result = config.editor.codemirror[OLD].getValue();
                var fileName = items[0].filename.replace(/^.*[\\\/]/, '');
                var fullPath = '/' + fileName;
                /*  */
                config.editor.remove.codemirror(OLD, true, true);
                config.files[fullPath] = {"picker": null, "fileName": fileName, "fullPath": fullPath, "fileType": ''};
                config.editor.create.codemirror({"isFile": true, "fileType": '', "isDirectory": false, "fileName": fileName, "result": result, "fullPath": fullPath}, function () {
                  var item = document.getElementById(fullPath);
                  if (item) item.click();
                });
              }
            });
          });
        }
      }
    }
  },
  "render": {
    "line": function (cm, line, elt) {
      var softIndentWrappedLines = config.options.codemirror.lineWrapping && config.options.codemirror.softIndentWrappedLines;
      if (softIndentWrappedLines === false) return;
      /*  */
      var spaces = function (ws, ts) {
        var ft = 0, rs = 0;
        for (var i = 0; i < ws.length; i++) {
          if (ws[i] === "\t") {
            ft++;
            rs = 0;
          } else {
            rs++;
            if (rs === ts) {
              ft++;
              rs = 0;
            }
          }
        }
        return ft * ts + rs;
      };
      /*  */
      var nonespace = line.text.search(/\S/);
      if (nonespace > -1) {
        var tabsize = cm.getOption("tabSize");
        var charwidth = cm.defaultCharWidth();
        var whitespace = line.text.substr(0, nonespace);
        var offset = spaces(whitespace, tabsize) * charwidth;
        /*  */
        elt.style.paddingLeft = offset + "px";
        elt.style.textIndent = -(offset) + "px";
      }
      /*  */
      var hasclass = (new RegExp("\\b" + "indentsoftwrap" + "\\b")).test(elt.className);
      if (!hasclass) {
        if (elt.className.trim() === '') elt.className = "indentsoftwrap";
        else elt.className += " " + "indentsoftwrap";
      }
    }
  },
  "click": function (e) {
    var hide = {"flag": {}, "clicked": {}};
    hide.left = config.options.codemirror.hideLeftSidebarWhenEditorIsFocused;
    hide.right = config.options.codemirror.hideRightSidebarWhenEditorIsFocused;
    /*  */
    hide.clicked.a = e.target.getAttribute("class");
    hide.clicked.b = e.target.closest("pre") ? e.target.closest("pre").getAttribute("class") : '';
    /*  */
    hide.flag.a = hide.clicked.a && hide.clicked.a.indexOf("CodeMirror") !== -1;
    hide.flag.b = hide.clicked.b && hide.clicked.b.indexOf("CodeMirror") !== -1;
    if (hide.flag.a || hide.flag.b) {
      if (hide.left) {
        var left = document.querySelector(".open-left");
        if (left.getAttribute("state") === "open") left.click();
      }
      /*  */
      if (hide.right) {
        var right = document.querySelector(".open-right");
        if (right.getAttribute("state") === "open") right.click();
      }
    }
  },
  "changed": {
    "add": function (e, change) {
      var sidebar = config.elements.sidebar.left.querySelector("div[id*='" + e.path + "']");
      var tab = config.elements.tabs.querySelector("div[id*='" + e.path + "']");
      if (sidebar) sidebar.closest("table").setAttribute("changed", '');
      if (tab) tab.closest("table").setAttribute("changed", '');
    },
    "remove": function (id) {
      var sidebar = config.elements.sidebar.left.querySelector("div[id*='" + id + "']");
      var tab = config.elements.tabs.querySelector("div[id*='" + id + "']");
      if (sidebar) sidebar.closest("table").removeAttribute("changed");
      if (tab) tab.closest("table").removeAttribute("changed");
    },
    "check": {
			"all": function () {
				var titles = document.querySelectorAll("div[id]");
				for (var i = 0; i < titles.length; i++) {
          var table = titles[i].closest("table");
          if (table) {
            var changed = table.getAttribute("changed");
            if (changed !== null) return true;
          }
				}
				/*  */
				return false;
			},
			"directory": function (id) {
				var directory = document.getElementById("sidebar-table-for-directory-" + id);
				var titles = directory.querySelectorAll("div[id]");
				for (var i = 0; i < titles.length; i++) {
          var table = titles[i].closest("table");
          if (table) {
            var changed = table.getAttribute("changed");
            if (changed !== null) return true;
          }
				}
				/*  */
				return false;
			},
			"item": function (id) {
				var changed = {'a': false, 'b': false};
				var sidebar = config.elements.sidebar.left.querySelector("div[id*='" + id + "']");
				if (sidebar) changed.a = sidebar.closest("table").getAttribute("changed");
				var tab = config.elements.tabs.querySelector("div[id*='" + id + "']");
				if (tab) changed.b = tab.closest("table").getAttribute("changed");
				/*  */
				return (changed.a !== null ? true : false) && (changed.b !== null ? true : false);
			}
    }
  },
  "mousemove": function (e) {
    if (e) {
      if (e.target) {
        if (typeof e.target.closest === "function") {
          var div = e.target.closest("div");
          var closest = div ? div.getAttribute("class") || '' : '';
          var left = {"X": null, "flag": null, "open": null, "element": null, "attribute": null};
          var right = {"X": null, "flag": null, "open": null, "element": null, "attribute": null};
          /*  */
          left.element = document.querySelector(".open-left");
          right.element = document.querySelector(".open-right");
          /*  */
          left.X = e.clientX < 30;
          right.X = (window.innerWidth - e.clientX) < 30;
          left.open = left.element.getAttribute("state") === "open";
          right.open = right.element.getAttribute("state") === "open";
          left.attribute = closest.indexOf("sidebar-left") !== -1 || closest.indexOf("open-left") !== -1;
          right.attribute = closest.indexOf("sidebar-right") !== -1 || closest.indexOf("open-right") !== -1;
          /*  */
          left.flag = left.X || left.open || left.attribute;
          right.flag = right.X || right.open || right.attribute;
          left.element.style.opacity = left.flag ? "0.10" : "0.00";
          right.element.style.opacity = right.flag ? "0.10" : "0.00";
          /*  */
          if (config.elements.sidebar.resize.action) {
            document.body.style.cursor = "w-resize";
            config.elements.sidebar.left.style.width = e.x + "px";
            config.elements.sidebar.left.style.minWidth = e.x + "px";
            config.elements.sidebar.left.style.maxWidth = e.x + "px";
          } else document.body.style.cursor = "default";
          /*  */
          var flag_1 = closest && closest.indexOf("sidebar-left") !== -1;
          var flag_2 = closest && closest.indexOf("files-container") !== -1;
          var flag_3 = closest && closest.indexOf("CodeMirror-gutter") !== -1;
          if (flag_1 || flag_2 || flag_3) {
            var w = parseInt(window.getComputedStyle(config.elements.sidebar.left).width);
            var a = w && Math.abs(w - e.clientX) < config.elements.sidebar.resize.threshold;
            document.body.style.cursor = a ? "w-resize" : "default";
          }
        }
      }
    }
  },
  "load": function () {
    var reset = document.getElementById("reset");
    var reload = document.getElementById("reload");
    var refresh = document.getElementById("refresh");
    var support = document.getElementById("support");
    var donation = document.getElementById("donation");
    /*  */
    reset.addEventListener("click", function () {
      config.reset();
    });
    /*  */
    refresh.addEventListener("click", function () {
      var active = config.editor.codemirror[config.current.path];
      if (active) active.refresh();
    });
    /*  */
    support.addEventListener("click", function () {
      var url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    });
    /*  */
    donation.addEventListener("click", function () {
      var url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    });
    /*  */
    reload.addEventListener("click", function () {
      if (config.listeners.changed.check.all()) {
        return window.confirm("There are some unsaved changes! Please save all files before reloading the app.");
      } else document.location.reload();
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
    window.removeEventListener("load", config.listeners.load, false);
    chrome.storage.onChanged.addListener(function (e) {if ("tabs" in e) config.sorted()});
    config.elements.toggle.left.addEventListener("click", function () {config.listeners.action("left", true)});
    config.elements.toggle.right.addEventListener("click", function () {config.listeners.action("right", true)});
    new Sortable(config.elements.tabs, {"delay": 0, "scroll": true, "animation": 300, "scrollSpeed": 100, "bubbleScroll": true, "scrollSensitivity": 30, "onEnd": config.sorted});
    /*  */
    chrome.storage.local.get(null, function (o) {
      config.storage.object = o;
      /*  */
      for (var id in config.storage.defaults) {
        var valid = config.storage.object[id] !== undefined;
        config.storage.object[id] = valid ? config.storage.object[id] : config.storage.defaults[id];
      }
      /*  */
      config.elements.toggle.left.setAttribute("state", config.storage.object["open-left"]);
      config.elements.toggle.right.setAttribute("state", config.storage.object["open-right"]);
      config.elements.sidebar.left.setAttribute("state", config.storage.object["sidebar-left"]);
      config.elements.sidebar.right.setAttribute("state", config.storage.object["sidebar-right"]);
      /*  */
      config.sidebar.render();
      config.listeners.action("left", false);
      config.listeners.action("right", false);
      window.setTimeout(function () {
        document.getElementById("new").click();
      });
      /*  */
      if (config.support.fileio.old) {
        var container = document.querySelector('div[class*="sidebar"] .files-container')
        var openFolder = document.getElementById("openFolder");
        /*  */
        container.style.height = "calc(100% - 198px)";
        openFolder.closest("tr").style.display = "none";
      }
    });
  }
};
