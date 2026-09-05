config.support = {
  "fileio": {
    "new": false, 
    "old": false
  }
};

config.remove = function (key, id, callback) {
  config.session.capture();
  if (key && id) {
    chrome.storage.local.get(null, function (e) {
      let storage = {"tabs": e.tabs || {}, "files": e.files || {}, "cursor": e.cursor || {}, "directories": e.directories || {}};
      if (storage[key][id]) delete storage[key][id];
      /*  */
      config.storage.local[key] = storage[key];
      chrome.storage.local.set(storage, callback);
    });
  }
};

config.sorted = function () {
  let sorted = [];
  let tabs = [...config.elements.tabs.querySelectorAll("table")];
  for (let i = 0; i < tabs.length; i++) {
    let id = tabs[i].getAttribute("id");
    if (id) sorted.push(id.replace("tabs-table-for-item-", ''));
  }
  /*  */
  config.storage.local.sorted = sorted;
  chrome.storage.local.set({"sorted": sorted});
};

config.store = function (key, entry) {
  config.session.capture();
  /*  */
  return new Promise(resolve => {
    if (key && entry) {
      chrome.storage.local.get(null, function (e) {
        let storage = {
          "tabs": e.tabs || {}, 
          "files": e.files || {}, 
          "cursor": e.cursor || {}, 
          "directories": e.directories || {}
        };
        /*  */
        if (key === "cursor") storage[key][entry.fullPath] = entry;
        else if (key === "tabs") storage[key][entry.fullPath] = entry.fullPath;
        else storage[key][entry.fullPath] = null;
        /*  */
        config.storage.local[key] = storage[key];
        chrome.storage.local.set(storage, resolve);
      });
    }
  });
};

config.readDirectory = async function (directory) {
  if (directory) {
    if (config.support.fileio.new) {
      for await (let [name, picker] of directory.picker) {
        await config[picker.kind === "file" ? "readFile": "readDirectory"]({
          "picker": picker,
          "isFile": picker.kind === "file",
          "isDirectory": picker.kind === "directory",
          "fullPath": directory.fullPath + '/' + picker.name
        });
      } 
    } else {
      return new Promise(resolve => {
        let lastError = chrome.runtime.lastError;
        let folder = directory.createReader();
        folder.readEntries(async entries => {
          for (let i = 0; i < entries.length; i++) {
            let entry = entries[i];
            /*  */
            if (entry.isFile) await config.readFile(entry);
            else await config.readDirectory(entry);
          }
          /*  */
          resolve();
        });
      });
    }
  }
};

config.saveAs = {
  "old": function () {
    config.save.old({"saveAs": true, "fullPath": config.current.path});
  },
  "new": async function () {
    try {
      let picker = await window.showSaveFilePicker();
      /*  */
      const OLD = config.current.path;
      let writable = await picker.createWritable();
      await writable.write(config.editor[config.storage.local["cmv"]].codemirror[OLD].getValue());
      await writable.close();
      /*  */
      let entry = {
        "isFile": true,
        "picker": picker,
        "isDirectory": false,
        "fullPath": '/' + picker.name
      };
      /*  */
      config.store("files", entry).then(function () {
        config.editor[config.storage.local["cmv"]].remove.codemirror(OLD, true, true);
        config.readFile(entry).then(function (options) {
          let item = document.getElementById(options.fullPath);
          if (item) item.click();
        });
      });
    } catch (e) {
      if (config.log) console.error(e);
    }
  }
};

config.check = {
  "file": {
    "picker": function () {
      let a = window.showOpenFilePicker;
      let b = window.showSaveFilePicker;
      return a !== undefined && b !== undefined;
    }
  },
  "permission": {
    "downloads": function () {
      return new Promise(resolve => {
        try {
          chrome.permissions.contains({"permissions": ["downloads"]}, function (granted) {
            if (granted) resolve(granted);
            else {
              let p = document.createElement("p");
              let div = document.createElement("div");
              let span = document.createElement("span");
              let modal = document.createElement("div");
              /*  */
              span.textContent = "OK";
              p.textContent = "Text Editor extension needs - downloads - permission to be able to read and write text files to disk (in the default download folder). You can change the download folder path via the settings tab in your browser.";
              modal.setAttribute("class", "modal");
              div.setAttribute("class", "modal-window");
              span.addEventListener("click", function () {
                modal.style.display = "none";
                /*  */
                try {
                  chrome.permissions.request({"permissions": ["downloads"]}, function (granted) {
                    resolve(granted);
                  });
                } catch (e) {
                  if (config.log) console.error(e);
                }
              });
              /*  */
              modal.appendChild(div);
              div.appendChild(p);
              div.appendChild(span);
              document.body.appendChild(modal);
            }
          });
        } catch (e) {
          resolve(false);
          if (config.log) console.error(e);
        }
      });
    }
  }
},

config.readFile = function (entry) {  
  if (entry) {
    if (entry.fullPath) {
      if ((entry.fullPath in config.editor[config.storage.local["cmv"]].codemirror) === false) {
        return new Promise(async resolve => {
          if (config.support.fileio.new) {
            let file = await entry.picker.getFile();
            let result = await file.text();
            let options = {
              "result": result,
              "fileType": file.type,
              "fileName": file.name,
              "isFile": entry.isFile,
              "fullPath": entry.fullPath,
              "isDirectory": entry.isDirectory
            };
            /*  */
            config.editor[config.storage.local["cmv"]].create.codemirror(options, function () {
              config.files[entry.fullPath] = {"picker": entry.picker, "fileName": file.name, "fullPath": entry.fullPath, "fileType": file.type};
              if (entry.picker) config.session.idb.put(entry.fullPath, entry.picker);
              resolve(options);
            });
          } else {
            let lastError = chrome.runtime.lastError;
            entry.file(function (file) {
              let reader = new FileReader();
              reader.readAsText(file);
              reader.fileType = file.type;
              reader.fileName = entry.name;
              reader.isFile = entry.isFile;
              reader.fullPath = entry.fullPath;
              reader.isDirectory = entry.isDirectory;
              /*  */
              reader.onload = function (e) {
                let options = {
                  "isFile": e.target.isFile,
                  "result": e.target.result,
                  "fileType": e.target.fileType,
                  "fileName": e.target.fileName,
                  "fullPath": e.target.fullPath,
                  "isDirectory": e.target.isDirectory
                };
                /*  */
                config.editor[config.storage.local["cmv"]].create.codemirror(options, function () {
                  config.files[entry.fullPath] = entry;
                  resolve(options);
                });
              };
            });
          }
        });
      } else {
        let item = document.getElementById(entry.fullPath);
        if (item) item.click();
      }
    }
  }
};

config.save = {
  "savingCount": 0,
  "begin": function () {
    config.save.savingCount++;
    document.body.classList.add("saving-session");
  },
  "end": function () {
    config.save.savingCount = Math.max(0, config.save.savingCount - 1);
    if (config.save.savingCount === 0) {
      document.body.classList.remove("saving-session");
    }
  },
  "indicate": function (path, name, on) {
    let key = path || name;
    let label = "Saving " + (name || key) + " …";
    /* a file shows up in the tab bar and the left tree - flash both rows */
    let targets = [
      document.getElementById("tabs-table-for-item-" + key),
      document.getElementById("sidebar-table-for-item-" + key)
    ];
    /*  */
    targets.forEach(function (table) {
      if (!table) return;
      if (on) {
        table.setAttribute("saving", "");
        table.__savingSince = Date.now();
        if (table.__savingTitle === undefined) table.__savingTitle = table.getAttribute("title");
        table.setAttribute("title", label);
      } else {
        /* keep the saving state visible for at least 1.2s */
        let elapsed = Date.now() - (table.__savingSince || 0);
        let finish = function () {
          table.removeAttribute("saving");
          if (table.__savingTitle !== undefined) {
            if (table.__savingTitle === null) table.removeAttribute("title");
            else table.setAttribute("title", table.__savingTitle);
            delete table.__savingTitle;
          }
        };
        /*  */
        if (elapsed < 1200) {
          window.setTimeout(finish, 1200 - elapsed);
        } else {
          finish();
        }
      }
    });
    /*  */
    let info = document.querySelector(".info");
    if (info) {
      if (on) {
        info.textContent = label;
      } else {
        config.listeners.update.info();
      }
    }
  },
  "legacy": {
    "running": false, /* a save-all batch is in progress (old-mode only) */
    "silent": false,  /* batch mode: suppress per-file alerts, summarize once */
    "failed": [],
    "waiters": {},    /* download id -> settle fn; resolves the save promise */
    "chain": null,    /* serializer: legacy downloads run strictly one at a time */
    "timeout": 20000, /* watchdog: firefox sometimes never emits a terminal event */
    "init": function () {
      if (!config.save.legacy.chain) config.save.legacy.chain = Promise.resolve();
    },
    "push": function (job) {
      config.save.legacy.init();
      let run = config.save.legacy.chain.then(job);
      /* a failed job must not poison the queue */
      config.save.legacy.chain = run.then(function () {}, function () {});
      return run;
    },
    "notify": function (id, ok) { /* terminal event bridge from listeners.downloads */
      let settle = config.save.legacy.waiters[id];
      if (settle) {
        delete config.save.legacy.waiters[id];
        settle(ok);
      }
    },
    "alert": function (name, message) {
      if (!config.save.legacy.silent) {
        window.alert("Saving '" + name + "' failed! (" + message + ")");
      }
    }
  },
  "old": function (entry) {
    /* serialized legacy save; resolves true when the download completed, false otherwise.
       callers may ignore the result - single-save behavior stays fire-and-forget. */
    return config.save.legacy.push(function () {
      return new Promise(function (resolve) {
        const option = {};
        const path = entry.fullPath;
        const name = entry.fileName;
        const table = document.getElementById("sidebar-table-for-item-" + (path || name));
        let result = null;
        try {
          result = config.editor[config.storage.local["cmv"]].codemirror[path].getValue();
        } catch (e) {
          if (config.log) console.warn("legacy save skipped, no editor for", path);
          return resolve(false);
        }
        const type = "fileType" in entry ? entry.fileType : config.options[config.storage.local["cmv"]].codemirror.mode;
        /*  */
        let done = false;
        let watchdog = null;
        let settle = function (ok, why) {
          if (done) return;
          done = true;
          window.clearTimeout(watchdog);
          config.save.indicate(path, name, false);
          URL.revokeObjectURL(config.download.url);
          delete config.save.legacy.waiters[config.download.id];
          /*  */
          if (ok) {
            if (config.log) console.info("legacy save complete:", path);
            return resolve(true);
          }
          /*  */
          if (config.log) console.warn("legacy save FAILED (" + why + ") for", path);
          config.listeners.changed.add({"path": path});
          config.save.legacy.failed.push(name || path);
          config.save.legacy.alert(name || path, why);
          resolve(false);
        };
        /*  */
        config.save.indicate(path, name, true);
        config.download.path = path;
        config.download.name = name;
        config.download.saveAs = "saveAs" in entry ? entry.saveAs : false;
        config.download.url = URL.createObjectURL((new Blob([result], {"type": type})));
        /*  */
        option["url"] = config.download.url;
        option["conflictAction"] = "overwrite";
        option["saveAs"] = config.download.saveAs;
        if (config.download.saveAs === false) option["filename"] = path.replace('/', '');
        /*  */
        if (table) table.options.result = result;
        /* keep the session snapshot in sync with the downloaded copy */
        if (config.session.data && config.session.data.files && config.session.data.files[path] !== undefined) {
          config.session.data.files[path] = result;
          chrome.storage.local.set({"session.data": config.session.data}, function () {});
        }
        /*  */
        config.listeners.changed.remove(path);
        /* watchdog guarantees the saving state can never stick forever */
        watchdog = window.setTimeout(function () {settle(false, "timeout")}, config.save.legacy.timeout);
        /*  */
        chrome.downloads.download(option, function (e) {
          let err = chrome.runtime.lastError;
          if (err || e === undefined) {
            let message = err && err.message ? err.message : "unknown error";
            if (config.log) console.warn("download save failed for " + path + ":", message);
            config.download.id = '';
            return settle(false, message);
          }
          /* register for out-of-order completion/interrupt clearing */
          config.download.pending[e] = {"path": path, "name": name};
          config.save.legacy.waiters[e] = function (ok) {settle(ok, ok ? '' : 'interrupted')};
          config.download.id = e;
        });
      });
    });
  },
  "new": async function (entry) {
    const path = entry.fullPath;
    const name = entry.fileName;
    /*  */
    config.save.begin();
    /*  */
    try {
      if (config.check.file.picker()) {
        if (path in config.editor[config.storage.local["cmv"]].codemirror) {
          const picker = entry.picker;
          if (picker) {
            try {
              config.save.indicate(path, name, true);
              const writable = await picker.createWritable();
              const table = document.getElementById("sidebar-table-for-item-" + (path || name));
              const result = config.editor[config.storage.local["cmv"]].codemirror[path].getValue();
              await writable.write(result);
              await writable.close();
              /*  */
              if (typeof entry.picker.getFile === "function") { // verify the write landed on disk (cheap byte-size check, no full re-read)
                let check = await entry.picker.getFile();
                let expected = new Blob([result]).size;
                if (check.size !== expected) {
                  window.alert("Saving '" + (name || path) + "' failed! The file on disk was not updated.");
                  if (config.log) console.warn("save VERIFICATION FAILED for " + path + ": disk size " + check.size + ", expected " + expected);
                  config.save.indicate(path, name, false);
                  config.listeners.changed.add({"path": path});
                  return;
                }
              }
              /*  */
              if (config.log) console.info("save: disk write verified | bytes:", new Blob([result]).size);
              /*  */
              if (table) table.options.result = result;
              /*  */
              if (config.session.data && config.session.data.files) { // keep the session snapshot in sync with the disk save
                config.session.data.files[path] = result;
                chrome.storage.local.set({"session.data": config.session.data}, function () {
                  //
                });
              }
              /*  */
              config.save.indicate(path, name, false);
              config.listeners.changed.remove(path);
            } catch (e) {
              /* surface the failure and re-mark the file as unsaved */
              config.save.indicate(path, name, false);
              if (config.log) console.warn("save failed for " + path + ":", e && e.message ? e.message : e);
              window.alert("Saving '" + (name || path) + "' failed! " + (e && e.message ? "(" + e.message + ")" : ""));
              config.listeners.changed.add({"path": path});
            }
          } else if (entry.session) {
            /* session-restored file: persist content back into the session snapshot */
            config.save.indicate(path, name, true);
            const result = config.editor[config.storage.local["cmv"]].codemirror[path].getValue();
            if (config.session.data && config.session.data.files) {
              config.session.data.files[path] = result;
              chrome.storage.local.set({"session.data": config.session.data}, function () {});
            }
            /*  */
            config.save.indicate(path, name, false);
            config.listeners.changed.remove(path);
          } else {
            /* no handle (lost after restart / old-mode entry): download a copy */
            config.save.old(entry);
          }
        }
      }
    } finally {
      config.save.end();
    }
  }
};

config.fileio = {
  "init": async function () {
    config.support.fileio.new = config.check.file.picker();
    config.support.fileio.old = config.support.fileio.new ? false : await config.check.permission.downloads();
    if (config.log) console.info("fileio mode:", config.support.fileio.new ? "new (file handles)" : "old (downloads)", "| showSaveFilePicker:", typeof window.showSaveFilePicker);
    /*  */
    if (config.support.fileio.old) {
      if (chrome.downloads) {
        let registered = chrome.downloads.onChanged.hasListener(config.listeners.downloads);
        if (registered === false) chrome.downloads.onChanged.addListener(config.listeners.downloads);
      }
    }
  },
  "action": async function () {
    let id = this.getAttribute("id");  
    /*  */
    if (id === "openSettings") {
      document.querySelector(".open-right").click();
    }
    else if (id === "saveAs") {
      config.saveAs[config.support.fileio.new ? "new" : "old"]();
    }
    else if (id === "saveAll") {
      let cmv = config.storage.local["cmv"];
      let editor = config.editor[cmv];
      if (editor === undefined) return;
      /*  */
      let list = [];
      for (let name in config.files) {
        if (editor.codemirror[name]) {
          if (config.listeners.changed.check.item(name)) list.push(config.files[name]);
        }
      }
      /*  */
      if (config.support.fileio.new) { /* picker mode: independent concurrent writes */
        list.forEach(function (entry) {
          config.save.new(entry);
        });
      } else if (list.length) { /* legacy mode: firefox only services one download at a time */
        if (config.save.legacy.running) {
          if (config.log) console.info("save all skipped, a legacy batch is already running");
          return;
        }
        config.save.legacy.running = true;
        config.save.legacy.silent = true;
        config.save.legacy.failed = [];
        if (config.log) console.info("save all (legacy): saving", list.length, "file(s), serialized");
        /*  */
        let chain = Promise.resolve();
        list.forEach(function (entry) {
          chain = chain.then(function () {
            return config.save.old(entry);
          });
        });
        /*  */
        chain.then(function () {
          config.save.legacy.running = false;
          config.save.legacy.silent = false;
          let failed = config.save.legacy.failed.length;
          if (failed) window.alert(failed + " of " + list.length + " file(s) failed to save!");
          config.save.legacy.failed = [];
          if (config.log) console.info("save all (legacy) finished");
        });
      }
    }
    else if (id === "save") {
      if (config.current.path) {
        let entry = config.files[config.current.path];
        if (entry) {
          config.save[config.support.fileio.new ? "new" : "old"](entry);
        } else {
          config.saveAs[config.support.fileio.new ? "new" : "old"]();
        }
      }
    }
    else if (id === "new") {
      let options = {
        "result": '',
        "fileType": '',
        "fullPath": '',
        "isFile": true,
        "isDirectory": false,
        "fileName": "untitled" + config.count++
      };
      /*  */ 
      config.editor[config.storage.local["cmv"]].create.codemirror(options, function () {
        let item = document.getElementById(options.fileName);
        if (item) item.click();
      });
    }
    else if (id === "openFolder") {
      if (config.support.fileio.new) {
        try {
          let picker = await window.showDirectoryPicker();
          let entry = {
            "isFile": false,
            "picker": picker,
            "isDirectory": true,
            "fullPath": '/' + picker.name
          };
          /*  */
          config.directories[entry.fullPath] = entry;
          config.store("directories", entry).then(function () {
            config.readDirectory(entry);
          });
        } catch (e) {
          if (config.log) console.error(e);
        }
      }
    }
    else if (id === "open") {
      if (config.support.fileio.new) {
        try {
          let [picker] = await window.showOpenFilePicker();
          /*  */
          let file = await picker.getFile();
          if (!file) return;
          /*  */
          let result = await file.text();
          let fullPath = '/' + file.name;
          config.files[fullPath] = {"picker": picker, "fileName": file.name, "fullPath": fullPath, "fileType": file.type};
          config.editor[config.storage.local["cmv"]].create.codemirror({
            "isFile": true,
            "result": result,
            "isDirectory": false,
            "fileType": file.type,
            "fileName": file.name,
            "fullPath": fullPath
          }, function () {
            let item = document.getElementById(fullPath);
            if (item) item.click();
          });
        } catch (e) {
          if (config.log) console.error(e);
        }
      } else {
        let input = document.createElement("input");
        document.body.appendChild(input);
        input.style.display = "none";
        input.type = "file";
        input.click();
        /*  */
        input.addEventListener("change", function (e) {
          let file = e.target.files[0];
          if (!file) return;
          /*  */
          let tmp = e.target.value.substring(e.target.value.indexOf('\\') >= 0 ? e.target.value.lastIndexOf('\\') : e.target.value.lastIndexOf('/'));
          if (tmp.indexOf('\\') === 0 || tmp.indexOf('/') === 0) tmp = tmp.substring(1);
          let fileName = tmp ? tmp : config.make.random.name();
          /*  */
          document.body.removeChild(input);
          let fileType = file.type;
          let reader = new FileReader();
          /*  */
          reader.readAsText(file);
          reader.onload = function(e) {
            let result = e.target.result;
            let fullPath = '/' + fileName;
            config.files[fullPath] = {"picker": null, "fileName": fileName, "fullPath": fullPath, "fileType": fileType};
            config.editor[config.storage.local["cmv"]].create.codemirror({
              "isFile": true,
              "result": result,
              "isDirectory": false,
              "fileType": fileType,
              "fileName": fileName,
              "fullPath": fullPath
            }, function () {
              let item = document.getElementById(fullPath);
              if (item) item.click();
            });
          };
        });
      }
    }
    else {
      /* files */
    }
  }
};
