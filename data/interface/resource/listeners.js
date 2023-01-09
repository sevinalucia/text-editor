config.listeners = {
  "timeout": null,
  "mouseup": function () {
    document.body.style.cursor = "default";
    config.elements.sidebar.resize.action = false;
  },
  "mousedown": function (e) {
    let offset = Math.abs(e.target.offsetWidth - e.offsetX);
    let threshold = config.elements.sidebar.resize.threshold;
    if (offset < threshold) config.elements.sidebar.resize.action = true;
    /*  */
    if (e.which === 2) {
      let close = config.elements.tabs.querySelector("div[for='" + e.target.id + "']");
      if (close) close.click();
    }
  },
  "keydown": function (e) {
    let isSKey = e.which === 83 || e.keyCode === 83 || e.key === 's' || e.code === "KeyS";
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
          config.storage.local.active = config.current.path;
        });
      }
    }
  },
	"update": {
		"info": function (cursor) {
      let a = "read/write files - chrome.downloads";
      let b = "read/write files - file system access";
      let name = config.current.path ? config.current.path.split('/').pop() : '';
      let info = name && cursor ? name + ' ' + cursor.line + ':' + cursor.ch : '';
      /*  */
      document.querySelector(".info").textContent = info;
      document.querySelector("#version").setAttribute("title", config.support.fileio.new ? b : a);
      document.querySelector("#version").setAttribute("value", config.support.fileio.new ? 'b' : 'a');
		}
	},
  "cursor": {
    "add": function (e) {
      if (e) {
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
    }
  },
  "action": function (d, t) {
    let element = config.elements.sidebar[d];
    let key = d === "right" ? "marginRight" : "marginLeft";
    let attribute = element.getAttribute("state") || "close";
    let state = t ? (attribute === "open" ? "close" : "open") : attribute;
    /*  */
    config.elements.toggle[d].setAttribute("state", state);
    config.elements.sidebar[d].setAttribute("state", state);
    let width = parseInt(window.getComputedStyle(config.elements.sidebar[d]).width) + 2;
    config.elements.sidebar[d].style[key] = state === "open" ? '0' : '-' + width + "px";
    config.elements.toggle[d].textContent = state === "open" ? (d === "right" ? "›" : "‹") : (d === "right" ? "‹" : "›");
    /*  */
    let tmp = {};
    tmp["open-" + d] = state;
    tmp["sidebar-" + d] = state;
    chrome.storage.local.set(tmp, function () {});
    let timeout = navigator.userAgent.indexOf("Firefox") !== -1 ? 0 : 500;
    window.setTimeout(config.editor[config.storage.local["cmv"]].update.codemirror, (state === "open" ? timeout : 500));
  },
  "click": function (e) {
    let hide = {"flag": {}, "clicked": {}};
    hide.left = config.options[config.storage.local["cmv"]].codemirror.hideLeftSidebarWhenEditorIsFocused;
    hide.right = config.options[config.storage.local["cmv"]].codemirror.hideRightSidebarWhenEditorIsFocused;
    /*  */
    hide.clicked.a = e.target.getAttribute("class");
    hide.clicked.b = e.target.closest("pre") ? e.target.closest("pre").getAttribute("class") : '';
    /*  */
    hide.flag.a = hide.clicked.a && hide.clicked.a.indexOf("CodeMirror") !== -1;
    hide.flag.b = hide.clicked.b && hide.clicked.b.indexOf("CodeMirror") !== -1;
    if (hide.flag.a || hide.flag.b) {
      if (hide.left) {
        let left = document.querySelector(".open-left");
        if (left.getAttribute("state") === "open") left.click();
      }
      /*  */
      if (hide.right) {
        let right = document.querySelector(".open-right");
        if (right.getAttribute("state") === "open") right.click();
      }
    }
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
                let result = config.editor[config.storage.local["cmv"]].codemirror[OLD].getValue();
                let fileName = items[0].filename.replace(/^.*[\\\/]/, '');
                let fullPath = '/' + fileName;
                /*  */
                config.editor[config.storage.local["cmv"]].remove.codemirror(OLD, true, true);
                config.files[fullPath] = {"picker": null, "fileName": fileName, "fullPath": fullPath, "fileType": ''};
                config.editor[config.storage.local["cmv"]].create.codemirror({"isFile": true, "fileType": '', "isDirectory": false, "fileName": fileName, "result": result, "fullPath": fullPath}, function () {
                  let item = document.getElementById(fullPath);
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
      let softIndentWrappedLines = config.options[config.storage.local["cmv"]].codemirror.lineWrapping && config.options[config.storage.local["cmv"]].codemirror.softIndentWrappedLines;
      if (softIndentWrappedLines === false) return;
      /*  */
      let spaces = function (ws, ts) {
        let ft = 0, rs = 0;
        for (let i = 0; i < ws.length; i++) {
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
      let nonespace = line.text.search(/\S/);
      if (nonespace > -1) {
        let tabsize = cm.getOption("tabSize");
        let charwidth = cm.defaultCharWidth();
        let whitespace = line.text.substr(0, nonespace);
        let offset = spaces(whitespace, tabsize) * charwidth;
        /*  */
        elt.style.paddingLeft = offset + "px";
        elt.style.textIndent = -(offset) + "px";
      }
      /*  */
      let hasclass = (new RegExp("\\b" + "indentsoftwrap" + "\\b")).test(elt.className);
      if (!hasclass) {
        if (elt.className.trim() === '') elt.className = "indentsoftwrap";
        else elt.className += " " + "indentsoftwrap";
      }
    }
  },
  "mousemove": function (e) {
    if (e) {
      if (e.target) {
        if (typeof e.target.closest === "function") {
          let div = e.target.closest("div");
          let closest = div ? div.getAttribute("class") || '' : '';
          let left = {"X": null, "flag": null, "open": null, "element": null, "attribute": null};
          let right = {"X": null, "flag": null, "open": null, "element": null, "attribute": null};
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
          let flag_1 = closest && closest.indexOf("sidebar-left") !== -1;
          let flag_2 = closest && closest.indexOf("files-container") !== -1;
          let flag_3 = closest && closest.indexOf("CodeMirror-gutter") !== -1;
          if (flag_1 || flag_2 || flag_3) {
            if (config.elements.sidebar.left) {
              let w = parseInt(window.getComputedStyle(config.elements.sidebar.left).width);
              let a = w && Math.abs(w - e.clientX) < config.elements.sidebar.resize.threshold;
              document.body.style.cursor = a ? "w-resize" : "default";
            }
          }
        }
      }
    }
  },
  "changed": {
    "add": function (e, change) {
      let sidebar = config.elements.sidebar.left.querySelector("div[id*='" + e.path + "']");
      let tab = config.elements.tabs.querySelector("div[id*='" + e.path + "']");
      if (sidebar) sidebar.closest("table").setAttribute("changed", '');
      if (tab) tab.closest("table").setAttribute("changed", '');
    },
    "remove": function (id) {
      let sidebar = config.elements.sidebar.left.querySelector("div[id*='" + id + "']");
      let tab = config.elements.tabs.querySelector("div[id*='" + id + "']");
      if (sidebar) sidebar.closest("table").removeAttribute("changed");
      if (tab) tab.closest("table").removeAttribute("changed");
    },
    "check": {
			"all": function () {
				let titles = document.querySelectorAll("div[id]");
				for (let i = 0; i < titles.length; i++) {
          let table = titles[i].closest("table");
          if (table) {
            let changed = table.getAttribute("changed");
            if (changed !== null) return true;
          }
				}
				/*  */
				return false;
			},
			"directory": function (id) {
				let directory = document.getElementById("sidebar-table-for-directory-" + id);
				let titles = directory.querySelectorAll("div[id]");
				for (let i = 0; i < titles.length; i++) {
          let table = titles[i].closest("table");
          if (table) {
            let changed = table.getAttribute("changed");
            if (changed !== null) return true;
          }
				}
				/*  */
				return false;
			},
			"item": function (id) {
				let changed = {'a': false, 'b': false};
				let sidebar = config.elements.sidebar.left.querySelector("div[id*='" + id + "']");
				if (sidebar) changed.a = sidebar.closest("table").getAttribute("changed");
				let tab = config.elements.tabs.querySelector("div[id*='" + id + "']");
				if (tab) changed.b = tab.closest("table").getAttribute("changed");
				/*  */
				return (changed.a !== null ? true : false) && (changed.b !== null ? true : false);
			}
    }
  }
};
