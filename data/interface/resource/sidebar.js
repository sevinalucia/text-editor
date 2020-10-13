config.sidebar = {
  "render": function () {
    var table = document.createElement("table");
    table.setAttribute("class", "options");
    config.elements.sidebar.right.appendChild(table);
    /*  */
    var tr = document.createElement("tr");
    tr.appendChild(config.sidebar.add.column.option("theme"));
    tr.appendChild(config.sidebar.add.column.select("theme"));
    table.appendChild(tr);
    /*  */
    var tr = document.createElement("tr");
    tr.appendChild(config.sidebar.add.column.option("scrollbarStyle"));
    tr.appendChild(config.sidebar.add.column.select("scrollbarStyle"));
    table.appendChild(tr);
    /*  */
    var tr = document.createElement("tr");
    tr.appendChild(config.sidebar.add.column.option("keyMap"));
    tr.appendChild(config.sidebar.add.column.select("keyMap"));
    table.appendChild(tr);
    /*  */
    var tr = document.createElement("tr");
    tr.appendChild(config.sidebar.add.column.option("mode"));
    tr.appendChild(config.sidebar.add.column.select("mode"));
    table.appendChild(tr);
    /*  */
    var tr = document.createElement("tr");
    tr.setAttribute("class", "separator");
    tr.appendChild(document.createElement("td"));
    tr.appendChild(document.createElement("td"));
    table.appendChild(tr);
    /*  */
    var sorted = config.sort.object(config.options.codemirror);
    for (var id in sorted) {
      var tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.option(id));
      tr.appendChild(config.sidebar.add.column.value(id));
      table.appendChild(tr);
    }
    /*  */
    var table = document.createElement("table");
    table.setAttribute("class", "header");
    config.elements.sidebar.left.appendChild(table);
    for (var id in config.options.editor) {
      var tr = document.createElement("tr");
      tr.appendChild(config.sidebar.add.column.button(id, true));
      table.appendChild(tr);
    }
  },
  "add": {
    "column": {
      "option": function (id) {
        var td = document.createElement("td");
        var label = document.createElement("label");
        /*  */
        label.textContent = config.editor.make.name(id);
        td.setAttribute("rule", "name");
        label.setAttribute("for", id);
        td.appendChild(label);
        return td;
      },
      "close": function (id) {
        var td = document.createElement("td");
        var close = document.createElement("div");
        /*  */
        close.setAttribute("for", id);
        td.setAttribute("rule", "close");
        close.addEventListener("click", function (e) {
          var target = e.target.getAttribute("for");
          config.editor.remove.codemirror(target, false, e.isTrusted);
        });
        td.appendChild(close);
        return td;
      },
      "file": function (id, path) {
        var td = document.createElement("td");
        var item = document.createElement("div");
        /*  */
        item.textContent = id;
        item.setAttribute("id", path);
        td.setAttribute("rule", "button");
        td.appendChild(item);
        return td;
      },
      "button": function (id, abstract) {
        var td = document.createElement("td");
        var fileio = document.createElement("div");
        /*  */
        fileio.setAttribute("id", id);
        td.setAttribute("rule", "button");
        fileio.addEventListener("click", config.fileio);
        fileio.textContent = abstract ? config.editor.make.name(id) : id;
        td.appendChild(fileio);
        return td;
      },
      "select": function (id) {
        var td = document.createElement("td");
        var select = document.createElement("select");
        var sorted = config.sort.array(config.options[id]);
        /*  */
        for (var i = 0; i < sorted.length; i++) {
          var option = document.createElement("option");
          option.setAttribute("value", sorted[i]);
          option.textContent = sorted[i];
          select.appendChild(option);
        }
        /*  */
        select.setAttribute("id", id);
        td.setAttribute("rule", "value");
        select.value = config.options.codemirror[id];
        select.addEventListener("change", function (e) {
          var input = config.elements.sidebar.right.querySelector("input[id='mode']");
          if (id === "mode") input.value = e.target.value;
          config.options.codemirror[id] = e.target.value;
          /*  */
          config.editor.update.codemirror();
        });
        /*  */
        td.appendChild(select);
        return td;
      },
      "value": function (id) {
        var td = document.createElement("td");
        var input = document.createElement("input");
        /*  */
        input.setAttribute("id", id);
        td.setAttribute("rule", "value");
        input.addEventListener("change", function (e) {
          var id = e.target.getAttribute("id");
          var type = e.target.getAttribute("type");
          var select = config.elements.sidebar.right.querySelector("select[id='mode']");
          var tmp = type === "number" ? Number(e.target.value) : (type === "text" ? e.target.value : e.target.checked);
          if (id === "mode") select.value = tmp;
          config.options.codemirror[id] = tmp;
          /*  */
          if (type === "checkbox") {
            var label = document.querySelector("label[attached='" + id + "']");
            if (label) label.setAttribute("checked", e.target.checked);
          }
          /*  */
          config.editor.update.codemirror();
        });
        /*  */
        var value = config.options.codemirror[id];
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
          var label = document.createElement("label");
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
        var table = e.cloneNode(true);
        config.elements.tabs.appendChild(table);
        table.setAttribute("id", "tabs-table-for-item-" + config.current.path);
        table.setAttribute("title", config.current.path.replace('/', '').replace(/\//g, ' \\ '));
        table.addEventListener("click", function (e) {
          var attribute = {};
          attribute.id = e.target.getAttribute("id");
          attribute.for = e.target.getAttribute("for");
          var selector = attribute.id ? "div[id='" + attribute.id + "']" : "div[for='" + attribute.for + "']";
          var target = config.elements.sidebar.left.querySelector(selector);
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
          var length = config.sidebar.add.table.proto.chunks.length - 1;
          for (var i = length; i >= 0; i--) {
            if (i - 1 > -1) {
              var parent = config.sidebar.add.table.proto.chunks[i];
              var child = config.sidebar.add.table.proto.chunks[i - 1];
              parent.appendChild(child);
            }
          }
          /*  */
          var details = config.sidebar.add.table.proto.chunks[0];
          details.appendChild(config.sidebar.add.table.proto.item);
          if (attach) {
            var index = config.sidebar.add.table.proto.chunks.length - 1;
            var file = config.sidebar.add.table.proto.chunks[index];
            /*  */
            var name = file.getAttribute("id");
            var tr = document.createElement("tr");
            var dir = document.createElement("td");
            var table = document.createElement("table");
            var close = config.sidebar.add.column.close(name);
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
          var arr = path.split('/');
          if (arr && arr.length) {
            arr.pop();
            var id = arr.join('/');
            if (id) {
              var element = document.getElementById(id);
              if (element) {
                config.sidebar.add.table.proto.chunks.push(element);
                config.sidebar.add.table.proto.end(false, 0);
              } else {
                var details = document.createElement("details");
                var summary = document.createElement("summary");
                details.setAttribute("id", id);
                details.appendChild(summary);
                summary.textContent = id.split('/').pop();
                config.sidebar.add.table.proto.chunks.push(details);
                var valid = id.length && id.indexOf('/') !== -1;
                if (valid) config.sidebar.add.table.proto.deep(id);
                else config.sidebar.add.table.proto.end(true);
              }
            } else config.sidebar.add.table.proto.end(true, 1);
          } else config.sidebar.add.table.proto.end(true, 2);
        },
        "click": function (e) {
          var fullPath = e.target.getAttribute("id");
          if (fullPath) {
            config.current.path = fullPath;
            var tab = document.getElementById("tabs-table-for-item-" + config.current.path);
            /*  */
            var folder = '';
            var arr = config.current.path.split('/');
            if (arr && arr.length) {
              for (var i = arr.length - 1; i >= 0; i--) {
                folder = '/' + arr[i] + folder;
                var path = config.current.path.replace(folder, '');
                var current = path ? document.getElementById(path) : null;
                if (current) {
                  var details = current.closest("details");
                  if (details) details.open = true;
                }
              }
            }
            /*  */
            if (tab === null) config.sidebar.add.table.tabs(this);
            /*  */
            var flag_1 = config.current.path === this.options.fullPath;
            var flag_2 = config.current.path.indexOf("untitled") === 0;
            if (flag_1 || flag_2) {
              config.listeners.active.save(e);
              config.editor.focus.codemirror(this.options);
            }
          }
        }
      },
      "file": function (o, c) {
        var name = o.fileName;
        var path = o.fullPath;
        var id = "sidebar-table-for-item-" + (path || name);
        var table = document.getElementById(id);
        if (!table) {
          var tr = document.createElement("tr");
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
          var filepath = path ? path.replace('/' + o.fileName, '') : null;
          var parent = filepath ? document.getElementById(filepath) : null;
          if (filepath) {
            if (parent) parent.appendChild(config.sidebar.add.table.proto.item);
            else {
              config.sidebar.add.table.proto.chunks = [];
              config.sidebar.add.table.proto.deep(path);
            }
          } else {
            var target = config.sidebar.add.table.proto.item;
            var parent = config.sidebar.add.table.proto.container.firstChild;
            config.sidebar.add.table.proto.container.insertBefore(target, parent);
          }
        }
      }
    }
  }
};
