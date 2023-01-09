config.editor.v5 = {
  "UI": {},
  "textarea": {},
  "codemirror": {},
  "make": {
    "name": function (id) {
      const ID = id.charAt(0).toUpperCase() + id.slice(1);
      const words = ID.match(/[A-Z][a-z]+|[0-9]+/g);
      return words && words.length ? words.join(' ') : ID;
    }
  },
  "focus": {
    "codemirror": function (o) {
      let path = o ? o.fullPath || o.fileName : config.storage.local.active;
      /*  */
      if (config.editor.v5.codemirror[path]) {
        for (let id in config.editor.v5.UI) config.editor.v5.UI[id].style.display = "none";
        config.editor.v5.UI[path].style.display = "block";
        config.editor.v5.codemirror[path].refresh();
        config.editor.v5.codemirror[path].focus();
        config.editor.v5.activate.codemirror();
      } else {
        config.editor.v5.render.codemirror(o);
      }
    }
  },
  "update": {
    "codemirror": function () {
      for (let id in config.editor.v5.codemirror) {
        let target = config.editor.v5.codemirror[id];
        config.editor.v5.render.codemirror({
          "fileName": target.id,
          "fileType": target.mode,
          "fullPath": target.path,
          "result": target.getValue()
        });
      }
      /*  */
      config.editor.v5.focus.codemirror();
    }
  },
  "style": {
    "codemirror": function (editor) {
      if (editor) {
        let cmv = config.storage.local["cmv"];
        let color = window.getComputedStyle(editor).color;
        let backgroundColor = window.getComputedStyle(editor).backgroundColor;
        let userdefined = config.options[cmv].codemirror.theme === "default";
        let sidebarFontColor = userdefined ? config.options[cmv].codemirror.sidebarFontColor : color;
        let sidebarBackgroundColor = userdefined ? config.options[cmv].codemirror.sidebarBackgroundColor : backgroundColor;
        /*  */
        let flag_1 = config.color.check(sidebarBackgroundColor) === "light";
        let flag_2 = config.options[cmv].codemirror.changeAppColorsWhenThemeIsChanged === false;
        /*  */
        if (flag_1 || flag_2) {
          sidebarFontColor = config.options[cmv].codemirror.sidebarFontColor;
          sidebarBackgroundColor = config.options[cmv].codemirror.sidebarBackgroundColor;
        }
        /*  */
        config.custom.style.textContent = `
          .info, div[class*="open-"], div[class="tabs"] *, div[class*="sidebar-"] * {color: ${sidebarFontColor}}
          body, html, option, .tabs, .footer, div[class*="sidebar-"] {background-color: ${sidebarBackgroundColor}}
          .CodeMirror {font-size: ${config.options[cmv].codemirror.fontSize}; line-height: ${config.options[cmv].codemirror.lineHeight}}
        `;
        /*  */
        if (config.options[cmv].codemirror.matchHighlighter) {
          config.custom.style.textContent = `
            .info, div[class*="open-"], div[class="tabs"] *, div[class*="sidebar-"] * {color: ${sidebarFontColor}}
            body, html, option, .tabs, .footer, div[class*="sidebar-"] {background-color: ${sidebarBackgroundColor}}
            .CodeMirror {font-size: ${config.options[cmv].codemirror.fontSize}; line-height: ${config.options[cmv].codemirror.lineHeight}}
            .cm-matchhighlight, .CodeMirror-selection-highlight-scrollbar {background-color: ${config.options[cmv].codemirror.matchHighlighterColor}}
          `;
        }
      }
    }
  },
  "create": {
    "codemirror": function (o, callback) {
      let container = config.elements.sidebar.left.querySelector(".files-container");
      if (!container) {
        container = document.createElement("div");
        config.elements.sidebar.left.appendChild(container);
        container.setAttribute("class", "files-container noscrollbar");
        container.addEventListener("dragover", function (e) {e.preventDefault()});
        container.addEventListener("drop", async function (e) {
          e.preventDefault();
          /*  */
          let entries = [];
          let items = e.dataTransfer.items;
          for (let item of items) {
            if (item.kind === "file") {
              let picker = null, entry = null;
              if (config.support.fileio.new) {
                picker = await item.getAsFileSystemHandle();
                let status = await picker.requestPermission({"mode": "readwrite"});
                if (status === "granted") {
                  entry = {
                    "picker": picker,
                    "fullPath": '/' + picker.name,
                    "isFile": picker.kind === "file",
                    "isDirectory": picker.kind === "directory"
                  } 
                }
              } else {
                entry = picker = item.webkitGetAsEntry();
              }
              /*  */
              if (entry) {
                entries.push(entry);
                if (entry.isFile) {
                  config.files[entry.fullPath] = entry;
                  config.readFile(entry);
                } else {
                  config.directories[entry.fullPath] = entry;
                  config.readDirectory(entry);
                }
              }
            }
          }
          /*  */
          for (let i = 0; i < entries.length; i++) {
            await config.store(entries[i].isFile ? "files" : "directories", entries[i]);
          }
        });
      }
      /*  */
      config.sidebar.add.table.file(o, container);
      callback();
    }
  },
  "activate": {
    "codemirror": function () {
      let table = {};
      table.tabs = document.querySelectorAll("table[id*='tabs-table-for-']");
      table.sidebar = document.querySelectorAll("table[id*='sidebar-table-for-']");
      for (let i = 0; i < table.tabs.length; i++) table.tabs[i].removeAttribute("active");
      for (let i = 0; i < table.sidebar.length; i++) table.sidebar[i].removeAttribute("active");
      /*  */
      window.setTimeout(function () {
        let path = config.storage.local.active;
        let table = document.getElementById("sidebar-table-for-item-" + path);
        if (table) {
          let context = document.documentElement.getAttribute("context");
          if (context !== "webapp") {
            table.scrollIntoView({"behavior": "smooth"});
          }
        }
      }, 300);
      /*  */
			window.setTimeout(function () {
        let path = config.storage.local.active;
        let codemirror = config.editor.v5.codemirror[path];
        /*  */
        let select = config.elements.sidebar.right.querySelector("select[id='mode']");
        let input = config.elements.sidebar.right.querySelector("input[id='mode']");
        table.sidebar = document.getElementById("sidebar-table-for-item-" + path);
        table.tabs = document.getElementById("tabs-table-for-item-" + path);
        if (table.sidebar) table.sidebar.setAttribute("active", '');
        if (table.tabs) table.tabs.setAttribute("active", '');
        /*  */
        if (codemirror) {
          codemirror.refresh();
          input.value = codemirror.fileType;
          select.value = codemirror.fileType;
          /*  */
          let cursor = config.storage.local.cursor[path];
          if (cursor && cursor.pos) {
						config.listeners.update.info(cursor.pos);
            let height = window.getComputedStyle(config.editor.v5.UI[path]).height;
            if (height) {
              let offset = parseInt(height) / 2;
              if (offset === Number(offset)) {
                codemirror.scrollIntoView({"line": cursor.pos.line, "char": cursor.pos.ch}, offset);
              }
            }
            /*  */
            if (cursor.selection) {
              if (cursor.start && cursor.end) {
                let flag_1 = cursor.start.ch !== cursor.end.ch;
                let flag_2 = cursor.start.line !== cursor.end.line;
                if (flag_1 || flag_2) {
                  let end = {"line": cursor.end.line, "ch": cursor.end.ch};
                  let start = {"line": cursor.start.line, "ch": cursor.start.ch};
                  return codemirror.setSelection(start, end);
                }
              }
            }
            /*  */
            codemirror.setCursor(cursor.pos);
          }
        }
      }, 10);
    }
  },
  "remove": {
    "codemirror": function (id, force, trusted) {
      let parent = {"table": {}};
      parent.table.tabs = document.getElementById("tabs-table-for-item-" + id);
      parent.table.sidebar = document.getElementById("sidebar-table-for-item-" + id);
      parent.table.directory = document.getElementById("sidebar-table-for-directory-" + id);
      /*  */
      if (config.directories[id] || parent.table.directory) {
        if (parent.table.directory) {
					if (config.listeners.changed.check.directory(id)) return;
          /*  */
          for (let name in config.files) {
            if (config.files[name].fullPath.indexOf(id + '/') !== -1) {
              config.editor.v5.remove.codemirror(name, true);
            }
          }
          /*  */
          delete config.directories[id];
          parent.table.directory.remove();
          config.remove("directories", id, function () {});
        }
      }
      /*  */
      if (config.files[id] || parent.table.sidebar) {
        let changed = config.listeners.changed.check.item(id);
        if (force || changed === false) {
          if (parent.table.tabs) parent.table.tabs.remove();
          if (config.editor.v5.UI[id]) config.editor.v5.UI[id].remove();
          if (config.editor.v5.textarea[id]) config.editor.v5.textarea[id].remove();
          if (parent.table.sidebar) parent.table.sidebar.removeAttribute("active");
          /*  */
          let tables = document.querySelectorAll("table[id*='sidebar-table-for-']");
          for (let i = 0; i < tables.length; i++) tables[i].removeAttribute("active");
          /*  */
          delete config.editor.v5.UI[id];
          delete config.editor.v5.textarea[id];
          delete config.editor.v5.codemirror[id];
          /*  */
          config.remove("tabs", id, function () {
            config.remove("files", id, function () {
              config.remove("cursor", id, function () {});
            });
          });
          /*  */
          if (trusted) {
            delete config.files[id];
            if (parent.table.sidebar) parent.table.sidebar.remove();
          }
        } else {
          config.listeners.changed.remove(id);
          let result = window.confirm(id + " is modified, do you want to save the changes before closing?");
          if (result) {
            document.getElementById("save").click();
          } else {
            config.editor.v5.remove.codemirror(id, true);
          }
        }
      }
    }
  },
  "render": {
    "codemirror": async function (o) {
      if (o) {
        let offset = {};
        let width = "100%";
        let data = o.result;
        let name = o.fileName;
        let update = o.update;
        let mode = o.fileType;
        let path = o.fullPath || name;
        let cmv = config.storage.local["cmv"];
        /*  */
        offset.l = config.elements.sidebar.left.getAttribute("state") === "open" ? parseInt(window.getComputedStyle(config.elements.sidebar.left).width) : 0;
        offset.r = config.elements.sidebar.right.getAttribute("state") === "open" ? parseInt(window.getComputedStyle(config.elements.sidebar.right).width) : 0;
        /*  */
        offset.w = offset.l + offset.r;
        offset.h = parseInt(window.getComputedStyle(config.elements.tabs).height) + 1;
        width = navigator.userAgent.indexOf("Firefox") !== -1 ? "calc(100vw - " + offset.w + "px)" : "100%";
        config.elements.tabs.setAttribute("mode", config.options[cmv].codemirror.largeTabBar ? "large" : "small");
        /*  */
        config.options[cmv].codemirror.gutters = [];
        config.options[cmv].codemirror.extraKeys = {};
        config.options[cmv].codemirror.extraKeys["Alt-F"] = "findPersistent";
        config.options[cmv].codemirror.matchTags = {"bothTags": config.options[cmv].codemirror.matchTag};
        if (config.options[cmv].codemirror.lint) config.options[cmv].codemirror.gutters.push("CodeMirror-lint-markers");
        if (config.options[cmv].codemirror.foldGutter) config.options[cmv].codemirror.gutters.push("CodeMirror-foldgutter");
        if (config.options[cmv].codemirror.lineNumbers) config.options[cmv].codemirror.gutters.push("CodeMirror-linenumbers");
        if (config.options[cmv].codemirror.preferredLineLength > 0) {
          config.options[cmv].codemirror.rulers = [{
            "color": "rgba(125, 125, 125, 0.3)",
            "column": config.options[cmv].codemirror.preferredLineLength
          }];
        }
        /*  */
        if (config.options[cmv].codemirror.matchHighlighter) {
          let matchHighlighterOptions = {"annotateScrollbar": config.options[cmv].codemirror.annotateScrollbar};
          if (config.options[cmv].codemirror.matchHighlighterWhenSelected === false) matchHighlighterOptions["showToken"] = /\w/;
          config.options[cmv].codemirror.highlightSelectionMatches = matchHighlighterOptions;
        }
        /*  */
        if (path.indexOf("untitled") !== 0) {
          await config.store("tabs", {
            "fullPath": path
          });
        }
        /*  */
        if (config.editor.v5.codemirror[path] === undefined) {
          config.editor.v5.textarea[path] = document.createElement("textarea");
          config.elements.container.appendChild(config.editor.v5.textarea[path]);
          config.editor.v5.textarea[path].setAttribute("class", "editor");
          /*  */
          let _mode = mode ? null : CodeMirror.findModeByFileName(name);
          let _options = config.options[cmv].codemirror;
          let _mime = _mode ? _mode.mime : null;
          /*  */
          _options.mode = mode ? mode : (_mime ? _mime : config.options[cmv].codemirror.mode);
          config.editor.v5.codemirror[path] = CodeMirror.fromTextArea(config.editor.v5.textarea[path], _options);
          config.editor.v5.codemirror[path].setSize(width, "calc(100vh - " + offset.h + "px)");
          config.editor.v5.codemirror[path].fileType = _options.mode;
          config.editor.v5.codemirror[path].setValue(data);
          config.editor.v5.codemirror[path].path = path;
          config.editor.v5.codemirror[path].data = data;
          config.editor.v5.codemirror[path].id = name;
          config.editor.v5.codemirror[path].focus();
          /*  */
          config.editor.v5.activate.codemirror();
          config.editor.v5.codemirror[path].doc.clearHistory();
          for (let id in config.editor.v5.UI) config.editor.v5.UI[id].style.display = "none";
          config.editor.v5.UI[path] = config.editor.v5.codemirror[path].getWrapperElement();
          /*  */
					config.custom.style.textContent = ".CodeMirror-code > div {0 4px}";
          config.editor.v5.codemirror[path].on("cursorActivity", config.listeners.cursor.add);
          config.editor.v5.codemirror[path].on("renderLine", config.listeners.render.line);
          config.editor.v5.codemirror[path].on("change", config.listeners.changed.add);
          config.editor.v5.codemirror[path].on("keyup", function (editor, event) {
            if (config.options[cmv].codemirror.autoComplete === false) return;
            if (editor) {
              let cursor = editor.getDoc().getCursor();
              let token = editor.getTokenAt(cursor);
              let flag_1 = config.options[cmv].codemirror.autoComplete;
              let flag_2 = token.type || token.string === "." || token.string === " " || token.string === ">";
              let flag_3 = config.options[cmv].excluded.intelliSense.trigger.keys[(event.keyCode || event.which).toString()] === undefined;
              if (flag_1 && flag_2 && flag_3) CodeMirror.commands.autocomplete(editor, null, {"completeSingle": false});
            }
          });
        } else {
          config.editor.v5.codemirror[path].setSize(width, "calc(100vh - " + offset.h + "px)");
          for (let id in config.options[cmv].codemirror) {
            if (id !== "mode") {
              let value = config.options[cmv].codemirror[id];
              config.editor.v5.codemirror[path].setOption(id, value);
            } else {/* ToDo */}
          }
        }
        /*  */
        config.editor.v5.style.codemirror(config.editor.v5.UI[path]);
      }
    }
  }
};
