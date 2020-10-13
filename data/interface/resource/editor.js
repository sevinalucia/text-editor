config.editor = {
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
      var path = o ? o.fullPath || o.fileName : config.storage.object.active;
      /*  */
      if (config.editor.codemirror[path]) {
        for (var id in config.editor.UI) config.editor.UI[id].style.display = "none";
        config.editor.UI[path].style.display = "block";
        config.editor.codemirror[path].refresh();
        config.editor.codemirror[path].focus();
        config.editor.activate.codemirror();
      } else config.editor.render.codemirror(o);
    }
  },
  "update": {
    "codemirror": function () {
      for (var id in config.editor.codemirror) {
        var target = config.editor.codemirror[id];
        config.editor.render.codemirror({
          "fileName": target.id,
          "fileType": target.mode,
          "fullPath": target.path,
          "result": target.getValue()
        });
      }
      /*  */
      config.editor.focus.codemirror();
    }
  },
  "style": {
    "codemirror": function (editor) {
      if (editor) {
        var color = window.getComputedStyle(editor).color;
        var userdefined = config.options.codemirror.theme === "default";
        var backgroundColor = window.getComputedStyle(editor).backgroundColor;
        var sidebarFontColor = userdefined ? config.options.codemirror.sidebarFontColor : color;
        var sidebarBackgroundColor = userdefined ? config.options.codemirror.sidebarBackgroundColor : backgroundColor;
        /*  */
        var flag_1 = config.color.check(sidebarBackgroundColor) === "light";
        var flag_2 = config.options.codemirror.changeAppColorsWhenThemeIsChanged === false;
        /*  */
        if (flag_1 || flag_2) {
          sidebarFontColor = config.options.codemirror.sidebarFontColor;
          sidebarBackgroundColor = config.options.codemirror.sidebarBackgroundColor;
        }
        /*  */
        config.custom.style.textContent = `
          .info, div[class*="open-"], div[class="tabs"] *, div[class*="sidebar-"] * {color: ${sidebarFontColor}}
          body, html, option, .tabs, .footer, div[class*="sidebar-"] {background-color: ${sidebarBackgroundColor}}
          .CodeMirror {font-size: ${config.options.codemirror.fontSize}; line-height: ${config.options.codemirror.lineHeight}}
        `;
        /*  */
        if (config.options.codemirror.matchHighlighter) {
          config.custom.style.textContent = `
            .info, div[class*="open-"], div[class="tabs"] *, div[class*="sidebar-"] * {color: ${sidebarFontColor}}
            body, html, option, .tabs, .footer, div[class*="sidebar-"] {background-color: ${sidebarBackgroundColor}}
            .CodeMirror {font-size: ${config.options.codemirror.fontSize}; line-height: ${config.options.codemirror.lineHeight}}
            .cm-matchhighlight, .CodeMirror-selection-highlight-scrollbar {background-color: ${config.options.codemirror.matchHighlighterColor}}
          `;
        }
      }
    }
  },
  "create": {
    "codemirror": function (o, callback) {
      var container = config.elements.sidebar.left.querySelector(".files-container");
      if (!container) {
        container = document.createElement("div");
        config.elements.sidebar.left.appendChild(container);
        container.setAttribute("class", "files-container noscrollbar");
        container.addEventListener("dragover", function (e) {e.preventDefault()});
        container.addEventListener("drop", async function (e) {
          e.preventDefault();
          /*  */
          var entries = [];
          var items = e.dataTransfer.items;
          for (var item of items) {
            if (item.kind === "file") {
              var picker = null, entry = null;
              if (config.support.fileio.new) {
                picker = await item.getAsFileSystemHandle();
                var status = await picker.requestPermission({"mode": "readwrite"});
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
          for (var i = 0; i < entries.length; i++) {
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
      var table = {};
      table.tabs = document.querySelectorAll("table[id*='tabs-table-for-']");
      table.sidebar = document.querySelectorAll("table[id*='sidebar-table-for-']");
      for (var i = 0; i < table.tabs.length; i++) table.tabs[i].removeAttribute("active");
      for (var i = 0; i < table.sidebar.length; i++) table.sidebar[i].removeAttribute("active");
      /*  */
      window.setTimeout(function () {
        var path = config.storage.object.active;
        var table = document.getElementById("sidebar-table-for-item-" + path);
        if (table) table.scrollIntoView({"behavior": "smooth"});
      }, 300);
      /*  */
			window.setTimeout(function () {
        var path = config.storage.object.active;
        var codemirror = config.editor.codemirror[path];
        /*  */
        var select = config.elements.sidebar.right.querySelector("select[id='mode']");
        var input = config.elements.sidebar.right.querySelector("input[id='mode']");
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
          var cursor = config.storage.object.cursor[path];
          if (cursor && cursor.pos) {
						config.listeners.update.info(cursor.pos);
            var height = window.getComputedStyle(config.editor.UI[path]).height;
            if (height) {
              var offset = parseInt(height) / 2;
              if (offset === Number(offset)) {
                codemirror.scrollIntoView({"line": cursor.pos.line, "char": cursor.pos.ch}, offset);
              }
            }
            /*  */
            if (cursor.selection) {
              if (cursor.start && cursor.end) {
                var flag_1 = cursor.start.ch !== cursor.end.ch;
                var flag_2 = cursor.start.line !== cursor.end.line;
                if (flag_1 || flag_2) {
                  var end = {"line": cursor.end.line, "ch": cursor.end.ch};
                  var start = {"line": cursor.start.line, "ch": cursor.start.ch};
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
      var parent = {"table": {}};
      parent.table.tabs = document.getElementById("tabs-table-for-item-" + id);
      parent.table.sidebar = document.getElementById("sidebar-table-for-item-" + id);
      parent.table.directory = document.getElementById("sidebar-table-for-directory-" + id);
      /*  */
      if (config.directories[id] || parent.table.directory) {
        if (parent.table.directory) {
					if (config.listeners.changed.check.directory(id)) return;
          /*  */
          for (var name in config.files) {
            if (config.files[name].fullPath.indexOf(id + '/') !== -1) {
              config.editor.remove.codemirror(name, true);
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
        var changed = config.listeners.changed.check.item(id);
        if (force || changed === false) {
          if (parent.table.tabs) parent.table.tabs.remove();
          if (config.editor.UI[id]) config.editor.UI[id].remove();
          if (config.editor.textarea[id]) config.editor.textarea[id].remove();
          if (parent.table.sidebar) parent.table.sidebar.removeAttribute("active");
          /*  */
          var tables = document.querySelectorAll("table[id*='sidebar-table-for-']");
          for (var i = 0; i < tables.length; i++) tables[i].removeAttribute("active");
          /*  */
          delete config.editor.UI[id];
          delete config.editor.textarea[id];
          delete config.editor.codemirror[id];
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
          var result = window.confirm(name + " is modified, do you want to save the changes before closing?");
          if (result) {
            document.getElementById("save").click();
          } else {
            config.editor.remove.codemirror(id, true);
          }
        }
      }
    }
  },
  "render": {
    "codemirror": async function (o) {
      if (o) {
        var offset = {};
        var width = "100%";
        var data = o.result;
        var name = o.fileName;
        var update = o.update;
        var mode = o.fileType;
        var path = o.fullPath || name;
        /*  */
        offset.l = config.elements.sidebar.left.getAttribute("state") === "open" ? parseInt(window.getComputedStyle(config.elements.sidebar.left).width) : 0;
        offset.r = config.elements.sidebar.right.getAttribute("state") === "open" ? parseInt(window.getComputedStyle(config.elements.sidebar.right).width) : 0;
        /*  */
        offset.w = offset.l + offset.r;
        offset.h = parseInt(window.getComputedStyle(config.elements.tabs).height) + 1;
        width = navigator.userAgent.indexOf("Firefox") !== -1 ? "calc(100vw - " + offset.w + "px)" : "100%";
        config.elements.tabs.setAttribute("mode", config.options.codemirror.largeTabBar ? "large" : "small");
        /*  */
        config.options.codemirror.gutters = [];
        config.options.codemirror.extraKeys = {};
        config.options.codemirror.extraKeys["Alt-F"] = "findPersistent";
        config.options.codemirror.matchTags = {"bothTags": config.options.codemirror.matchTag};
        if (config.options.codemirror.lint) config.options.codemirror.gutters.push("CodeMirror-lint-markers");
        if (config.options.codemirror.foldGutter) config.options.codemirror.gutters.push("CodeMirror-foldgutter");
        if (config.options.codemirror.lineNumbers) config.options.codemirror.gutters.push("CodeMirror-linenumbers");
        if (config.options.codemirror.preferredLineLength > 0) {
          config.options.codemirror.rulers = [{
            "color": "rgba(125, 125, 125, 0.3)",
            "column": config.options.codemirror.preferredLineLength
          }];
        }
        /*  */
        if (config.options.codemirror.matchHighlighter) {
          var matchHighlighterOptions = {"annotateScrollbar": config.options.codemirror.annotateScrollbar};
          if (config.options.codemirror.matchHighlighterWhenSelected === false) matchHighlighterOptions["showToken"] = /\w/;
          config.options.codemirror.highlightSelectionMatches = matchHighlighterOptions;
        }
        /*  */
        if (path.indexOf("untitled") !== 0) await config.store("tabs", {"fullPath": path});
        /*  */
        if (config.editor.codemirror[path] === undefined) {
          config.editor.textarea[path] = document.createElement("textarea");
          config.elements.container.appendChild(config.editor.textarea[path]);
          config.editor.textarea[path].setAttribute("class", "editor");
          /*  */
          var _mode = mode ? null : CodeMirror.findModeByFileName(name);
          var _options = config.options.codemirror;
          var _mime = _mode ? _mode.mime : null;
          /*  */
          _options.mode = mode ? mode : (_mime ? _mime : config.options.codemirror.mode);
          config.editor.codemirror[path] = CodeMirror.fromTextArea(config.editor.textarea[path], _options);
          config.editor.codemirror[path].setSize(width, "calc(100vh - " + offset.h + "px)");
          config.editor.codemirror[path].fileType = _options.mode;
          config.editor.codemirror[path].setValue(data);
          config.editor.codemirror[path].path = path;
          config.editor.codemirror[path].data = data;
          config.editor.codemirror[path].id = name;
          config.editor.codemirror[path].focus();
          /*  */
          config.editor.activate.codemirror();
          config.editor.codemirror[path].doc.clearHistory();
          for (var id in config.editor.UI) config.editor.UI[id].style.display = "none";
          config.editor.UI[path] = config.editor.codemirror[path].getWrapperElement();
          /*  */
					config.custom.style.textContent = ".CodeMirror-code > div {0 4px}";
          config.editor.codemirror[path].on("cursorActivity", config.listeners.cursor.add);
          config.editor.codemirror[path].on("renderLine", config.listeners.render.line);
          config.editor.codemirror[path].on("change", config.listeners.changed.add);
          config.editor.codemirror[path].on("keyup", function (editor, event) {
            if (config.options.codemirror.autoComplete === false) return;
            if (editor) {
              var cursor = editor.getDoc().getCursor();
              var token = editor.getTokenAt(cursor);
              var flag_1 = config.options.codemirror.autoComplete;
              var flag_2 = token.type || token.string === "." || token.string === " " || token.string === ">";
              var flag_3 = config.excluded.intelliSense.trigger.keys[(event.keyCode || event.which).toString()] === undefined;
              if (flag_1 && flag_2 && flag_3) CodeMirror.commands.autocomplete(editor, null, {"completeSingle": false});
            }
          });
        } else {
          config.editor.codemirror[path].setSize(width, "calc(100vh - " + offset.h + "px)");
          for (var id in config.options.codemirror) {
            if (id !== "mode") {
              var value = config.options.codemirror[id]
              config.editor.codemirror[path].setOption(id, value);
            } else {/* ToDo */}
          }
        }
        /*  */
        config.editor.style.codemirror(config.editor.UI[path]);
      }
    }
  }
};
