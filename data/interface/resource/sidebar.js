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
      /*
        tr = document.createElement("tr");
        tr.appendChild(config.sidebar.add.column.custom.cmv.option("cmv"));
        tr.appendChild(config.sidebar.add.column.custom.cmv.select("cmv"));
        table.appendChild(tr);
      */
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
        fileio.textContent = abstract ? config.editor[config.storage.local["cmv"]].make.name(id) : id;
        td.appendChild(fileio);
        return td;
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
          let input = config.elements.sidebar.right.querySelector("input[id='mode']");
          if (id === "mode") input.value = e.target.value;
          config.options[config.storage.local["cmv"]].codemirror[id] = e.target.value;
          /*  */
          config.editor[config.storage.local["cmv"]].update.codemirror();
        });
        /*  */
        td.appendChild(select);
        return td;
      },
      "custom": {
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
              option.textContent = sorted[i] === 5 ? "5 (old)" : "6 (new)";
              select.appendChild(option);
            }
            /*  */
            select.setAttribute("id", "cmv");
            td.setAttribute("rule", "value");
            select.value = config.storage.local["cmv"];
            select.addEventListener("change", function (e) {
              config.storage.write("cmv", e.target.value);
              config.storage.local["cmv"] = e.target.value;
              config.editor[config.storage.local["cmv"]].update.codemirror();
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
          let id = e.target.getAttribute("id");
          let type = e.target.getAttribute("type");
          let select = config.elements.sidebar.right.querySelector("select[id='mode']");
          let tmp = type === "number" ? Number(e.target.value) : (type === "text" ? e.target.value : e.target.checked);
          if (id === "mode") select.value = tmp;
          config.options[config.storage.local["cmv"]].codemirror[id] = tmp;
          /*  */
          if (type === "checkbox") {
            let label = document.querySelector("label[attached='" + id + "']");
            if (label) label.setAttribute("checked", e.target.checked);
          }
          /*  */
          config.editor[config.storage.local["cmv"]].update.codemirror();
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
          let attribute = {};
          attribute.id = e.target.getAttribute("id");
          attribute.for = e.target.getAttribute("for");
          let selector = attribute.id ? "div[id='" + attribute.id + "']" : "div[for='" + attribute.for + "']";
          let target = config.elements.sidebar.left.querySelector(selector);
          if (target) {
            target.click();
            config.listeners.active.save(e);
          }
        });
      },
      "proto": {
        "chunks": [],
        "container": null,
        "end": function (attach, loc) {
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
            config.sidebar.add.table.proto.container.appendChild(table);
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
                details.setAttribute("id", id);
                details.appendChild(summary);
                summary.textContent = id.split('/').pop();
                config.sidebar.add.table.proto.chunks.push(details);
                let valid = id.length && id.indexOf('/') !== -1;
                if (valid) config.sidebar.add.table.proto.deep(id);
                else config.sidebar.add.table.proto.end(true);
              }
            } else config.sidebar.add.table.proto.end(true, 1);
          } else config.sidebar.add.table.proto.end(true, 2);
        },
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
        }
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
            if (parent) parent.appendChild(config.sidebar.add.table.proto.item);
            else {
              config.sidebar.add.table.proto.chunks = [];
              config.sidebar.add.table.proto.deep(path);
            }
          } else {
            let target = config.sidebar.add.table.proto.item;
            let parent = config.sidebar.add.table.proto.container.firstChild;
            config.sidebar.add.table.proto.container.insertBefore(target, parent);
          }
        }
      }
    }
  }
};
