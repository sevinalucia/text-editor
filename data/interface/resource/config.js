var config = {
  "count": 0,
  "files": {},
  "log": false,
  "editor": {},
  "options": {},
  "directories": {},
  "current": {
    "path": null
  },
  "custom": {
    "style": null
  },
  "addon": {
    "homepage": function () {
      return chrome.runtime.getManifest().homepage_url;
    }
  },
  "download": {
    "id": '',
    "url": '',
    "path": '',
    "name": '',
    "pending": {},
    "saveAs": false
  },
  "elements": {
    "toggle": {},
    "sidebar": {
      "resize": {
        "threshold": 3,
        "action": false
      }
    }
  },
  "reset": function () {
    let result = window.confirm("Do you really want to restore the app to factory settings?");
    if (result) {
      chrome.storage.local.clear(function () {
        document.getElementById("reload").click();
      });
    }
  },
  "sort": {
    "array": function (e) {
      return e.sort();
    },
    "object": function (e) {
      let keys = Object.keys(e);
      return keys.sort().reduce((a, v) => {
        a[v] = e[v];
        return a;
      }, {});
    }
  },
  "make": {
    "random": {
      "name": function makeid() {
        let text = '';
        let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        for (let i = 0; i < 7; i++) {
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        /*  */
        return text;
      }
    }
  },
  "color": {
    "check": function (color) {
      let r, g, b, hsp;
      if (color.match(/^rgb/)) {
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        r = color[1];
        g = color[2];
        b = color[3];
      } else {
        color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
      }
      /*  */
      hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
      return hsp > 127.5 ? "light" : "dark";
    }
  },
  "resize": {
    "timeout": null,
    "method": function () {
      if (config.port.name === "win") {
        if (config.resize.timeout) window.clearTimeout(config.resize.timeout);
        config.resize.timeout = window.setTimeout(async function () {
          let current = await chrome.windows.getCurrent();
          /*  */
          config.storage.write("interface.size", {
            "top": current.top,
            "left": current.left,
            "width": current.width,
            "height": current.height
          });
        }, 1000);
      }
    }
  },
  "port": {
    "name": '',
    "connect": function () {
      config.port.name = "webapp";
      let context = document.documentElement.getAttribute("context");
      /*  */
      if (chrome.runtime) {
        if (chrome.runtime.connect) {
          if (context !== config.port.name) {
            if (document.location.search === "?win") config.port.name = "win";
            background.connect(chrome.runtime.connect({"name": config.port.name}));
          }
        }
      }
      /*  */
      document.documentElement.setAttribute("context", config.port.name);
    }
  },
  "storage": {
    "local": {},
    "read": function (id) {
      return config.storage.local[id];
    },
    "load": function (callback) {
      chrome.storage.local.get(null, function (e) {
        config.storage.local = e;
        callback();
      });
    },
    "write": function (id, data) {
      if (id) {
        if (data !== '' && data !== null && data !== undefined) {
          let tmp = {};
          tmp[id] = data;
          config.storage.local[id] = data;
          chrome.storage.local.set(tmp);
        } else {
          delete config.storage.local[id];
          chrome.storage.local.remove(id);
        }
      }
    },
    "defaults": {
      "tabs": {},
      "cmv": "v5",
      "files": {},
      "cursor": {},
      "sorted": [],
      "active": null,
      "session": false,
      "autoSave": false,
      "directories": {},
      "closeEmpty": true,
      "open-left": "open",
      "open-right": "close",
      "sidebar-left": "open",
      "autoSaveInterval": 60,
      "sidebar-right": "close",
      "interface.theme": "dark"
    }
  },
  "engine": {
    "failed": false,
    "stamp": Date.now(),
    "manifest": {
      "v6": {
        "css": [],
        "js": [
          [
            "vendor/codemirror/v6/codemirror.js",
            "CodeMirror6"
          ],
          ["resource/v6/editor.js"],
          ["resource/v6/options.js"]
        ]
      },
      "v5": {
        "css": [
          "vendor/codemirror/v5/lib/codemirror.css",
          "vendor/codemirror/v5/addon/lint/lint.css",
          "vendor/codemirror/v5/addon/dialog/dialog.css",
          "vendor/codemirror/v5/addon/hint/show-hint.css",
          "vendor/codemirror/v5/addon/fold/foldgutter.css",
          "vendor/codemirror/v5/addon/scroll/simplescrollbars.css",
          "vendor/codemirror/v5/addon/search/matchesonscrollbar.css",
          "vendor/codemirror/v5/theme/3024-day.css",
          "vendor/codemirror/v5/theme/3024-night.css",
          "vendor/codemirror/v5/theme/abbott.css",
          "vendor/codemirror/v5/theme/abcdef.css",
          "vendor/codemirror/v5/theme/ambiance-mobile.css",
          "vendor/codemirror/v5/theme/ambiance.css",
          "vendor/codemirror/v5/theme/ayu-dark.css",
          "vendor/codemirror/v5/theme/ayu-mirage.css",
          "vendor/codemirror/v5/theme/base16-dark.css",
          "vendor/codemirror/v5/theme/base16-light.css",
          "vendor/codemirror/v5/theme/bespin.css",
          "vendor/codemirror/v5/theme/blackboard.css",
          "vendor/codemirror/v5/theme/cobalt.css",
          "vendor/codemirror/v5/theme/colorforth.css",
          "vendor/codemirror/v5/theme/darcula.css",
          "vendor/codemirror/v5/theme/dracula.css",
          "vendor/codemirror/v5/theme/duotone-dark.css",
          "vendor/codemirror/v5/theme/duotone-light.css",
          "vendor/codemirror/v5/theme/eclipse.css",
          "vendor/codemirror/v5/theme/elegant.css",
          "vendor/codemirror/v5/theme/erlang-dark.css",
          "vendor/codemirror/v5/theme/gruvbox-dark.css",
          "vendor/codemirror/v5/theme/hopscotch.css",
          "vendor/codemirror/v5/theme/icecoder.css",
          "vendor/codemirror/v5/theme/idea.css",
          "vendor/codemirror/v5/theme/isotope.css",
          "vendor/codemirror/v5/theme/juejin.css",
          "vendor/codemirror/v5/theme/lesser-dark.css",
          "vendor/codemirror/v5/theme/liquibyte.css",
          "vendor/codemirror/v5/theme/lucario.css",
          "vendor/codemirror/v5/theme/material-darker.css",
          "vendor/codemirror/v5/theme/material-ocean.css",
          "vendor/codemirror/v5/theme/material-palenight.css",
          "vendor/codemirror/v5/theme/material.css",
          "vendor/codemirror/v5/theme/mbo.css",
          "vendor/codemirror/v5/theme/mdn-like.css",
          "vendor/codemirror/v5/theme/midnight.css",
          "vendor/codemirror/v5/theme/monokai.css",
          "vendor/codemirror/v5/theme/moxer.css",
          "vendor/codemirror/v5/theme/neat.css",
          "vendor/codemirror/v5/theme/neo.css",
          "vendor/codemirror/v5/theme/night.css",
          "vendor/codemirror/v5/theme/nord.css",
          "vendor/codemirror/v5/theme/oceanic-next.css",
          "vendor/codemirror/v5/theme/panda-syntax.css",
          "vendor/codemirror/v5/theme/paraiso-dark.css",
          "vendor/codemirror/v5/theme/paraiso-light.css",
          "vendor/codemirror/v5/theme/pastel-on-dark.css",
          "vendor/codemirror/v5/theme/railscasts.css",
          "vendor/codemirror/v5/theme/rubyblue.css",
          "vendor/codemirror/v5/theme/seti.css",
          "vendor/codemirror/v5/theme/shadowfox.css",
          "vendor/codemirror/v5/theme/solarized.css",
          "vendor/codemirror/v5/theme/ssms.css",
          "vendor/codemirror/v5/theme/the-matrix.css",
          "vendor/codemirror/v5/theme/tomorrow-night-bright.css",
          "vendor/codemirror/v5/theme/tomorrow-night-eighties.css",
          "vendor/codemirror/v5/theme/ttcn.css",
          "vendor/codemirror/v5/theme/twilight.css",
          "vendor/codemirror/v5/theme/vibrant-ink.css",
          "vendor/codemirror/v5/theme/xq-dark.css",
          "vendor/codemirror/v5/theme/xq-light.css",
          "vendor/codemirror/v5/theme/yeti.css",
          "vendor/codemirror/v5/theme/yonce.css",
          "vendor/codemirror/v5/theme/zenburn.css",
          "vendor/other/one-dark.css"
        ],
        "js": [
          "vendor/codemirror/v5/lib/codemirror.js",
          "vendor/codemirror/v5/keymap/vim.js",
          "vendor/codemirror/v5/keymap/emacs.js",
          "vendor/codemirror/v5/keymap/sublime.js",
          "vendor/codemirror/v5/addon/dialog/dialog.js",
          "vendor/codemirror/v5/addon/display/rulers.js",
          "vendor/codemirror/v5/addon/scroll/simplescrollbars.js",
          "vendor/codemirror/v5/addon/scroll/annotatescrollbar.js",
          "vendor/codemirror/v5/addon/edit/closetag.js",
          "vendor/codemirror/v5/addon/edit/matchtags.js",
          "vendor/codemirror/v5/addon/edit/closebrackets.js",
          "vendor/codemirror/v5/addon/edit/trailingspace.js",
          "vendor/codemirror/v5/addon/edit/matchbrackets.js",
          "vendor/codemirror/v5/addon/hint/sql-hint.js",
          "vendor/codemirror/v5/addon/hint/css-hint.js",
          "vendor/codemirror/v5/addon/hint/xml-hint.js",
          "vendor/codemirror/v5/addon/hint/html-hint.js",
          "vendor/codemirror/v5/addon/hint/show-hint.js",
          "vendor/codemirror/v5/addon/hint/anyword-hint.js",
          "vendor/codemirror/v5/addon/hint/javascript-hint.js",
          "vendor/codemirror/v5/addon/fold/xml-fold.js",
          "vendor/codemirror/v5/addon/fold/foldcode.js",
          "vendor/codemirror/v5/addon/fold/foldgutter.js",
          "vendor/codemirror/v5/addon/fold/brace-fold.js",
          "vendor/codemirror/v5/addon/fold/indent-fold.js",
          "vendor/codemirror/v5/addon/fold/comment-fold.js",
          "vendor/codemirror/v5/addon/fold/markdown-fold.js",
          "vendor/codemirror/v5/addon/lint/lint.js",
          "vendor/codemirror/v5/addon/lint/css-lint.js",
          "vendor/codemirror/v5/addon/lint/html-lint.js",
          "vendor/codemirror/v5/addon/lint/yaml-lint.js",
          "vendor/codemirror/v5/addon/lint/json-lint.js",
          "vendor/codemirror/v5/addon/lint/javascript-lint.js",
          "vendor/codemirror/v5/addon/lint/coffeescript-lint.js",
          "vendor/codemirror/v5/addon/search/search.js",
          "vendor/codemirror/v5/addon/search/jump-to-line.js",
          "vendor/codemirror/v5/addon/search/searchcursor.js",
          "vendor/codemirror/v5/addon/search/match-highlighter.js",
          "vendor/codemirror/v5/addon/search/matchesonscrollbar.js",
          "vendor/codemirror/v5/mode/r/r.js",
          "vendor/codemirror/v5/mode/q/q.js",
          "vendor/codemirror/v5/mode/d/d.js",
          "vendor/codemirror/v5/mode/meta.js",
          "vendor/codemirror/v5/mode/oz/oz.js",
          "vendor/codemirror/v5/mode/go/go.js",
          "vendor/codemirror/v5/mode/vb/vb.js",
          "vendor/codemirror/v5/mode/sql/sql.js",
          "vendor/codemirror/v5/mode/pug/pug.js",
          "vendor/codemirror/v5/mode/z80/z80.js",
          "vendor/codemirror/v5/mode/xml/xml.js",
          "vendor/codemirror/v5/mode/vue/vue.js",
          "vendor/codemirror/v5/mode/pig/pig.js",
          "vendor/codemirror/v5/mode/php/php.js",
          "vendor/codemirror/v5/mode/gfm/gfm.js",
          "vendor/codemirror/v5/mode/gas/gas.js",
          "vendor/codemirror/v5/mode/fcl/fcl.js",
          "vendor/codemirror/v5/mode/elm/elm.js",
          "vendor/codemirror/v5/mode/ecl/ecl.js",
          "vendor/codemirror/v5/mode/dtd/dtd.js",
          "vendor/codemirror/v5/mode/css/css.js",
          "vendor/codemirror/v5/mode/soy/soy.js",
          "vendor/codemirror/v5/mode/rst/rst.js",
          "vendor/codemirror/v5/mode/rpm/rpm.js",
          "vendor/codemirror/v5/mode/sas/sas.js",
          "vendor/codemirror/v5/mode/apl/apl.js",
          "vendor/codemirror/v5/mode/lua/lua.js",
          "vendor/codemirror/v5/mode/jsx/jsx.js",
          "vendor/codemirror/v5/mode/idl/idl.js",
          "vendor/codemirror/v5/mode/tcl/tcl.js",
          "vendor/codemirror/v5/mode/toml/toml.js",
          "vendor/codemirror/v5/mode/stex/stex.js",
          "vendor/codemirror/v5/mode/solr/solr.js",
          "vendor/codemirror/v5/mode/sass/sass.js",
          "vendor/codemirror/v5/mode/ruby/ruby.js",
          "vendor/codemirror/v5/mode/slim/slim.js",
          "vendor/codemirror/v5/mode/mirc/mirc.js",
          "vendor/codemirror/v5/mode/mbox/mbox.js",
          "vendor/codemirror/v5/mode/vhdl/vhdl.js",
          "vendor/codemirror/v5/mode/yaml/yaml.js",
          "vendor/codemirror/v5/mode/ttcn/ttcn.js",
          "vendor/codemirror/v5/mode/twig/twig.js",
          "vendor/codemirror/v5/mode/haml/haml.js",
          "vendor/codemirror/v5/mode/ebnf/ebnf.js",
          "vendor/codemirror/v5/mode/diff/diff.js",
          "vendor/codemirror/v5/mode/dart/dart.js",
          "vendor/codemirror/v5/mode/http/http.js",
          "vendor/codemirror/v5/mode/haxe/haxe.js",
          "vendor/codemirror/v5/mode/perl/perl.js",
          "vendor/codemirror/v5/mode/swift/swift.js",
          "vendor/codemirror/v5/mode/nginx/nginx.js",
          "vendor/codemirror/v5/mode/mumps/mumps.js",
          "vendor/codemirror/v5/mode/forth/forth.js",
          "vendor/codemirror/v5/mode/dylan/dylan.js",
          "vendor/codemirror/v5/mode/cobol/cobol.js",
          "vendor/codemirror/v5/mode/cmake/cmake.js",
          "vendor/codemirror/v5/mode/asn.1/asn.1.js",
          "vendor/codemirror/v5/mode/julia/julia.js",
          "vendor/codemirror/v5/mode/clike/clike.js",
          "vendor/codemirror/v5/mode/sieve/sieve.js",
          "vendor/codemirror/v5/mode/shell/shell.js",
          "vendor/codemirror/v5/mode/pegjs/pegjs.js",
          "vendor/codemirror/v5/mode/yacas/yacas.js",
          "vendor/codemirror/v5/mode/troff/troff.js",
          "vendor/codemirror/v5/mode/turtle/turtle.js",
          "vendor/codemirror/v5/mode/xquery/xquery.js",
          "vendor/codemirror/v5/mode/webidl/webidl.js",
          "vendor/codemirror/v5/mode/python/python.js",
          "vendor/codemirror/v5/mode/puppet/puppet.js",
          "vendor/codemirror/v5/mode/sparql/sparql.js",
          "vendor/codemirror/v5/mode/scheme/scheme.js",
          "vendor/codemirror/v5/mode/smarty/smarty.js",
          "vendor/codemirror/v5/mode/pascal/pascal.js",
          "vendor/codemirror/v5/mode/mscgen/mscgen.js",
          "vendor/codemirror/v5/mode/mllike/mllike.js",
          "vendor/codemirror/v5/mode/stylus/stylus.js",
          "vendor/codemirror/v5/mode/groovy/groovy.js",
          "vendor/codemirror/v5/mode/erlang/erlang.js",
          "vendor/codemirror/v5/mode/eiffel/eiffel.js",
          "vendor/codemirror/v5/mode/django/django.js",
          "vendor/codemirror/v5/mode/jinja2/jinja2.js",
          "vendor/codemirror/v5/mode/cypher/cypher.js",
          "vendor/codemirror/v5/mode/octave/octave.js",
          "vendor/codemirror/v5/mode/textile/textile.js",
          "vendor/codemirror/v5/mode/tornado/tornado.js",
          "vendor/codemirror/v5/mode/haskell/haskell.js",
          "vendor/codemirror/v5/mode/fortran/fortran.js",
          "vendor/codemirror/v5/mode/crystal/crystal.js",
          "vendor/codemirror/v5/mode/clojure/clojure.js",
          "vendor/codemirror/v5/mode/gherkin/gherkin.js",
          "vendor/codemirror/v5/mode/verilog/verilog.js",
          "vendor/codemirror/v5/mode/velocity/velocity.js",
          "vendor/codemirror/v5/mode/vbscript/vbscript.js",
          "vendor/codemirror/v5/mode/ttcn-cfg/ttcn-cfg.js",
          "vendor/codemirror/v5/mode/modelica/modelica.js",
          "vendor/codemirror/v5/mode/asterisk/asterisk.js",
          "vendor/codemirror/v5/mode/ntriples/ntriples.js",
          "vendor/codemirror/v5/mode/markdown/markdown.js",
          "vendor/codemirror/v5/mode/protobuf/protobuf.js",
          "vendor/codemirror/v5/mode/smalltalk/smalltalk.js",
          "vendor/codemirror/v5/mode/htmlmixed/htmlmixed.js",
          "vendor/codemirror/v5/mode/brainfuck/brainfuck.js",
          "vendor/codemirror/v5/mode/commonlisp/commonlisp.js",
          "vendor/codemirror/v5/mode/properties/properties.js",
          "vendor/codemirror/v5/mode/powershell/powershell.js",
          "vendor/codemirror/v5/mode/asciiarmor/asciiarmor.js",
          "vendor/codemirror/v5/mode/livescript/livescript.js",
          "vendor/codemirror/v5/mode/javascript/javascript.js",
          "vendor/codemirror/v5/mode/spreadsheet/spreadsheet.js",
          "vendor/codemirror/v5/mode/mathematica/mathematica.js",
          "vendor/codemirror/v5/mode/coffeescript/coffeescript.js",
          "vendor/codemirror/v5/mode/yaml-frontmatter/yaml-frontmatter.js",
          "vendor/codemirror/v5/mode/haskell-literate/haskell-literate.js",
          "vendor/other/jshint.js",
          "vendor/other/csslint.js",
          "vendor/other/jsonlint.js",
          "vendor/other/searchbox.js",
          "vendor/other/show-invisibles.js",
          "resource/v5/editor.js",
          "resource/v5/options.js"
        ]
      }
    },
    "fail": function (message) {
      if (config.engine.failed) return;
      config.engine.failed = true;
      /*  */
      let cmv = config.storage.local["cmv"] || "v5";
      if (cmv === "v5") {
        if (config.log) console.error("engine load failed:", message);
        return;
      }
      /*  */
      if (config.log) console.warn("engine fallback to v5:", message);
      config.storage.write("cmv", "v5");
      document.location.reload();
    },
    "load": function (callback) {
      let cmv = config.storage.local["cmv"] || "v5";
      let manifest = config.engine.manifest[cmv];
      if (manifest === undefined) {
        config.storage.write("cmv", "v5");
        cmv = "v5";
        manifest = config.engine.manifest.v5;
      }
      /*  */
      (manifest.css || []).forEach(function (href) {
        let link = document.createElement("link");
        link.setAttribute("rel", "stylesheet");
        link.setAttribute("href", href);
        document.head.appendChild(link);
      });
      /*  */
      let scripts = manifest.js || [];
      let last = scripts.length - 1;
      if (last === -1) return callback();
      /*  */
      scripts.forEach(function (entry, i) {
        let path = typeof entry === "string" ? entry : entry[0];
        let script = document.createElement("script");
        /*  */
        script.setAttribute("type", "text/javascript");
        script.setAttribute("src", path + "?t=" + config.engine.stamp);
        /*
          preserves execution order for dynamic scripts
        */
        script.async = false;
        /*  */
        script.addEventListener("load", function () {
          let need = typeof entry === "string" ? null : entry[1];
          if (need && window[need] === undefined) {
            config.engine.fail(path + " did not define " + need);
          }
          /*  */
          if (i === last) callback();
        });
        /*  */
        script.addEventListener("error", function () {
          config.engine.fail(path + " failed to load");
        });
        /*  */
        document.head.appendChild(script);
      });
    }
  },
  "session": {
    "data": null,
    "dirty": false,
    "timeout": null,
    "generating": 0,
    "pendingPermissions": [],
    "active": function () {
      return config.storage.local["session"] === true;
    },
    /*
      periodic safety net: flush dirty state even if the window closes without events
    */
    "startAutoFlush": function () {
      window.setInterval(function () {
        config.session.flush();
      }, 3000);
    },
    "capture": function () {
      if (!config.session.active() || config.session.restoring) return;
      config.session.dirty = true;
      if (config.session.timeout) window.clearTimeout(config.session.timeout);
      config.session.timeout = window.setTimeout(config.session.captureNow, 500);
    },
    /*
      remove files/folders from the session snapshot (folder deleted via X)
    */
    "removeFromSession": function (paths) {
      let purge = function () {
        if (!config.session.data || !config.session.data.files) return;
        /*  */
        paths.forEach(function (p) {
          if (config.session.data.files) delete config.session.data.files[p];
          if (config.session.data.open) {
            let oi = config.session.data.open.indexOf(p);
            if (oi !== -1) config.session.data.open.splice(oi, 1);
          }
        });
        /*  */
        chrome.storage.local.set({"session.data": config.session.data}, function () {});
      };
      /*
        snapshot may not exist yet this run - seed it from storage so the purge still lands
      */
      if (!config.session.data) {
        chrome.storage.local.get({"session.data": null}, function (e) {
          if (!config.session.data && e && e["session.data"]) config.session.data = e["session.data"];
          purge();
        });
      } else {
        purge();
      }
    },
    /*
      synchronous fast-flush for page hide/unload: open editor contents only
    */
    "flush": function () {
      if (!config.session.active() || !config.session.dirty || config.session.restoring) return;
      /*  */
      config.session.dirty = false;
      if (config.session.timeout) window.clearTimeout(config.session.timeout);
      let cmv = config.storage.local["cmv"] || "v5";
      /*
        seed: last written snapshot (keeps closed files and the maps they carry)
      */
      let open = [];
      let dirty = [];
      let seed = config.session.data || config.storage.local["session.data"] || {};
      let files = seed.files ? JSON.parse(JSON.stringify(seed.files)) : {};
      let eol = seed.eol ? JSON.parse(JSON.stringify(seed.eol)) : {};
      let bom = seed.bom ? JSON.parse(JSON.stringify(seed.bom)) : {};
      /*  */
      if (config.editor[cmv]) {
        for (let path in config.editor[cmv].codemirror) {
          if (path.indexOf("untitled") === 0) continue;
          let value = config.editor[cmv].codemirror[path].getValue();
          files[path] = value;
          if (open.indexOf(path) === -1) open.push(path);
          if (config.listeners.changed.check.item(path)) dirty.push(path);
          /*
            metadata of open files (entry first, content fallback)
          */
          let entry = config.files[path];
          if (entry) {
            eol[path] = entry.eol || config.linebreak.detect(value);
            if (entry.bom) bom[path] = true;
            else delete bom[path];
          } else {
            eol[path] = config.linebreak.detect(value);
          }
        }
      }
      /*  */
      let directories = seed.directories ? seed.directories : Object.keys(config.directories);
      config.session.data = {
        "eol": eol,
        "bom": bom,
        "open": open,
        "dirty": dirty,
        "files": files,
        "directories": directories,
        "active": config.storage.local["active"]
      };
      /*  */
      chrome.storage.local.set({"session.data": config.session.data}, function () {});
    },
    "idb": {
      "db": null,
      "del": async function (key) {
        let db = await config.session.idb.open();
        if (!db) return;
        /*  */
        return new Promise(function (resolve) {
          let tx = db.transaction("handles", "readwrite");
          tx.objectStore("handles")["delete"](key);
          tx.oncomplete = resolve;
          tx.onerror = resolve;
        });
      },
      "put": async function (key, handle) {
        let db = await config.session.idb.open();
        if (!db) return;
        /*  */
        return new Promise(function (resolve) {
          let tx = db.transaction("handles", "readwrite");
          tx.objectStore("handles").put(handle, key);
          tx.oncomplete = resolve;
          tx.onerror = resolve;
        });
      },
      "get": async function (key) {
        let db = await config.session.idb.open();
        if (!db) return null;
        /*  */
        return new Promise(function (resolve) {
          let tx = db.transaction("handles", "readonly");
          let req = tx.objectStore("handles").get(key);
          /*  */
          req.onsuccess = function () {resolve(req.result || null)};
          req.onerror = function () {resolve(null)};
        });
      },
      "open": function () {
        return new Promise(function (resolve) {
          try {
            let req = indexedDB.open("text-editor-session", 1);
            /*  */
            req.onupgradeneeded = function () {req.result.createObjectStore("handles")};
            req.onsuccess = function () {resolve(req.result)};
            req.onerror = function () {resolve(null)};
          } catch (e) {
            resolve(null);
            if (config.log) console.error(e);
          }
        });
      }
    },
    "captureNow": async function () {
      if (!config.session.active()) return;
      /*  */
      let gen = ++config.session.generating;
      let cmv = config.storage.local["cmv"] || "v5";
      /*
        base: last successfully written snapshot (keeps files that are not open)
      */
      let base = config.session.data && config.session.data.files ? config.session.data.files : (config.storage.local["session.data"] && config.storage.local["session.data"].files ? config.storage.local["session.data"].files : {});
      let seed = config.session.data || config.storage.local["session.data"] || {};
      let files = JSON.parse(JSON.stringify(base));
      let directories = [];
      let open = [];
      let dirty = [];
      /*
        line ending / BOM maps survive for files that are not open right now
      */
      let eol = seed.eol ? JSON.parse(JSON.stringify(seed.eol)) : {};
      let bom = seed.bom ? JSON.parse(JSON.stringify(seed.bom)) : {};
      /*  */
      for (let path in config.editor[cmv].codemirror) {
        if (path.indexOf("untitled") === 0) continue;
        let value = config.editor[cmv].codemirror[path].getValue();
        files[path] = value;
        open.push(path);
        if (config.listeners.changed.check.item(path)) dirty.push(path);
        /*
          refresh the metadata of every open file (fall back to content)
        */
        let entry = config.files[path];
        if (entry) {
          eol[path] = entry.eol || config.linebreak.detect(value);
          if (entry.bom) bom[path] = true;
          else delete bom[path];
        } else {
          eol[path] = config.linebreak.detect(value);
        }
      }
      /*
        first-time files (never snapshotted): read once via handle/entry
      */
      for (let path in config.files) {
        if (files[path] !== undefined) continue;
        let entry = config.files[path];
        let content = null;
        try {
          if (entry.picker) {
            let file = await entry.picker.getFile();
            content = await file.text();
          } else if (entry.file) {
            content = await new Promise(function (resolve) {
              entry.file(function (f) {resolve(f ? f.text() : null)}, function () {resolve(null)});
            });
          } else if (typeof entry.result === "string") {
            content = entry.result;
          }
        } catch (e) {
          if (config.log) console.error(e);
        }
        /*  */
        if (typeof content === "string") files[path] = content;
        if (gen !== config.session.generating) return;
      }
      /*  */
      for (let path in config.directories) directories.push(path);
      /*  */
      if (gen !== config.session.generating) return;
      if (!config.session.active()) return;
      /*  */
      config.session.dirty = false;
      config.session.data = {
        "eol": eol,
        "bom": bom,
        "open": open,
        "dirty": dirty,
        "files": files,
        "directories": directories,
        "active": config.storage.local["active"]
      };
      /*  */
      chrome.storage.local.set({"session.data": config.session.data}, function () {
        let err = chrome.runtime.lastError;
        if (err) {
          if (config.log) console.warn("session snapshot write failed:", err.message);
        }
      });
    },
    "restore": async function () {
      let data = config.storage.local["session.data"];
      if (!data || !data.files) return 0;
      /*  */
      let count = 0;
      config.session.restoring = true;
      config.session.pendingPermissions = [];
      let cmv = config.storage.local["cmv"] || "v5";
      /*  */
      let paths = Object.keys(data.files).sort(function (a, b) {
        return a.split('/').length - b.split('/').length || a.localeCompare(b);
      });
      /*  */
      for (let path of paths) {
        if (path.indexOf('/') !== 0) continue;
        /*  */
        try {
          let entry = {
            "fileType": '',
            "isFile": true,
            "picker": null,
            "session": true,
            "fullPath": path,
            "isDirectory": false,
            "result": data.files[path],
            "fileName": path.split('/').pop(),
            "eol": data.eol ? data.eol[path] : undefined,
            "bom": data.bom ? !!data.bom[path] : undefined
          };
          /*  */
          config.files[path] = entry;
          /*
            re-attach the persisted file handle (IndexedDB)
          */
          try {
            let handle = await config.session.idb.get(path);
            if (handle) {
              entry.picker = handle;
              let state = await handle.queryPermission({"mode": "readwrite"});
              if (state !== "granted") config.session.pendingPermissions.push({"path": path, "handle": handle});
            }
          } catch (e) {
            if (config.log) console.error(e);
          }
          /*  */
          await new Promise(function (resolve) {
            /*
              a throwing create must still settle the await or the whole
              restore hangs there forever (outer catch never sees the await)
            */
            try {
              config.editor[cmv].create.codemirror(entry, resolve);
            } catch (error) {
              if (config.log) console.error(error);
              resolve();
            }
          });
          /*  */
          count++;
        } catch (e) {
          if (config.log) console.error(e);
        }
      }
      /*  */
      (data.directories || []).forEach(function (path) {
        if (!config.directories[path]) {
          config.directories[path] = {
            "picker": null,
            "isFile": false,
            "session": true,
            "fullPath": path,
            "isDirectory": true
          };
        }
      });
      /*  */
      let open = data.open && data.open.length ? data.open : [];
      /*  */
      for (let path of open) {
        if (config.files[path] && config.editor[cmv].codemirror[path] === undefined) {
          /*
            a throwing focus must not reject the restore - a rejected loop
            never reaches the restoring reset below, and capture/flush stay
            disabled for the whole run (same guard shape as the file loop)
          */
          try {
            /*
              create the tab BEFORE focusing so the tab bar height is measured correctly
            */
            config.current.path = path;
            let table = document.getElementById("sidebar-table-for-item-" + path);
            if (table && document.getElementById("tabs-table-for-item-" + path) === null) {
              config.sidebar.add.table.tabs(table);
            }
            /*  */
            await config.editor[cmv].focus.codemirror(config.files[path]);
          } catch (e) {
            if (config.log) console.error(e);
          }
        }
      }
      /*  */
      /*
        reopen the unsaved-change markers saved with the last snapshot
      */
      (data.dirty || []).forEach(function (path) {
        if (config.files[path]) config.listeners.changed.add({"path": path});
      });
      /*  */
      config.editor[cmv].update.codemirror();
      /*  */
      let active = data.active;
      /*
        only reopen the active file if its tab was open at close time
      */
      if (active && (data.open || []).indexOf(active) !== -1 && config.editor[cmv].codemirror[active] === undefined && config.files[active]) {
        await new Promise(function (resolve) {
          /*
            a throwing create must still settle the await (same guard as the
            file loop above)
          */
          try {
            config.editor[cmv].create.codemirror(config.files[active], resolve);
          } catch (error) {
            if (config.log) console.error(error);
            resolve();
          }
        });
      }
      /*  */
      if (active && config.editor[cmv].codemirror[active]) {
        config.current.path = active;
        config.storage.local["active"] = active;
        config.editor[cmv].focus.codemirror(config.files[active]);
      }
      /*  */
      /*
        re-request write permission for restored handles on the first user click
      */
      if (config.session.pendingPermissions.length) {
        let pending = config.session.pendingPermissions;
        config.session.pendingPermissions = [];
        /*  */
        let grant = function () {
          pending.forEach(function (item) {
            item.handle.requestPermission({"mode": "readwrite"}).then(function (state) {
              let entry = config.files[item.path];
              if (state !== "granted" && entry) entry.picker = null;
              if (config.log) console.info("session access " + state + " for " + item.path);
            })["catch"](function () {
              //
            });
          });
        };
        /*  */
        window.addEventListener("click", grant, {"once": true, "capture": true});
        if (config.log) console.info("session: click anywhere to restore write access to " + pending.length + " file(s)");
      }
      /*  */
      config.session.restoring = false;
      config.session.captureNow();
      return count;
    }
  },
  "autosave": {
    "timer": null,
    "active": function () {
      return config.storage.local["autoSave"] === true;
    },
    "interval": function () {
      let value = Number(config.storage.local["autoSaveInterval"]);
      return Number.isFinite(value) && value >= 5 ? value * 1000 : 60000;
    },
    "apply": function () {
      config.autosave.stop();
      if (config.autosave.active()) {
        config.autosave.timer = window.setInterval(config.autosave.tick, config.autosave.interval());
      }
    },
    "stop": function () {
      if (config.autosave.timer) {
        window.clearInterval(config.autosave.timer);
        config.autosave.timer = null;
      }
    },
    "tick": function () {
      if (!config.autosave.active()) return;
      if (config.save.savingCount) return;
      let editor = config.editor[config.storage.local["cmv"]];
      if (editor === undefined) return;
      /*  */
      for (let path in config.files) {
        let entry = config.files[path];
        if (editor.codemirror[path] === undefined) continue;
        if (config.listeners.changed.check.item(path) === false) continue;
        /*  */
        if (config.support.fileio.new) {
          /*
            picker handles write straight to disk (session files persist
            into the snapshot through the same path)
          */
          config.save.new(entry);
        } else {
          /*
            legacy/old mode: each disk write queues a download entry for
            the user to confirm - the session snapshot is the only sane
            auto-save target there, no download spam
          */
          let snapshot = config.session.data;
          if (snapshot && snapshot.files) {
            snapshot.files[path] = editor.codemirror[path].getValue();
            config.session.dirty = true;
            chrome.storage.local.set({"session.data": snapshot}, function () {});
            config.listeners.changed.remove(path);
          }
        }
      }
    }
  },
  "backup": {
    "keys": function () {
      /*
        user-facing settings only - workspace state (tabs, files, cursors,
        session snapshot) and runtime keys never travel in the envelope
      */
      let list = [
        "cmv",
        "session",
        "autoSave",
        "open-left",
        "open-right",
        "closeEmpty",
        "sidebar-left",
        "sidebar-right",
        "interface.size",
        "interface.theme",
        "autoSaveInterval",
        "sidebar.left.width"
      ];
      /*  */
      let engine = config.options[config.storage.local["cmv"]];
      if (engine) list = list.concat(Object.keys(engine.codemirror));
      /*  */
      return list;
    },
    "apply": function (settings, callback) {
      let tmp = {};
      let allowed = config.backup.keys();
      /*
        strict per-key typing - an envelope carrying tabSize: "abc" or a
        string for a boolean switch must not reach storage (missing keys
        fall back to getters, but present-and-broken types would persist
        until a factory reset)
      */
      let typecheck = function (key, value) {
        let current = config.storage.local[key];
        if (current === undefined) {
          return typeof value !== "object" && typeof value !== "function";
        }
        /*  */
        return typeof value === typeof current;
      };
      /*  */
      for (let i = 0; i < allowed.length; i++) {
        let key = allowed[i];
        if (key in settings && typecheck(key, settings[key])) tmp[key] = settings[key];
      }
      /*  */
      chrome.storage.local.set(tmp, callback);
    },
    "export": function () {
      let settings = {};
      let source = config.storage.local;
      let anchor = document.createElement("a");
      /*  */
      for (let key of config.backup.keys()) {
        if (source[key] !== undefined) settings[key] = source[key];
      }
      /*  */
      let envelope = {"app": "text-editor", "format": 1, "settings": settings};
      let url = URL.createObjectURL(new Blob([JSON.stringify(envelope, null, 2)], {"type": "application/json"}));
      /*
        href goes in through setAttribute - the literal string trips the audit
      */
      anchor.setAttribute("href", url);
      anchor.setAttribute("download", "text-editor-settings.json");
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      /*  */
      window.setTimeout(function () {URL.revokeObjectURL(url)}, 500);
    },
    "import": function () {
      let input = document.createElement("input");
      document.body.appendChild(input);
      input.style.display = "none";
      input.setAttribute("type", "file");
      input.setAttribute("accept", ".json,application/json");
      input.addEventListener("change", function (e) {
        let file = e.target.files[0];
        if (!file) return;
        document.body.removeChild(input);
        /*
          reset in case the same input is ever reused
        */
        input.value = '';
        let reader = new FileReader();
        reader.onload = function () {
          let envelope = null;
          try {
            envelope = JSON.parse(reader.result);
          } catch (error) {
            return window.alert("Import failed! The file is not valid JSON.");
          }
          /*  */
          if (!envelope || envelope.app !== "text-editor" || !envelope.settings) {
            return window.alert("Import failed! This is not a Text Editor settings file.");
          }
          /*  */
          config.backup.apply(envelope.settings, function () {
            /*
              the reload button re-reads every control from storage and
              keeps the unsaved-changes guard intact
            */
            document.getElementById("reload").click();
          });
        };
        /*  */
        reader.readAsText(file);
      });
      /*  */
      input.click();
    }
  },
  "app": {
    "initiate": function () {
      /*
        marks surface type: the window/tab switch button hides in the web
        version, where runtime messaging is absent
      */
      if (typeof chrome === "object" && chrome.runtime && chrome.runtime.id) {
        document.documentElement.setAttribute("app", "extension");
      } else {
        document.documentElement.setAttribute("app", "webapp");
      }
    },
    "start": async function () {
      /*
        suppress panel transitions until the initial layout has settled
      */
      document.body.classList.add("booting");
      /*  */
      for (let id in config.storage.defaults) {
        let valid = config.storage.local[id] !== undefined;
        config.storage.local[id] = valid ? config.storage.local[id] : config.storage.defaults[id];
      }
      /*  */
      config.elements.toggle.left.setAttribute("state", config.storage.local["open-left"]);
      config.elements.toggle.right.setAttribute("state", config.storage.local["open-right"]);
      config.elements.sidebar.left.setAttribute("state", config.storage.local["sidebar-left"]);
      config.elements.sidebar.right.setAttribute("state", config.storage.local["sidebar-right"]);
      /*  */
      let width = parseInt(config.storage.local["sidebar.left.width"]);
      if (Number.isFinite(width) && width >= 200 && width <= window.innerWidth * 0.6) {
        config.elements.sidebar.left.style.width = width + "px";
        config.elements.sidebar.left.style.minWidth = width + "px";
        config.elements.sidebar.left.style.maxWidth = width + "px";
      }
      await config.fileio.init();
      await config.sidebar.render();
      /*  */
      config.listeners.update.info();
      config.listeners.action("left", false);
      config.listeners.action("right", false);
      /*  */
      config.session.startAutoFlush();
      config.autosave.apply();
      /*  */
      window.addEventListener("pagehide", function () {config.session.flush()});
      window.addEventListener("beforeunload", function (e) {
        /*
          with session restore off there is no undo for a lost open, so the
          native leave-confirm appears while unsaved changes remain
        */
        if (config.session.active() === false) {
          if (config.listeners.changed.check.all()) {
            e.preventDefault();
            e.returnValue = '';
          }
        }
        config.session.flush();
      });
      /*  */
      document.addEventListener("visibilitychange", function () {if (document.hidden) config.session.flush()});
      /*
        re-enable panel transitions once the initial layout has settled
      */
      window.setTimeout(function () {
        document.body.classList.remove("booting");
      }, 700);
      /*  */
      if (config.support.fileio.old) {
        let openFolder = document.getElementById("openFolder");
        let container = document.querySelector('.sidebar-left .files-container');
        /*  */
        if (openFolder) openFolder.closest("tr").style.display = "none";
        /*
          the tree reserve derives from the (row-hiding-reduced) button table
        */
        config.sidebar.tree.height(container);
      }
      /*
        firefox turns a shaky press on a tab into a native drag, which cancels
        the pending click - native dnd is not wanted here (sortable reorders via
        mouse events), so suppress dragstart from the tab bar entirely
      */
      config.elements.tabs.addEventListener("dragstart", function (e) {
        if (e.target && e.target.closest && e.target.closest("table")) {
          e.preventDefault();
          if (config.log) console.info("tab dragstart suppressed");
        }
      }, true);
      /*  */
      new Sortable(config.elements.tabs, {
        "delay": 0, 
        "scroll": true, 
        "animation": 300, 
        "scrollSpeed": 100, 
        "bubbleScroll": true, 
        "onEnd": config.sorted,
        "scrollSensitivity": 30,
        "touchStartThreshold": 8
      });
      /*  */
      window.setTimeout(function () {
        if (config.session.active()) {
          config.session.restore().then(function (count) {
            if (!count) document.getElementById("new").click();
            /*
              recovery restore must land in the saved drag order
            */
            config.sidebar.reorder();
          });
        } else {
          document.getElementById("new").click();
        }
      }, 300);
    }
  },
  "load": function () {
    const reset = document.getElementById("reset");
    const uimode = document.getElementById("uimode");
    const reload = document.getElementById("reload");
    const refresh = document.getElementById("refresh");
    const support = document.getElementById("support");
    const donation = document.getElementById("donation");
    const openmode = document.getElementById("openmode");
    /*  */
    reset.addEventListener("click", function () {
      config.reset();
    });
    /*  */
    refresh.addEventListener("click", function () {
      let editor = config.editor[config.storage.local["cmv"]];
      let active = editor ? editor.codemirror[config.current.path] : null;
      if (active) active.refresh();
    });
    /*  */
    support.addEventListener("click", function () {
      const url = config.addon.homepage();
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    donation.addEventListener("click", function () {
      const url = config.addon.homepage() + "?reason=support";
      chrome.tabs.create({"url": url, "active": true});
    }, false);
    /*  */
    openmode.addEventListener("click", function () {
      let mode = document.documentElement.getAttribute("context");
      if (mode === "win") background.send("totab");
      else background.send("towindow");
    });
    /*  */
    uimode.addEventListener("click", function () {
      let current = document.documentElement.getAttribute("theme") === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("theme", current);
      config.storage.write("interface.theme", current);
    });
    /*  */
    reload.addEventListener("click", function () {
      if (config.listeners.changed.check.all()) {
        /*
          confirm must act: cancel stays here, OK proceeds to reload
        */
        let proceed = window.confirm("There are some unsaved changes! Please save all files before reloading the app. Reload anyway?");
        if (proceed === false) return;
      }
      document.location.reload();
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
    /*  */
    chrome.storage.onChanged.addListener(function (e) {
      if ("tabs" in e) config.sorted();
      if ("interface.theme" in e) document.documentElement.setAttribute("theme", e["interface.theme"].newValue || "dark");
    });
    /*  */
    config.elements.toggle.left.addEventListener("click", function () {config.listeners.action("left", true)});
    config.elements.toggle.right.addEventListener("click", function () {config.listeners.action("right", true)});
    /*
      double-clicking the empty area of the tab bar opens a fresh untitled
      file - detected as two presses within 500ms directly on mousedown so it
      works identically in every browser and never fires on a single press
    */
    let blankStamp = 0;
    /*  */
    config.elements.tabs.addEventListener("mousedown", function (e) {
      if (e.target !== config.elements.tabs) return;
      if (e.button !== 0 || e.isTrusted === false) return;
      if (!config.elements.tabs.querySelector("table")) return;
      /*  */
      if (Date.now() - blankStamp < 500) {
        blankStamp = 0;
        if (config.log) console.info("blank tab bar double press -> new file");
        document.getElementById("new").click();
      } else {
        blankStamp = Date.now();
      }
    });
    /*  */
    config.storage.load(function () {
      document.documentElement.setAttribute("theme", config.storage.local["interface.theme"] || "dark");
      config.engine.load(config.app.start);
    });
    /*  */
    window.removeEventListener("load", config.load, false);
  }
};
