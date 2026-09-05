config.editor.v6 = {
  "UI": {},
  "textarea": {},
  "codemirror": {},
  "loading": {},
  "make": {
    "name": function (id) {
      const ID = id.charAt(0).toUpperCase() + id.slice(1);
      const words = ID.match(/[A-Z][a-z]+|[0-9]+/g);
      return words && words.length ? words.join(' ') : ID;
    }
  },
  "themes": {
    "default": [
      CodeMirror6.EditorView.theme({
        "&": {"backgroundColor": "#ffffff", "color": "#000000"},
        ".cm-gutters": {"backgroundColor": "#ffffff", "color": "#808080", "border": "none"},
        ".cm-activeLine": {"backgroundColor": "rgba(0, 0, 0, 0.045)"},
        ".cm-activeLineGutter": {"backgroundColor": "rgba(0, 0, 0, 0.045)"},
        ".cm-selectionBackground": {"backgroundColor": "#add6ff !important"},
        "&.cm-focused .cm-selectionBackground": {"backgroundColor": "#add6ff"},
        ".cm-cursor": {"borderLeftColor": "#000000"}
      })
    ],
    "dark": [
      CodeMirror6.EditorView.theme({
        "&": {"backgroundColor": "#282c34", "color": "#abb2bf"},
        ".cm-gutters": {"backgroundColor": "#282c34", "color": "#7f848e", "border": "none"},
        ".cm-activeLine": {"backgroundColor": "rgba(153,187,255,0.06)"},
        ".cm-activeLineGutter": {"backgroundColor": "rgba(153,187,255,0.08)"},
        ".cm-selectionBackground": {"backgroundColor": "#264f78 !important"},
        "&.cm-focused .cm-selectionBackground": {"backgroundColor": "#264f78"},
        ".cm-cursor": {"borderLeftColor": "#528bff"}
      }, {"dark": true}),
      CodeMirror6.syntaxHighlighting(CodeMirror6.HighlightStyle.define([
        {"tag": CodeMirror6.tags.keyword, "color": "#c678dd"},
        {"tag": [CodeMirror6.tags.controlKeyword, CodeMirror6.tags.moduleKeyword], "color": "#c678dd"},
        {"tag": [CodeMirror6.tags.name, CodeMirror6.tags.deleted], "color": "#e06c75"},
        {"tag": CodeMirror6.tags.propertyName, "color": "#d19a66"},
        {"tag": [CodeMirror6.tags.processingInstruction, CodeMirror6.tags.string, CodeMirror6.tags.inserted, CodeMirror6.tags.special(CodeMirror6.tags.variableName)], "color": "#98c379"},
        {"tag": [CodeMirror6.tags.function(CodeMirror6.tags.variableName), CodeMirror6.tags.labelName], "color": "#61afef"},
        {"tag": [CodeMirror6.tags.color, CodeMirror6.tags.constant(CodeMirror6.tags.name), CodeMirror6.tags.standard(CodeMirror6.tags.name)], "color": "#d19a66"},
        {"tag": [CodeMirror6.tags.definition(CodeMirror6.tags.name), CodeMirror6.tags.separator], "color": "#abb2bf"},
        {"tag": [CodeMirror6.tags.typeName, CodeMirror6.tags.className, CodeMirror6.tags.number, CodeMirror6.tags.changed, CodeMirror6.tags.annotation, CodeMirror6.tags.self, CodeMirror6.tags.namespace], "color": "#e5c07b"},
        {"tag": [CodeMirror6.tags.operator, CodeMirror6.tags.operatorKeyword], "color": "#56b6c2"},
        {"tag": [CodeMirror6.tags.url, CodeMirror6.tags.escape, CodeMirror6.tags.regexp, CodeMirror6.tags.link, CodeMirror6.tags.special(CodeMirror6.tags.string)], "color": "#56b6c2"},
        {"tag": [CodeMirror6.tags.meta, CodeMirror6.tags.comment], "color": "#7f848e"},
        {"tag": CodeMirror6.tags.strong, "fontWeight": "bold"},
        {"tag": CodeMirror6.tags.emphasis, "fontStyle": "italic"},
        {"tag": CodeMirror6.tags.strikethrough, "textDecoration": "line-through"},
        {"tag": CodeMirror6.tags.link, "color": "#61afef", "textDecoration": "underline"},
        {"tag": CodeMirror6.tags.heading, "fontWeight": "bold", "color": "#e06c75"},
        {"tag": [CodeMirror6.tags.atom, CodeMirror6.tags.bool, CodeMirror6.tags.special(CodeMirror6.tags.variableName)], "color": "#d19a66"},
        {"tag": CodeMirror6.tags.tagName, "color": "#e06c75"},
        {"tag": CodeMirror6.tags.invalid, "color": "#ffffff"}
      ]))
    ]
  },
  "extensions": function () {
    let cmv = config.storage.local["cmv"];
    let o = config.options[cmv].codemirror;
    let arr = [];
    /*  */
    if (o.theme === "dark") arr.push(...config.editor.v6.themes.dark);
    else arr.push(...config.editor.v6.themes.default, CodeMirror6.syntaxHighlighting(CodeMirror6.defaultHighlightStyle, {"fallback": true}));
    if (o.lineNumbers) arr.push(CodeMirror6.lineNumbers());
    if (o.styleActiveLine) {
      arr.push(CodeMirror6.highlightActiveLine());
      if (o.lineNumbers || o.foldGutter) arr.push(CodeMirror6.highlightActiveLineGutter());
    }
    /*  */
    if (o.foldGutter) arr.push(CodeMirror6.foldGutter());
    if (o.lineWrapping) arr.push(CodeMirror6.EditorView.lineWrapping);
    if (o.matchBrackets !== false) arr.push(CodeMirror6.bracketMatching());
    if (o.autoCloseBrackets) arr.push(CodeMirror6.closeBrackets());
    /*  */
    if ((o.direction || "ltr") === "rtl") arr.push(CodeMirror6.EditorView.perLineTextDirection.of(true));
    if (o.matchHighlighter) {
      let config_ = {"annotateScrollbar": o.annotateScrollbar !== false};
      if (o.matchHighlighterWhenSelected === false) config_["showToken"] = /\w/;
      arr.push(CodeMirror6.highlightSelectionMatches(config_));
    }
    /*  */
    arr.push(CodeMirror6.highlightSpecialChars(), CodeMirror6.history(), CodeMirror6.drawSelection(), CodeMirror6.dropCursor());
    arr.push(CodeMirror6.EditorState.allowMultipleSelections.of(true));
    arr.push(CodeMirror6.indentOnInput());
    arr.push(CodeMirror6.EditorState.tabSize.of(o.tabSize));
    arr.push(CodeMirror6.indentUnit.of(o.indentWithTabs ? "\t" : Array((parseInt(o.indentUnit) || 2) + 1).join(" ")));
    arr.push(CodeMirror6.rectangularSelection());
    arr.push(CodeMirror6.autocompletion({"activateOnTyping": o.autoComplete !== false}));
    arr.push(CodeMirror6.EditorView.contentAttributes.of({
      "spellcheck": o.spellcheck ? "true" : "false",
      "autocorrect": o.autocorrect ? "on" : "off",
      "autocapitalize": o.autocapitalize ? "on" : "off"
    }));
    /*  */
    arr.push(CodeMirror6.EditorState.readOnly.of(!!o.readOnly));
    arr.push(CodeMirror6.EditorView.editable.of(!o.readOnly));
    /*  */
    arr.push(CodeMirror6.keymap.of([CodeMirror6.indentWithTab].concat(
      CodeMirror6.closeBracketsKeymap,
      CodeMirror6.defaultKeymap,
      CodeMirror6.searchKeymap,
      CodeMirror6.historyKeymap,
      CodeMirror6.foldKeymap,
      CodeMirror6.completionKeymap,
      CodeMirror6.lintKeymap
    )));
    /*  */
    return arr;
  },
  "signature": function () {
    let cmv = config.storage.local["cmv"];
    let o = config.options[cmv].codemirror;
    let keys = [
      "theme",
      "tabSize",
      "indentUnit",
      "indentWithTabs",
      "lineNumbers",
      "foldGutter",
      "lineWrapping",
      "matchBrackets",
      "autoCloseBrackets",
      "autoComplete",
      "readOnly",
      "styleActiveLine",
      "matchHighlighter",
      "direction"
    ];
    /*  */
    let tmp = {};
    for (let i = 0; i < keys.length; i++) tmp[keys[i]] = o[keys[i]];
    return JSON.stringify(tmp);
  },
  "language": async function (name, fileType) {
    let desc = null;
    if (fileType) {
      let value = String(fileType);
      if (value.indexOf('/') === -1) {
        desc = CodeMirror6.languages.find(function (d) {return d.name.toLowerCase() === value.toLowerCase()});
      } else {
        desc = CodeMirror6.findModeByMime(value);
      }
    }
    /*  */
    if (!desc) desc = CodeMirror6.findModeByFileName(name);
    /*  */
    let support = null;
    try {
      if (desc) support = await desc.load();
    } catch (e) {}
    /*  */
    return {"desc": desc, "support": support};
  },
  "listener": function (path) {
    return CodeMirror6.EditorView.updateListener.of(function (u) {
      let adapter = config.editor.v6.codemirror[path];
      if (!u || !adapter) return;
      if (u.docChanged) config.listeners.changed.add(adapter, u);
      if (u.docChanged || u.selectionSet) config.listeners.cursor.add(adapter);
      /*  */
      if ((u.selectionSet || u.viewportChanged || u.geometryChanged) && !adapter.__healing) {
        let main = u.state.selection.main;
        if (!main.empty && !u.view.dom.querySelector(".cm-selectionBackground")) {
          adapter.__healing = true;
          /* deferred: never mutate the DOM/scroll state from inside the update cycle */
          window.setTimeout(function () {
            if (!adapter.view) {
              adapter.__healing = false;
              return;
            }
            /*  */
            adapter.view.requestMeasure();
            let scroller = adapter.view.scrollDOM;
            let top = scroller.scrollTop;
            scroller.scrollTop = top + 1;
            scroller.scrollTop = top;
            adapter.__healing = false;
          }, 50);
        }
      }
    });
  },
  "wrap": function (view, meta) {
    let adapter = this;
    let rebuildListeners = [];
    /*  */
    let posFrom = function (p) {
      if (p && (typeof p.ch === "number" || typeof p.char === "number")) {
        let doc = view.state.doc;
        let lineNo = (typeof p.line === "number" ? p.line : 0) + 1;
        let lineObj = doc.line(Math.min(Math.max(lineNo, 1), doc.lines));
        let ch = typeof p.ch === "number" ? p.ch : p.char;
        return Math.min(lineObj.from + Math.max(ch, 0), lineObj.to);
      }
      return typeof p === "number" ? Math.min(Math.max(p, 0), view.state.doc.length) : 0;
    };
    /*  */
    let posTo = function (offset) {
      let lineObj = view.state.doc.lineAt(offset);
      return {"line": lineObj.number - 1, "ch": offset - lineObj.from};
    };
    /*  */
    adapter.view = view;
    adapter.support = meta.support || null;
    adapter.id = meta.id;
    adapter.path = meta.path;
    adapter.data = meta.data;
    adapter.fileType = meta.fileType;
    adapter.mode = meta.fileType;
    adapter.signature = meta.signature;
    adapter.refresh = function () {view.requestMeasure()};
    adapter.focus = function () {view.focus()};
    adapter.getValue = function () {return view.state.doc.toString()};
    adapter.setValue = function (val) {
      view.dispatch({"changes": {"from": 0, "to": view.state.doc.length, "insert": val || ''}});
    };
    /*  */
    adapter.setSize = function (w, h) {
      view.dom.style.width = w;
      view.dom.style.height = h;
      view.requestMeasure();
    };
    /*  */
    adapter.getWrapperElement = function () {return view.dom};
    adapter.getOption = function (id) {return id === "tabSize" ? view.state.tabSize : undefined};
    adapter.defaultCharWidth = function () {
      let pos = Math.min(1, view.state.doc.length);
      let a = view.coordsAtPos(pos);
      let b = view.coordsAtPos(Math.min(view.state.doc.length, pos + 1));
      return a && b && b.left > a.left ? b.left - a.left : 7;
    };
    /*  */
    adapter.getCursor = function (head) {
      let main = view.state.selection.main;
      return posTo(head === true ? main.anchor : main.head);
    };
    /*  */
    adapter.getSelection = function () {
      let main = view.state.selection.main;
      return view.state.sliceDoc(main.from, main.to);
    };
    /*  */
    adapter.getScrollInfo = function () {
      return {
        "top": view.scrollDOM.scrollTop,
        "left": view.scrollDOM.scrollLeft,
        "width": view.scrollDOM.scrollWidth,
        "height": view.scrollDOM.scrollHeight,
        "clientWidth": view.scrollDOM.clientWidth,
        "clientHeight": view.scrollDOM.clientHeight
      };
    };
    /*  */
    let finitePos = function (p) {
      let target = posFrom(p);
      return Number.isFinite(target) ? target : null;
    };
    /*  */
    adapter.setCursor = function (pos) {
      let target = finitePos(pos);
      if (target === null) return;
      view.dispatch({"selection": target, "scrollIntoView": true});
    };
    /*  */
    adapter.setSelection = function (start, end) {
      let a = finitePos(start);
      let b = finitePos(end);
      if (a === null || b === null) return;
      view.dispatch({"selection": {"anchor": a, "head": b}, "scrollIntoView": true});
    };
    /*  */
    adapter.scrollIntoView = function (pos, margin) {
      let target = finitePos(pos);
      if (target === null) return;
      view.dispatch({"effects": CodeMirror6.EditorView.scrollIntoView(target, {"y": "nearest", "x": "nearest"})});
    };
    /*  */
    adapter.on = function () {};
    adapter.doc = {
      "clearHistory": function () {}
    };
    /*  */
    adapter.rebuild = function () {
      let parent = view.dom.parentNode;
      if (!parent) return;
      let sel = view.state.selection.main;
      let width = view.dom.style.width;
      let height = view.dom.style.height;
      /*  */
      let extensions = [config.editor.v6.listener(adapter.path)].concat(config.editor.v6.extensions());
      if (adapter.support) extensions.push(adapter.support.extension);
      /*  */
      let next = new CodeMirror6.EditorView({
        "state": CodeMirror6.EditorState.create({
          "doc": view.state.doc.toString(),
          "selection": {"anchor": sel.anchor, "head": sel.head},
          "extensions": extensions
        }),
        "parent": parent
      });
      /*  */
      next.dom.style.width = width;
      next.dom.style.height = height;
      if (view.dom.hasAttribute("hidden")) next.dom.setAttribute("hidden", "");
      parent.insertBefore(next.dom, view.dom);
      view.destroy();
      /*  */
      view = next;
      adapter.view = next;
      config.editor.v6.UI[adapter.path] = next.dom;
    };
    /*  */
    return adapter;
  },
  "focus": {
    "codemirror": function (o) {
      let path = o ? o.fullPath || o.fileName : config.current.path || config.storage.local.active;
      /*  */
      if (config.editor.v6.codemirror[path]) {
        for (let id in config.editor.v6.UI) config.editor.v6.UI[id].setAttribute("hidden", "");
        config.editor.v6.UI[path].removeAttribute("hidden");
        config.editor.v6.codemirror[path].refresh();
        config.editor.v6.codemirror[path].focus();
        config.editor.v6.activate.codemirror();
      } else {
        return config.editor.v6.render.codemirror(o);
      }
    }
  },
  "update": {
    "codemirror": function () {
      for (let id in config.editor.v6.codemirror) {
        let target = config.editor.v6.codemirror[id];
        target.setSize(target.view.dom.style.width, target.view.dom.style.height);
        let signature = config.editor.v6.signature();
        if (target.signature !== signature) {
          target.signature = signature;
          target.rebuild();
        }
      }
      /*  */
      config.editor.v6.focus.codemirror();
      /*  */
      let active = config.current.path || config.storage.local.active;
      if (config.editor.v6.UI[active]) {
        config.editor.v6.style.codemirror(config.editor.v6.UI[active]);
      }
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
        let base = `
          .info, div[class*="open-"], div[class="tabs"] *, div[class*="sidebar-"] * {color: ${sidebarFontColor}}
          body, html, option, .tabs, .footer, div[class*="sidebar-"] {background-color: ${sidebarBackgroundColor}}
          .cm-editor {font-size: ${config.options[cmv].codemirror.fontSize}; line-height: ${config.options[cmv].codemirror.lineHeight}}
          /* the base theme pins line-height on the scroller - override it there or the option has no effect */
          .cm-editor .cm-scroller, .cm-editor .cm-content {line-height: ${config.options[cmv].codemirror.lineHeight}}
          /* cm6 derives its base text direction from computed css on the content element */
          .cm-editor .cm-content {direction: ${config.options[cmv].codemirror.direction === "rtl" ? "rtl" : "ltr"}}
        `;
        /*  */
        if (config.options[cmv].codemirror.matchHighlighter) {
          base += `
            .cm-selectionMatch, .cm-selectionMatch-background {background-color: ${config.options[cmv].codemirror.matchHighlighterColor}}
          `;
        }
        /*  */
        config.custom.style.textContent = base;
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
                  if (entry.picker) config.session.idb.put(entry.fullPath, entry.picker);
                  config.readFile(entry);
                } else {
                  config.directories[entry.fullPath] = entry;
                  if (entry.picker) config.session.idb.put(entry.fullPath, entry.picker);
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
        let path = config.current.path || config.storage.local.active;
        let table = document.getElementById("sidebar-table-for-item-" + path);
        if (table) {
          /* expand every ancestor folder so the active file is visible in the tree */
          let folder = table.closest("details");
          while (folder) {
            folder.setAttribute("open", "");
            folder = folder.parentElement ? folder.parentElement.closest("details") : null;
          }
          /*  */
          let context = document.documentElement.getAttribute("context");
          if (context !== "webapp") {
            table.scrollIntoView({"behavior": "smooth"});
          }
        }
      }, 300);
      /*  */
			window.setTimeout(function () {
        let path = config.current.path || config.storage.local.active;
        let codemirror = config.editor.v6.codemirror[path];
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
            try {
              config.listeners.update.info(cursor.pos);
              let height = window.getComputedStyle(config.editor.v6.UI[path]).height;
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
            } catch (e) {
              /* a stale stored cursor must never break the editor */
            }
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
          let removed = [id];
          let childNames = Object.keys(config.files).filter(function (name) {
            return config.files[name].fullPath.indexOf(id + '/') !== -1;
          });
          /*  */
          config.session.removeFromSession(removed.concat(childNames));
          /*  */
          childNames.forEach(function (name) {
            config.editor.v6.remove.codemirror(name, true, true);
          });
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
          if (config.editor.v6.UI[id]) {
            let target = config.editor.v6.codemirror[id];
            if (target && target.view) target.view.destroy();
            config.editor.v6.UI[id].remove();
          }
          if (config.editor.v6.textarea[id]) config.editor.v6.textarea[id].remove();
          if (parent.table.sidebar) parent.table.sidebar.removeAttribute("active");
          /*  */
          let tables = document.querySelectorAll("table[id*='sidebar-table-for-']");
          for (let i = 0; i < tables.length; i++) tables[i].removeAttribute("active");
          /*  */
          delete config.editor.v6.UI[id];
          delete config.editor.v6.textarea[id];
          delete config.editor.v6.loading[id];
          delete config.editor.v6.codemirror[id];
          /*  */
          config.remove("tabs", id, function () {
            config.remove("files", id, function () {
              config.remove("cursor", id, function () {
                if (Object.keys(config.editor.v6.codemirror).length === 0 && config.storage.local["closeEmpty"] !== true) {
                  document.getElementById("new").click();
                }
              });
            });
          });
          /*  */
          if (trusted) {
            /* purged from the session snapshot, otherwise restore brings it back */
            config.session.removeFromSession([id]);
            config.session.idb.del(id);
            delete config.files[id];
            if (parent.table.sidebar) parent.table.sidebar.remove();
          }
        } else {
          config.listeners.changed.remove(id);
          let result = window.confirm(id + " is modified, do you want to save the changes before closing?");
          if (result) {
            document.getElementById("save").click();
          } else {
            config.editor.v6.remove.codemirror(id, true);
          }
        }
      }
    }
  },
  "render": {
    "sequence": 0,
    "codemirror": async function (o) {
      if (!o) return;
      let sequence = ++config.editor.v6.render.sequence;
      let stale = function () {return sequence !== config.editor.v6.render.sequence};
      let cmv = config.storage.local["cmv"];
      let width = "100%";
      let data = typeof o.result === "string" ? o.result : '';
      let name = o.fileName;
      let path = o.fullPath || name;
      /*  */
      let offset = {};
      offset.l = config.elements.sidebar.left.getAttribute("state") === "open" ? parseInt(window.getComputedStyle(config.elements.sidebar.left).width) : 0;
      offset.r = config.elements.sidebar.right.getAttribute("state") === "open" ? parseInt(window.getComputedStyle(config.elements.sidebar.right).width) : 0;
      /*  */
      offset.w = offset.l + offset.r;
      offset.h = parseInt(window.getComputedStyle(config.elements.tabs).height) + 1;
      width = navigator.userAgent.indexOf("Firefox") !== -1 ? "calc(100vw - " + offset.w + "px)" : "100%";
      config.elements.tabs.setAttribute("mode", config.options[cmv].codemirror.largeTabBar ? "large" : "small");
      /*  */
      let existing = config.editor.v6.codemirror[path];
      if (existing === undefined) {
        if (config.editor.v6.loading[path]) return;
        config.editor.v6.loading[path] = true;
        /*  */
        try {
          if (path.indexOf("untitled") !== 0) {
            await config.store("tabs", {
              "fullPath": path
            });
          }
          /*  */
          if (stale()) return;
          /*  */
          let lang = await config.editor.v6.language(name, o.fileType);
          let fileType = lang.desc ? lang.desc.name : (o.fileType || '');
          /*  */
          if (stale()) return;
          /*  */
          let view = new CodeMirror6.EditorView({
            "state": CodeMirror6.EditorState.create({
              "doc": data,
              "extensions": [config.editor.v6.listener(path)].concat(config.editor.v6.extensions(), lang.support ? [lang.support.extension] : [])
            }),
            "parent": config.elements.container
          });
          /*  */
          view.dom.style.width = width;
          view.dom.style.height = "calc(100vh - " + offset.h + "px)";
          /*  */
          let meta = {
            "id": name,
            "path": path,
            "data": data,
            "fileType": fileType,
            "support": lang.support,
            "signature": config.editor.v6.signature()
          };
          config.editor.v6.codemirror[path] = config.editor.v6.wrap.call({}, view, meta);
          /*  */
          if (stale()) return;
          /*  */
          config.editor.v6.codemirror[path].focus();
          config.editor.v6.activate.codemirror();
          for (let id in config.editor.v6.UI) config.editor.v6.UI[id].setAttribute("hidden", "");
          config.editor.v6.UI[path] = view.dom;
          /*  */
          window.setTimeout(function () {view.requestMeasure()}, 60);
          window.setTimeout(function () {view.requestMeasure()}, 350);
        } finally {
          delete config.editor.v6.loading[path];
        }
      } else {
        existing.setSize(width, "calc(100vh - " + offset.h + "px)");
        let signature = config.editor.v6.signature();
        if (existing.signature !== signature) {
          existing.signature = signature;
          existing.rebuild();
        }
        /*  */
        if (stale()) return;
        for (let id in config.editor.v6.UI) config.editor.v6.UI[id].setAttribute("hidden", "");
        config.editor.v6.UI[path].removeAttribute("hidden");
      }
      /*  */
      if (stale()) return;
      config.editor.v6.style.codemirror(config.editor.v6.UI[path]);
    }
  }
};

