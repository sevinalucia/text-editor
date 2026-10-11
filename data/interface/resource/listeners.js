config.listeners = {
  "timeout": null,
  "mouseup": function () {
    /*
      a drag just ended: store the settled width so it survives a restart
    */
    if (config.elements.sidebar.resize.action) {
      let width = parseInt(window.getComputedStyle(config.elements.sidebar.left).width);
      if (Number.isFinite(width) && width >= 200) config.storage.write("sidebar.left.width", width);
    }
    /*  */
    document.body.style.cursor = "default";
    config.elements.sidebar.resize.action = false;
  },
  "keydown": function (e) {
    /*
      shortcuts use Cmd on macOS and Ctrl elsewhere (metaKey counts as a
      mod key everywhere); Ctrl+N/W/Tab are browser-reserved and may leak
      through on some platforms - wired anyway, harmless where ignored
    */
    let mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    /*
      the focused engine already handled it
    */
    if (e.defaultPrevented) return;
    let key = (e.key || '').toLowerCase();
    if (!key) return;
    /*  */
    let click = function (id) {
      let button = document.getElementById(id);
      if (button) button.click();
    };
    /*  */
    if (key === 's') {
      e.preventDefault();
      e.stopPropagation();
      if (e.shiftKey) click("saveAs");
      else click("save");
    } else if (key === 'n') {
      e.preventDefault();
      e.stopPropagation();
      click("new");
    } else if (key === 'w') {
      let editor = config.editor[config.storage.local["cmv"]];
      let path = config.current.path;
      if (path && editor && editor.codemirror[path]) {
        e.preventDefault();
        e.stopPropagation();
        editor.remove.codemirror(path, false, false);
      }
    } else if (key === 'tab') {
      /*
        cycles to the next tab in bar order
      */
      e.preventDefault();
      e.stopPropagation();
      let tabs = [...config.elements.tabs.querySelectorAll("table")];
      let target = null;
      for (let i = 0; i < tabs.length; i++) {
        let path = (tabs[i].getAttribute("id") || '').replace("tabs-table-for-item-", '');
        if (path === config.current.path) {
          target = tabs[(i + 1) % tabs.length];
          break;
        }
      }
      let next = (target || tabs[0]) ? (target || tabs[0]).getAttribute("id") : null;
      if (next) {
        let item = document.getElementById(next.replace("tabs-table-for-item-", ''));
        if (item) item.click();
      }
    } else if ('123456789'.indexOf(key) !== -1) {
      e.preventDefault();
      e.stopPropagation();
      let tabs = [...config.elements.tabs.querySelectorAll("table")];
      let index = parseInt(key, 10) - 1;
      if (index === 8) index = tabs.length - 1;
      if (index < tabs.length) {
        let to = tabs[index].getAttribute("id").replace("tabs-table-for-item-", '');
        let item = document.getElementById(to);
        if (item) item.click();
      }
    } else if (key === 'f' || key === 'g') {
      /*
        find + jump: the engine gets first shot when focused, this handles
        the global fallback plus engines without an internal binding
      */
      let editor = config.editor[config.storage.local["cmv"]];
      let path = config.current.path;
      let active = path ? editor.codemirror[path] : null;
      if (active) {
        e.preventDefault();
        e.stopPropagation();
        if (config.storage.local["cmv"] === "v6") {
          if (key === 'f') CodeMirror6.search(active.view);
          else {
            let reply = window.prompt("Go to line:");
            if (reply) {
              let line = parseInt(reply, 10);
              if (Number.isFinite(line) && line > 0) {
                let doc = active.view.state.doc;
                let target = doc.line(Math.min(line, doc.lines));
                active.view.dispatch({"selection": target.from, "scrollIntoView": true});
              }
            }
          }
        } else {
          let command = key === 'f' ? (CodeMirror.commands.find || CodeMirror.commands.findPersistent) : CodeMirror.commands.jumpToLine;
          if (command) command(active);
        }
      }
    }
  },
  "active": {
    "save": function (e) {
      if (e.isTrusted) {
        /*
          mirror into memory synchronously - the delayed activation markers
          must never read a stale value while the storage write is pending
        */
        config.storage.local.active = config.current.path;
        chrome.storage.local.set({"active": config.current.path}, function () {});
      }
    }
  },
 "update": {
    "count": function (text) {
      /*
        word pass skips whitespace-only blobs; a single trim+match walk
      */
      let words = text.replace(/\s+/g, ' ').trim().match(/[^ ]+/g);
      return words ? words.length : 0;
    },
    "info": function (cursor) {
      let a = "read/write files - chrome.downloads";
      let b = "read/write files - file system access";
      /*
        parts join into the separator - no leading pipe when a segment is
        absent (no cursor, no selection, oversized text)
      */
      let parts = [];
      let name = config.current.path ? config.current.path.split('/').pop() : '';
      if (name && cursor) parts.push(name + ' ' + cursor.line + ':' + cursor.ch);
      let editor = config.editor[config.storage.local["cmv"]];
      let target = editor ? editor.codemirror[config.current.path] : null;
      if (target) {
        let text = target.getValue();
        let selection = target.getSelection();
        if (selection) parts.push('sel ' + selection.length + 'c');
        if (text.length <= 500000) {
          parts.push('lines ' + (text ? text.split("\n").length : 0));
          parts.push('words ' + config.listeners.update.count(text));
        }
        parts.push('chars ' + text.length);
      }
      /*  */
      document.querySelector(".info").textContent = parts.join(' | ');
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
      /*
        middle click anywhere on a tab row closes it; the close handler lives
        on the file-tree close button, so resolve it from the sidebar row
      */
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
            /*
              the tracked save owns flash/alert/dirty-marking through its settle fn
            */
            config.save.legacy.notify(e.id, false);
          } else {
            config.save.indicate(pending ? pending.path : config.download.path, pending ? pending.name : config.download.name, false);
            if (pending ? pending.path : config.download.path) config.listeners.changed.add({"path": pending ? pending.path : config.download.path});
            config.save.legacy.alert((pending && pending.name) || config.download.name || "file", "download was interrupted");
          }
          delete config.download.pending[e.id];
          if (pending && pending.url) URL.revokeObjectURL(pending.url);
          if (!pending && e.id === config.download.id) URL.revokeObjectURL(config.download.url);
        } else if (e.state.current === "complete")  {
          chrome.downloads.search({"id": e.id}, function (items) {
            chrome.downloads.erase({"id": e.id}, function () {
              /*
                revoke the job's own blob - the global may already belong to
                the next queued legacy save when a late event lands here
              */
              if (pending && pending.url) URL.revokeObjectURL(pending.url);
              else if (e.id === config.download.id) URL.revokeObjectURL(config.download.url);
              /*  */
              let done = pending || {"path": config.download.path, "name": config.download.name};
              config.save.indicate(done.path, done.name, false);
              delete config.download.pending[e.id];
              /*
                resolve the tracked save promise before any rename bookkeeping
              */
              config.save.legacy.notify(e.id, true);
              /*  */
              if (e.id === config.download.id && config.download.saveAs) {
                let result = config.editor[config.storage.local["cmv"]].codemirror[OLD].getValue();
                let fileName = items[0].filename.replace(/^.*[\\\/]/, '');
                let fullPath = '/' + fileName;
                /*
                  capture the old entry before the remove deletes it, or the
                  re-registered copy loses its eol/bom and the next save
                  silently normalizes them away
                */
                let source = config.files[OLD];
                config.editor[config.storage.local["cmv"]].remove.codemirror(OLD, true, true);
                config.files[fullPath] = {
                  "picker": null,
                  "fileName": fileName,
                  "fullPath": fullPath,
                  "fileType": '',
                  "eol": source && source.eol ? source.eol : config.linebreak.detect(result),
                  "bom": source ? !!source.bom : false
                };
                config.store("files", config.files[fullPath]);
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
            /*
              clamp keeps the sidebar between a usable min and 60% width
            */
            let drag = Math.max(200, Math.min(e.x, window.innerWidth * 0.6));
            document.body.style.cursor = "w-resize";
            config.elements.sidebar.left.style.width = drag + "px";
            config.elements.sidebar.left.style.minWidth = drag + "px";
            config.elements.sidebar.left.style.maxWidth = drag + "px";
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
      /*
        marker rows are resolved straight by their fixed table ids;
        building css selectors out of user paths breaks on quote characters
      */
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
        /*
          only item rows carry change markers - querying the whole document's
          div[id] set walked every file, cursor and option row for nothing
        */
        let tables = document.querySelectorAll("table[id*='tabs-table-for-item-'], table[id*='sidebar-table-for-item-']");
        for (let i = 0; i < tables.length; i++) {
          if (tables[i].getAttribute("changed") !== null) return true;
        }
        /*  */
        return false;
      },
      "directory": function (id) {
        let directory = document.getElementById("sidebar-table-for-directory-" + id);
        if (directory === null) return false;
        /*
          the subtree of a directory holds the child file rows
        */
        let tables = directory.querySelectorAll("table[id*='sidebar-table-for-item-']");
        for (let i = 0; i < tables.length; i++) {
          if (tables[i].getAttribute("changed") !== null) return true;
        }
        /*  */
        return false;
      },
      "item": function (id) {
        let rows = config.listeners.changed.rows(id);
        /*
          dirty when either marker says so - a row can be missing or stale
          while the other one is present (mid-save, saveAs rename, races)
        */
        return rows.some(function (table) {
          return table && table.getAttribute("changed") !== null;
        });
      }
    }
  }
};
