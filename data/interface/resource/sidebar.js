config.sidebar = {
  "render": async function () {
    await new Promise((resolve, reject) => {
      let tr = null;
      let table = null;
      /*  */
      table = document.createElement("table");
      table.setAttribute("class", "options");
      config.elements.sidebar.right.appendChild(table); 
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.option("theme"));
      tr.appendChild(config.sidebar.add.column.select("theme"));
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.option("scrollbarStyle"));
      tr.appendChild(config.sidebar.add.column.select("scrollbarStyle"));
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.option("keyMap"));
      tr.appendChild(config.sidebar.add.column.select("keyMap"));
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.option("mode"));
      tr.appendChild(config.sidebar.add.column.select("mode"));
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.custom.cmv.option());
      tr.appendChild(config.sidebar.add.column.custom.cmv.select());
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.custom.session.option());
      tr.appendChild(config.sidebar.add.column.custom.session.checkbox());
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.custom.closeEmpty.option());
      tr.appendChild(config.sidebar.add.column.custom.closeEmpty.checkbox());
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.custom.autoSave.option());
      tr.appendChild(config.sidebar.add.column.custom.autoSave.checkbox());
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.custom.autoSave.interval.option());
      tr.appendChild(config.sidebar.add.column.custom.autoSave.interval.input());
      table.appendChild(tr);
      /*  */
      tr = document.createElement("tr");
      tr.setAttribute("class", "separator");
      tr.appendChild(document.createElement("td"));
      tr.appendChild(document.createElement("td"));
      table.appendChild(tr);
      /*  */
      const sorted = config.sort.object(config.options[config.storage.local["cmv"]].codemirror);
      for (let id in sorted) {
        let tr = document.createElement("tr");
        tr.appendChild(config.sidebar.add.column.option(id));
        tr.appendChild(config.sidebar.add.column.value(id));
        /*  */
        let unsupported = config.options[config.storage.local["cmv"]].unsupported;
        if (unsupported && unsupported.indexOf(id) !== -1) {
          let input = tr.querySelector("input");
          if (input) input.setAttribute("disabled", "");
          tr.setAttribute("unsupported", "");
          tr.setAttribute("title", "Not available with the CodeMirror 6 engine");
        }
        /*  */
        table.appendChild(tr);
      }
      /*  */
      table = document.createElement("table");
      table.setAttribute("class", "header");
      config.elements.sidebar.left.appendChild(table);
      for (let id in config.options[config.storage.local["cmv"]].editor) {
        let tr = document.createElement("tr");
        tr.appendChild(config.sidebar.add.column.button(id, true));
        table.appendChild(tr);
      }
      /*  */
      resolve();
    });
  },
  "reorder": function () {
    /*
      drag order was saved but never restored on relaunch - walk the stored
      id list and re-append each tab row, which rebuilds the bar order
    */
    let sorted = config.storage.local.sorted || [];
    for (let i = 0; i < sorted.length; i++) {
      let table = document.getElementById("tabs-table-for-item-" + sorted[i]);
      if (table && table.parentElement === config.elements.tabs) {
        config.elements.tabs.appendChild(table);
      }
    }
  },
  "tree": {
    "height": function (container) {
      /*
        the bottom toolbar is absolutely positioned inside the sidebar, so the
        file tree must stop above it whatever the button-table height is
      */
      let header = config.elements.sidebar.left.querySelector("table.header");
      if (container && header) {
        let reserve = Math.ceil(header.getBoundingClientRect().height) + 40;
        container.style.height = "calc(100% - " + reserve + "px)";
      }
      return container;
    }
  },
  "add": {
    "column": {
      "option": function (id) {
        let td = document.createElement("td");
        let label = document.createElement("label");
        /*  */
        label.textContent = config.editor[config.storage.local["cmv"]].make.name(id);
        td.setAttribute("rule", "name");
        label.setAttribute("for", id);
        td.appendChild(label);
        return td;
      },
      "close": function (id) {
        let td = document.createElement("td");
        let close = document.createElement("div");
        /*  */
        close.setAttribute("for", id);
        td.setAttribute("rule", "close");
        close.addEventListener("click", function (e) {
          let target = e.target.getAttribute("for");
          config.editor[config.storage.local["cmv"]].remove.codemirror(target, false, e.isTrusted);
        });
        td.appendChild(close);
        return td;
      },
      "file": function (id, path) {
        let td = document.createElement("td");
        let item = document.createElement("div");
        /*  */
        item.textContent = id;
        item.setAttribute("id", path);
        td.setAttribute("rule", "button");
        td.appendChild(item);
        return td;
      },
      "button": function (id, abstract) {
        let td = document.createElement("td");
        let fileio = document.createElement("div");
        /*  */
        fileio.setAttribute("id", id);
        td.setAttribute("rule", "button");
        fileio.addEventListener("click", config.fileio.action);
        if (abstract && config.sidebar.icons[id]) fileio.appendChild(config.sidebar.add.column.icon(id));
        fileio.appendChild(document.createTextNode(abstract ? config.editor[config.storage.local["cmv"]].make.name(id) : id));
        td.appendChild(fileio);
        return td;
      },
      "icon": function (id) {
        let spec = config.sidebar.icons[id] || {};
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        let list = Array.isArray(spec.d) ? spec.d : [spec.d];
        svg.setAttribute("viewBox", spec.vb || "0 0 24 24");
        for (let item of list) {
          let path = document.createElementNS("http://www.w3.org/2000/svg", "path");
          let data = typeof item === "string" ? item : item.d;
          let tf = (item.tf || spec.tf);
          if (tf) path.setAttribute("transform", tf);
          path.setAttribute("d", data);
          svg.appendChild(path);
        }
        return svg;
      },
      "select": function (id) {
        let td = document.createElement("td");
        let select = document.createElement("select");
        let items = config.options[config.storage.local["cmv"]][id];
        let sorted = config.sort.array(items);
        /*  */
        for (let i = 0; i < sorted.length; i++) {
          let option = document.createElement("option");
          option.setAttribute("value", sorted[i]);
          option.textContent = sorted[i];
          select.appendChild(option);
        }
        /*  */
        select.setAttribute("id", id);
        td.setAttribute("rule", "value");
        select.value = config.options[config.storage.local["cmv"]].codemirror[id];
        select.addEventListener("change", function (e) {
          let cmv = config.storage.local["cmv"];
          let options = config.options[cmv];
          let editor = config.editor[cmv];
          if (options === undefined || editor === undefined) return;
          /*  */
          let input = config.elements.sidebar.right.querySelector("input[id='mode']");
          if (id === "mode") {
            input.value = e.target.value;
            /*
              the select doubles as the default mode for new files and as the
              mode switch for the open file - both actions belong here
            */
            if (editor.apply && editor.apply.mode) editor.apply.mode(e.target.value);
          }
          options.codemirror[id] = e.target.value;
          /*  */
          editor.update.codemirror();
        });
        /*  */
        td.appendChild(select);
        /*  */
        return td;
      },
      "custom": {
        "closeEmpty": {
          "option": function () {
            let td = document.createElement("td");
            let label = document.createElement("label");
            /*  */
            td.setAttribute("rule", "name");
            label.setAttribute("for", "closeEmpty");
            label.textContent = "Allow Closing Empty File";
            label.setAttribute("title", "Allow closing the last empty file without opening a new one");
            td.appendChild(label);
            return td;
          },
          "checkbox": function () {
            let td = document.createElement("td");
            let label = document.createElement("label");
            let input = document.createElement("input");
            /*  */
            input.setAttribute("type", "checkbox");
            input.setAttribute("id", "closeEmpty");
            input.checked = config.storage.local["closeEmpty"] !== false;
            /*  */
            label.setAttribute("class", "checkbox");
            label.setAttribute("checked", config.storage.local["closeEmpty"] !== false);
            label.setAttribute("for", "closeEmpty");
            label.setAttribute("title", "Allow closing the last empty file without opening a new one");
            label.textContent = "✔";
            label.appendChild(input);
            /*  */
            input.addEventListener("change", function (e) {
              let checked = e.target.checked;
              label.setAttribute("checked", checked);
              /*
                explicit set - storage.write would work for false too (it
                only removes ''/null/undefined), but false reads clearer here
              */
              config.storage.local["closeEmpty"] = checked;
              chrome.storage.local.set({"closeEmpty": checked}, function () {});
            });
            /*  */
            td.setAttribute("rule", "value");
            td.appendChild(label);
            return td;
          }
        },
        "autoSave": {
          "option": function () {
            let td = document.createElement("td");
            let label = document.createElement("label");
            /*  */
            td.setAttribute("rule", "name");
            label.setAttribute("for", "autoSave");
            label.textContent = "Auto-Save";
            label.setAttribute("title", "Periodically save modified files (interval below); direct-disk in picker mode, session snapshot otherwise");
            td.appendChild(label);
            return td;
          },
          "checkbox": function () {
            let td = document.createElement("td");
            let label = document.createElement("label");
            let input = document.createElement("input");
            /*  */
            input.setAttribute("type", "checkbox");
            input.setAttribute("id", "autoSave");
            input.checked = config.storage.local["autoSave"] === true;
            /*  */
            label.setAttribute("class", "checkbox");
            label.setAttribute("checked", config.storage.local["autoSave"] === true);
            label.setAttribute("for", "autoSave");
            label.setAttribute("title", "Periodically save modified files (interval below)");
            label.textContent = "✔";
            label.appendChild(input);
            /*  */
            input.addEventListener("change", function (e) {
              let checked = e.target.checked;
              label.setAttribute("checked", checked);
              config.storage.local["autoSave"] = checked;
              chrome.storage.local.set({"autoSave": checked}, function () {});
              config.autosave.apply();
              if (checked) config.autosave.tick();
            });
            /*  */
            td.setAttribute("rule", "value");
            td.appendChild(label);
            return td;
          },
          "interval": {
            "option": function () {
              let td = document.createElement("td");
              let label = document.createElement("label");
              /*  */
              td.setAttribute("rule", "name");
              label.setAttribute("for", "autoSaveInterval");
              label.textContent = "Auto-Save Interval";
              label.setAttribute("title", "Seconds between auto-saves (minimum 5)");
              td.appendChild(label);
              return td;
            },
            "input": function () {
              let td = document.createElement("td");
              let input = document.createElement("input");
              /*  */
              input.setAttribute("type", "number");
              input.setAttribute("id", "autoSaveInterval");
              input.setAttribute("min", "5");
              input.value = config.storage.local["autoSaveInterval"];
              input.setAttribute("title", "Seconds between auto-saves (minimum 5)");
              /*  */
              input.addEventListener("change", function (e) {
                let value = Number(e.target.value);
                let valid = Number.isFinite(value) && value >= 5;
                input.value = valid ? value : 60;
                config.storage.write("autoSaveInterval", valid ? value : 60);
                config.autosave.apply();
              });
              /*  */
              td.setAttribute("rule", "value");
              td.appendChild(input);
              return td;
            }
          }
        },
        "session": {
          "option": function () {
            let td = document.createElement("td");
            let label = document.createElement("label");
            /*  */
            td.setAttribute("rule", "name");
            label.setAttribute("for", "session");
            label.textContent = "Restore Session";
            label.setAttribute("title", "Restore open files and folders when the editor reopens");
            td.appendChild(label);
            return td;
          },
          "checkbox": function () {
            let td = document.createElement("td");
            let label = document.createElement("label");
            let input = document.createElement("input");
            /*  */
            input.setAttribute("type", "checkbox");
            input.setAttribute("id", "session");
            input.checked = config.storage.local["session"] === true;
            /*  */
            label.setAttribute("class", "checkbox");
            label.setAttribute("checked", config.storage.local["session"] === true);
            label.setAttribute("for", "session");
            label.setAttribute("title", "Restore open files and folders when the editor reopens");
            label.textContent = "✔";
            label.appendChild(input);
            /*  */
            input.addEventListener("change", function (e) {
              let checked = e.target.checked;
              label.setAttribute("checked", checked);
              config.storage.write("session", checked);
              if (checked) {
                /*
                  removed files and edits made while off are gone on purpose -
                  re-enabling seeds a fresh snapshot from what is open now
                */
                config.session.capture();
              } else {
                /*
                  a stale snapshot would keep autosave tick and the session
                  save branch writing into an orphan key restore never reads
                */
                config.session.data = null;
                config.storage.write("session.data", null);
                config.session.dirty = false;
              }
            });
            /*  */
            td.setAttribute("rule", "value");
            td.appendChild(label);
            return td;
          }
        },
        "cmv": {
          "option": function () {
            let td = document.createElement("td");
            let label = document.createElement("label");
            label.textContent = "API Version";
            td.setAttribute("rule", "name");
            label.setAttribute("for", "cmv");
            td.appendChild(label);
            return td;
          },
          "select": function () {
            let items = [5, 6];
            let td = document.createElement("td");
            let select = document.createElement("select");
            let sorted = config.sort.array(items);
            /*  */
            for (let i = 0; i < sorted.length; i++) {
              let option = document.createElement("option");
              option.setAttribute("value", 'v' + sorted[i]);
              option.textContent = sorted[i] === 5 ? "CM 5 (Current)" : "CM 6 (Newer, Beta)";
              select.appendChild(option);
            }
            /*  */
            select.setAttribute("id", "cmv");
            td.setAttribute("rule", "value");
            select.value = config.storage.local["cmv"];
            select.addEventListener("change", function (e) {
              let value = e.target.value;
              e.target.value = config.storage.local["cmv"];
              /*  */
              if (value === config.storage.local["cmv"]) return;
              if (config.listeners.changed.check.all()) {
                let proceed = window.confirm("There are some unsaved changes! Please save all files before switching the editor engine. Switch anyway?");
                if (proceed === false) return;
              }
              /*  */
              config.storage.write("cmv", value);
              document.location.reload();
            });
            /*  */
            td.appendChild(select);
            return td;
          }
        }
      },
      "value": function (id) {
        let td = document.createElement("td");
        let input = document.createElement("input");
        /*  */
        input.setAttribute("id", id);
        td.setAttribute("rule", "value");
        input.addEventListener("change", function (e) {
          let cmv = config.storage.local["cmv"];
          let options = config.options[cmv];
          let editor = config.editor[cmv];
          if (options === undefined || editor === undefined) return;
          /*  */
          let id = e.target.getAttribute("id");
          let type = e.target.getAttribute("type");
          let select = config.elements.sidebar.right.querySelector("select[id='mode']");
          let tmp = type === "number" ? Number(e.target.value) : (type === "text" ? e.target.value : e.target.checked);
          if (id === "mode") {
            select.value = tmp;
            /*
              the input switches the open file's mode like the select does
            */
            if (editor.apply && editor.apply.mode) editor.apply.mode(tmp);
          }
          options.codemirror[id] = tmp;
          /*  */
          if (type === "checkbox") {
            let label = document.querySelector("label[attached='" + id + "']");
            if (label) label.setAttribute("checked", e.target.checked);
          }
          /*  */
          editor.update.codemirror();
        });
        /*  */
        let value = config.options[config.storage.local["cmv"]].codemirror[id];
        if (typeof value === "number") {
          input.setAttribute("type", "number");
          td.appendChild(input);
          input.value = value;
        } else if (typeof value === "string") {
          input.setAttribute("type", "text");
          td.appendChild(input);
          input.value = value;
        } else if (typeof value === "boolean") {
          input.setAttribute("type", "checkbox");
          /*  */
          let label = document.createElement("label");
          label.setAttribute("class", "checkbox");
          label.setAttribute("checked", value);
          label.setAttribute("attached", id);
          label.setAttribute("for", id);
          label.textContent = "✔";
          label.appendChild(input);
          input.checked = value;
          td.appendChild(label);
        }
        /*  */
        return td;
      }
    },
    "table": {
      "tabs": function (e) {
        let table = e.cloneNode(true);
        config.elements.tabs.appendChild(table);
        table.setAttribute("id", "tabs-table-for-item-" + config.current.path);
        table.setAttribute("title", config.current.path.replace('/', '').replace(/\//g, ' \\ '));
        table.addEventListener("click", function (e) {
          /*
            resolve the clicked tab straight from its fixed table id - no css
            selectors built from file names, no dead zones on td padding
          */
          let row = e.target.closest ? e.target.closest("table[id*='tabs-table-for-item-']") : null;
          let key = row ? row.getAttribute("id").replace("tabs-table-for-item-", '') : null;
          let sidebarRow = key ? document.getElementById("sidebar-table-for-item-" + key) : null;
          if (!sidebarRow) {
            if (config.log) console.info("tab click dropped, no sidebar row for", key);
            return;
          }
          /*
            clicks on the x icon close the file, everything else opens it
          */
          let closeDiv = sidebarRow.querySelector("td[rule='close'] div");
          let fileDiv = sidebarRow.querySelector("td[rule='button'] div");
          let isClose = e.target.closest && e.target.closest("td[rule='close']");
          let target = isClose ? closeDiv : fileDiv;
          if (target) {
            target.click();
            config.listeners.active.save(e);
          }
        });
      },
      "file": function (o, c) {
        const name = o.fileName;
        const path = o.fullPath;
        const id = "sidebar-table-for-item-" + (path || name);
        const table = document.getElementById(id);
        if (!table) {
          const tr = document.createElement("tr");
          config.sidebar.add.table.proto.container = c;
          config.sidebar.add.table.proto.item = document.createElement("table");
          /*  */
          tr.appendChild(config.sidebar.add.column.file(name, path || name));
          tr.appendChild(config.sidebar.add.column.close(path || name));
          /*  */
          config.sidebar.add.table.proto.item.options = o;
          config.sidebar.add.table.proto.item.appendChild(tr);
          config.sidebar.add.table.proto.item.setAttribute("id", id);
          config.sidebar.add.table.proto.item.setAttribute("class", "files");
          config.sidebar.add.table.proto.item.addEventListener("click", config.sidebar.add.table.proto.click);
          /*  */
          let filepath = path ? path.replace('/' + o.fileName, '') : null;
          let parent = filepath ? document.getElementById(filepath) : null;
          if (filepath) {
            if (parent) {
              parent.appendChild(config.sidebar.add.table.proto.item);
            } else {
              config.sidebar.add.table.proto.chunks = [];
              config.sidebar.add.table.proto.deep(path);
            }
          } else {
            let target = config.sidebar.add.table.proto.item;
            let parent = config.sidebar.add.table.proto.container.firstChild;
            config.sidebar.add.table.proto.container.insertBefore(target, parent);
          }
        }
      },
      "proto": {
        "chunks": [],
        "container": null,
        "click": function (e) {
          let fullPath = e.target.getAttribute("id");
          if (fullPath) {
            config.current.path = fullPath;
            let tab = document.getElementById("tabs-table-for-item-" + config.current.path);
            /*  */
            let folder = '';
            let arr = config.current.path.split('/');
            if (arr && arr.length) {
              for (let i = arr.length - 1; i >= 0; i--) {
                folder = '/' + arr[i] + folder;
                let path = config.current.path.replace(folder, '');
                let current = path ? document.getElementById(path) : null;
                if (current) {
                  let details = current.closest("details");
                  if (details) details.open = true;
                }
              }
            }
            /*  */
            if (tab === null) config.sidebar.add.table.tabs(this);
            /*  */
            let flag_1 = config.current.path === this.options.fullPath;
            let flag_2 = config.current.path.indexOf("untitled") === 0;
            if (flag_1 || flag_2) {
              config.listeners.active.save(e);
              config.editor[config.storage.local["cmv"]].focus.codemirror(this.options);
            }
          }
        },
        "deep": function (path) {
          let arr = path.split('/');
          if (arr && arr.length) {
            arr.pop();
            let id = arr.join('/');
            if (id) {
              let element = document.getElementById(id);
              if (element) {
                config.sidebar.add.table.proto.chunks.push(element);
                config.sidebar.add.table.proto.end(false, 0);
              } else {
                let details = document.createElement("details");
                let summary = document.createElement("summary");
                /*  */
                details.appendChild(summary);
                details.setAttribute("id", id);
                summary.textContent = id.split('/').pop();
                config.sidebar.add.table.proto.chunks.push(details);
                /*  */
                let valid = id.length && id.indexOf('/') !== -1;
                if (valid) {
                  config.sidebar.add.table.proto.deep(id);
                } else {
                  config.sidebar.add.table.proto.end(true);
                }
              }
            } else {
              config.sidebar.add.table.proto.end(true, 1);
            }
          } else {
            config.sidebar.add.table.proto.end(true, 2);
          }
        },
        "end": function (attach, loc) {
          if (config.log) console.error(loc);
          /*  */
          let length = config.sidebar.add.table.proto.chunks.length - 1;
          for (let i = length; i >= 0; i--) {
            if (i - 1 > -1) {
              let parent = config.sidebar.add.table.proto.chunks[i];
              let child = config.sidebar.add.table.proto.chunks[i - 1];
              parent.appendChild(child);
            }
          }
          /*  */
          let details = config.sidebar.add.table.proto.chunks[0];
          details.appendChild(config.sidebar.add.table.proto.item);
          if (attach) {
            let index = config.sidebar.add.table.proto.chunks.length - 1;
            let file = config.sidebar.add.table.proto.chunks[index];
            /*  */
            let name = file.getAttribute("id");
            let tr = document.createElement("tr");
            let dir = document.createElement("td");
            let table = document.createElement("table");
            let close = config.sidebar.add.column.close(name);
            /*  */
            dir.appendChild(file);
            close.style.verticalAlign = "top";
            dir.setAttribute("class", "nohover");
            close.setAttribute("class", "nohover");
            /*  */
            tr.appendChild(dir);
            tr.appendChild(close);
            /*  */
            table.appendChild(tr);
            table.setAttribute("class", "files");
            table.setAttribute("id", "sidebar-table-for-directory-" + name);
            /*  */
            config.sidebar.add.table.proto.container.appendChild(table);
          }
        }
      }
    }
  },
  "icons": {
    "new": {
      "vb": "0 0 16 16",
      "d": "m 1.5,0 v 16 h 13 V 5 L 9.5,0 Z M 6.6726837,5.2203123 H 9.1273155 V 7.6726838 H 11.579688 V 10.127316 H 9.1273155 v 2.452372 H 6.6726837 V 10.127316 H 4.2203121 V 7.6726838 h 2.4523716 z"
    },
    "open": {
      "vb": "0 0 32 32",
      "d": "M 1.0000002e-7,1.4088177 V 27.857707 C 1.0000002e-7,29.366228 1.2289591,30.591182 2.7374761,30.591182 H 26.472934 c 1.298743,0 2.430011,-0.925356 2.685372,-2.200403 L 32,14.174349 H 11.118236 L 7.6562092,24.518573 4.1812637,23.408357 8.4529083,10.527054 H 27.362723 V 5.056112 H 13.402812 L 10.468945,1.4088177 Z"
    },
    "importSettings": {
      "vb": "0 0 128 128",
      "d": "M 99.107143 7.0178571 L 99.107143 120.98214 L 120.16071 120.98214 L 120.16071 7.0178571 L 99.107143 7.0178571 z M 51.392857 27.821429 L 51.392857 52.482143 L 8.1428571 52.482143 L 8.1428571 75.517857 L 51.392857 75.517857 L 51.392857 100.17857 L 90.928571 64 L 51.392857 27.821429 z"
    },
    "saveAll": {
      "vb": "0 0 32 32",
      "d": "M 25.582031 2.734375 L 13.386719 14.929688 L 6.4179688 7.9609375 L 2.9335938 11.445312 L 13.386719 21.898438 L 29.066406 6.21875 L 25.582031 2.734375 z M 25.582031 11.703125 L 13.386719 23.898438 L 6.4179688 16.929688 L 2.9335938 20.414062 L 13.386719 30.867188 L 29.066406 15.1875 L 25.582031 11.703125 z"
    },
    "exportSettings": {
      "vb": "0 0 128 128",
      "d": "M 99.107143 7.0178571 L 99.107143 120.98214 L 120.16071 120.98214 L 120.16071 7.0178571 L 99.107143 7.0178571 z M 47.678571 27.821429 L 8.1428571 64 L 47.678571 100.17857 L 47.678571 75.517857 L 90.928571 75.517857 L 90.928571 52.482143 L 47.678571 52.482143 L 47.678571 27.821429 z"
    },
    "saveAs": {
      "vb": "0 0 18 18",
      "d": "M 1.9988839,0 C 0.89888842,0 0,0.89888842 0,1.9988839 V 16.001116 C 0,17.101112 0.89888842,18 1.9988839,18 H 16.001116 C 17.101112,18 18,17.101112 18,16.001116 V 5.2859933 L 12.714007,0 Z m 8.6638191,6.4605861 5.024001,4.7716369 -5.024001,4.768893 -1.8565501,-1.859292 1.2779201,-1.277922 H 2.8336053 V 5.7457084 H 6.0969662 V 9.6005421 H 10.089558 L 8.8061529,8.317137 Z"
    },
    "save": {
      "vb": "0 0 18 18",
      "d": "M 1.9988839 0 C 0.89888503 0 1.9032376e-16 0.89888503 0 1.9988839 L 0 16.001116 C 0 17.101115 0.89888503 18 1.9988839 18 L 16.001116 18 C 17.101115 18 18 17.101115 18 16.001116 L 18 4.000279 L 13.999721 0 L 1.9988839 0 z M 11.182199 2.2876674 A 2.7201207 2.7201207 0 0 1 13.901786 5.0072545 A 2.7201207 2.7201207 0 0 1 11.182199 7.7268415 A 2.7201207 2.7201207 0 0 1 8.4626116 5.0072545 A 2.7201207 2.7201207 0 0 1 11.182199 2.2876674 z M 3.9073661 11.018973 L 13.906808 11.018973 L 13.906808 15.019252 L 3.9073661 15.019252 L 3.9073661 11.018973 z"
    },
    "openFolder": {
      "vb": "0 0 48 48",
      "d": "M 5.333337,0 C 2.386673,0 4e-6,2.3866696 4e-6,5.3333333 V 42.666667 C 4e-6,45.61333 2.386673,48 5.333337,48 H 42.666671 C 45.613334,48 48,45.61333 48,42.666667 V 29.333334 h -8.708329 v 9.958333 H 8.708337 V 8.7083333 H 18.66667 V 0 Z M 26.66667,0 v 8.7083333 c 0.962778,0.1706635 4.577589,0.5068849 5.489584,0.9583334 L 17.588546,24.234375 23.765629,30.411458 38.364587,15.8125 c 0.475117,0.949201 0.805572,4.583031 0.927084,5.520834 H 48 V 0 Z"
    },
    "openSettings": {
      "vb": "0 0 28 28",
      "tf": "matrix(2.1646693,0,0,2.1646693,-1004.7755,-822.57435) translate(464,380)",
      "d": "M 5.291747 7.3914293e-06 C 5.143599 7.3914293e-06 4.9923362 0.079047754 4.9669283 0.25986233 L 4.7070734 2.0147854 C 4.3170741 2.1447853 3.8930007 2.3918547 3.6017877 2.665325 L 2.0417558 2.0147854 C 1.8467562 1.9497856 1.679114 1.996668 1.5870096 2.1447129 L 0.28683269 4.4202481 C 0.24592767 4.5195349 0.2867604 4.7161217 0.41676016 4.8100305 L 1.7819008 5.8503525 C 1.70197 6.2886408 1.709374 6.7144634 1.7819008 7.1496272 L 0.41676016 8.2549129 C 0.2867604 8.3849125 0.28679703 8.5146959 0.35179643 8.6446953 L 1.6519734 10.920231 C 1.7169742 10.985231 1.8467562 11.050195 2.0417558 10.985194 L 3.6667514 10.334655 C 3.9917509 10.594653 4.3416255 10.821626 4.7720371 10.985194 L 5.0318921 12.675154 C 5.0318921 12.805155 5.161711 12.935009 5.3567107 12.935009 L 7.9570646 12.935009 C 8.0870641 12.935009 8.2818833 12.805155 8.2818833 12.675154 L 8.5417382 10.985194 C 8.9425138 10.855195 9.3220246 10.594653 9.647024 10.334655 L 11.27202 10.985194 C 11.402018 11.050194 11.596803 10.985266 11.661802 10.855267 L 12.961979 8.5797316 C 13.026979 8.449732 13.027015 8.2549495 12.897015 8.1899492 L 11.401947 7.1496272 C 11.481867 6.7113382 11.474477 6.2855156 11.401947 5.8503525 L 12.767088 4.7450668 C 12.897089 4.615067 12.897052 4.485284 12.832051 4.3552844 L 11.531875 2.0797491 C 11.466875 2.0147493 11.337092 1.9497857 11.142092 2.0147854 L 9.5170965 2.665325 C 9.1920973 2.405326 8.8287526 2.1447853 8.4118108 2.0147854 L 8.1519558 0.32482606 C 8.1298436 0.19516072 8.0366195 7.3914293e-06 7.8921009 7.3914293e-06 L 5.291747 7.3914293e-06 z M 6.591924 4.2253569 C 7.8269211 4.2253569 8.8665569 5.2649922 8.8665569 6.4999899 C 8.8665569 7.7349872 7.8269211 8.7746228 6.591924 8.7746228 C 5.356926 8.7746228 4.3163887 7.7349872 4.3163887 6.4999899 C 4.3163887 5.2649922 5.356926 4.2253569 6.591924 4.2253569 z"
    }
  }
};
