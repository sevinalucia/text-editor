config.listeners = {
  "timeout": null,
  "mouseup": function () {
    document.body.style.cursor = "default";
    config.elements.sidebar.resize.action = false;
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
        /* mirror into memory synchronously - the delayed activation markers
           must never read a stale value while the storage write is pending */
        config.storage.local.active = config.current.path;
        chrome.storage.local.set({"active": config.current.path}, function () {});
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
  "mousedown": function (e) {
    let offset = Math.abs(e.target.offsetWidth - e.offsetX);
    let threshold = config.elements.sidebar.resize.threshold;
    if (offset < threshold) config.elements.sidebar.resize.action = true;
    /*  */
    if (e.which === 2) {
      /* middle click anywhere on a tab row closes it; the close handler lives
         on the file-tree close button, so resolve it from the sidebar row */
      let row = e.target.closest ? e.target.closest("table[id*='tabs-table-for-item-']") : null;
      let key = row ? row.getAttribute("id").replace("tabs-table-for-item-", '') : null;
      let sidebarRow = key ? document.getElementById("sidebar-table-for-item-" + key) : null;
      let close = sidebarRow ? sidebarRow.querySelector("td[rule='close'] div") : null;
      if (close) close.click();
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
    window.setTimeout(function () {
      let editor = config.editor[config.storage.local["cmv"]];
      if (editor) editor.update.codemirror();
    }, (state === "open" ? timeout : 500));
  },
  "click": function (e) {
    let options = config.options[config.storage.local["cmv"]];
    let hide = {"flag": {}, "clicked": {}};
    hide.left = options ? options.codemirror.hideLeftSidebarWhenEditorIsFocused : false;
    hide.right = options ? options.codemirror.hideRightSidebarWhenEditorIsFocused : false;
    /*  */
    hide.clicked.a = e.target.getAttribute("class");
    hide.clicked.b = e.target.closest("pre") ? e.target.closest("pre").getAttribute("class") : '';
    /*  */
    let editorclass = function (name) {
      return name && (name.indexOf("CodeMirror") !== -1 || name.indexOf("cm-editor") !== -1 || name.indexOf("cm-content") !== -1 || name.indexOf("cm-scroller") !== -1 || name.indexOf("cm-line") !== -1);
    };
    /*  */
    hide.flag.a = editorclass(hide.clicked.a);
    hide.flag.b = editorclass(hide.clicked.b);
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
    let pending = config.download.pending[e.id];
    if (e.id === config.download.id || pending) {
      if (e.state) {
        if (e.state.current === "interrupted") {
          if (config.log) console.warn("download save interrupted:", pending ? pending.path : config.download.path);
          if (config.save.legacy && config.save.legacy.waiters[e.id]) {
            /* the tracked save owns flash/alert/dirty-marking through its settle fn */
            config.save.legacy.notify(e.id, false);
          } else {
            config.save.indicate(pending ? pending.path : config.download.path, pending ? pending.name : config.download.name, false);
            if (pending ? pending.path : config.download.path) config.listeners.changed.add({"path": pending ? pending.path : config.download.path});
            config.save.legacy.alert((pending && pending.name) || config.download.name || "file", "download was interrupted");
          }
          delete config.download.pending[e.id];
        } else if (e.state.current === "complete")  {
          chrome.downloads.search({"id": e.id}, function (items) {
            chrome.downloads.erase({"id": e.id}, function () {
              URL.revokeObjectURL(config.download.url);
              /*  */
              let done = pending || {"path": config.download.path, "name": config.download.name};
              config.save.indicate(done.path, done.name, false);
              delete config.download.pending[e.id];
              /* resolve the tracked save promise before any rename bookkeeping */
              config.save.legacy.notify(e.id, true);
              /*  */
              if (e.id === config.download.id && config.download.saveAs) {
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
          let flag_3 = closest && (closest.indexOf("CodeMirror-gutter") !== -1 || closest.indexOf("cm-gutters") !== -1);
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
    "rows": function (key) {
      /* marker rows are resolved straight by their fixed table ids;
         building css selectors out of user paths breaks on quote characters */
      return [
        document.getElementById("tabs-table-for-item-" + key),
        document.getElementById("sidebar-table-for-item-" + key)
      ];
    },
    "add": function (e, change) {
      config.session.capture();
      if (!e || !e.path) return;
      config.listeners.changed.rows(e.path).forEach(function (table) {
        if (table) table.setAttribute("changed", '');
      });
    },
    "remove": function (id) {
      config.listeners.changed.rows(id).forEach(function (table) {
        if (table) table.removeAttribute("changed");
      });
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
				let rows = config.listeners.changed.rows(id);
				/* dirty when either marker says so - a row can be missing or stale
				   while the other one is present (mid-save, saveAs rename, races) */
				return rows.some(function (table) {
					return table && table.getAttribute("changed") !== null;
				});
			}
    }
  }
};
