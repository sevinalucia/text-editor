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
      /*
        the "files"/"directories" maps store null markers - a truthiness
        check could never delete them, so test key presence instead
      */
      if (id in storage[key]) delete storage[key][id];
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

config.linebreak = {
  /*
    a BOM never survives readAsText/blob.text() (utf-8 decode strips it),
    so its presence is sniffed from the first three bytes of the file
  */
  "head": function (file) {
    return new Promise(resolve => {
      try {
        file.slice(0, 3).arrayBuffer().then(function (buffer) {
          let head = new Uint8Array(buffer);
          resolve(head.length === 3 && head[0] === 239 && head[1] === 187 && head[2] === 191);
        }, function () {resolve(false)});
      } catch (e) {
        resolve(false);
      }
    });
  },
  "detect": function (text) {
    return text.indexOf("\r\n") !== -1 ? "crlf" : "lf";
  },
  "apply": function (text, eol, bom) {
    let has = bom === undefined ? text.charCodeAt(0) === 0xFEFF : bom;
    let result = text;
    if (eol === "crlf") result = result.replace(/\r\n/g, "\n").replace(/\n/g, "\r\n");
    else if (eol === "lf") result = result.replace(/\r\n/g, "\n");
    result = result.replace(/^\uFEFF/, '');
    return has ? "\uFEFF" + result : result;
  }
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
        let folder = directory.createReader();
        /*
          readEntries caps at ~100 entries per call - loop until it returns
          an empty batch or folders silently lose files
        */
        let batch = [];
        let drain = function () {
          folder.readEntries(async entries => {
            if (!entries.length) {
              for (let i = 0; i < batch.length; i++) {
                let entry = batch[i];
                /*  */
                if (entry.isFile) await config.readFile(entry);
                else await config.readDirectory(entry);
              }
              /*  */
              batch = [];
              return resolve();
            }
            /*  */
            batch = batch.concat(entries);
            drain();
          }, async () => {
            for (let i = 0; i < batch.length; i++) {
              let entry = batch[i];
              /*  */
              if (entry.isFile) await config.readFile(entry);
              else await config.readDirectory(entry);
            }
            /*  */
            batch = [];
            resolve();
          });
        };
        /*  */
        drain();
      });
    }
  }
};

config.saveAs = {
  "old": function () {
    /*
      a copy of the store entry rides along so eol/bom/fileName survive
      the dialog - same formatting carry-over as the picker saveAs
    */
    let store = config.files[config.current.path];
    let entry = store ? Object.assign({}, store, {"saveAs": true}) : {"saveAs": true, "fullPath": config.current.path};
    config.save.old(entry);
  },
  "new": async function () {
    try {
      let picker = await window.showSaveFilePicker();
      /*  */
      const OLD = config.current.path;
      /*
        the copy keeps the source formatting (eol/bom carry-over)
      */
      let source = config.files[OLD];
      let eol = source && source.eol;
      let bom = source && source.bom;
      let value = config.editor[config.storage.local["cmv"]].codemirror[OLD].getValue();
      let safe = config.linebreak.apply(value, eol, bom);
      /*  */
      let writable = await picker.createWritable();
      await writable.write(safe);
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
          /*
            every failure path must land in resolve() or the awaiting
            reader hangs forever - picker calls throw, creates can throw
          */
          try {
            if (config.support.fileio.new) {
              let file = await entry.picker.getFile();
              let result = await file.text();
              let bom = await config.linebreak.head(file);
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
                config.files[entry.fullPath] = {
                  "picker": entry.picker,
                  "fileName": file.name,
                  "fullPath": entry.fullPath,
                  "fileType": file.type,
                  "eol": config.linebreak.detect(result),
                  "bom": bom
                };
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
                  config.linebreak.head(file).then(function (bom) {
                    entry.eol = config.linebreak.detect(e.target.result);
                    entry.bom = bom;
                    config.editor[config.storage.local["cmv"]].create.codemirror(options, function () {
                      config.files[entry.fullPath] = entry;
                      resolve(options);
                    });
                  });
                };
              }, function () {resolve(null)});
            }
          } catch (error) {
            if (config.log) console.error(error);
            resolve(null);
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
    /*
      a file shows up in the tab bar and the left tree - flash both rows
    */
    let targets = [
      document.getElementById("tabs-table-for-item-" + key),
      document.getElementById("sidebar-table-for-item-" + key)
    ];
    /*  */
    targets.forEach(function (table) {
      if (!table) return;
      /*  */
      if (on) {
        table.setAttribute("saving", "");
        table.__savingSince = Date.now();
        if (table.__savingTitle === undefined) table.__savingTitle = table.getAttribute("title");
        table.setAttribute("title", label);
      } else {
        /*
          keep the saving state visible for at least 1.2s
        */
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
    /*
      a save-all batch is in progress (old-mode only)
    */
    "running": false,
    /*
      batch mode: suppress per-file alerts, summarize once
    */
    "silent": false,
    "failed": [],
    /*
      download id -> settle fn; resolves the save promise
    */
    "waiters": {},
    /*
      serializer: legacy downloads run strictly one at a time
    */
    "chain": null,
    /*
      watchdog: firefox sometimes never emits a terminal event
    */
    "timeout": 20000,
    "init": function () {
      if (!config.save.legacy.chain) config.save.legacy.chain = Promise.resolve();
    },
    "push": function (job) {
      config.save.legacy.init();
      let run = config.save.legacy.chain.then(job);
      /*
        a failed job must not poison the queue
      */
      config.save.legacy.chain = run.then(function () {}, function () {});
      return run;
    },
    /*
      terminal event bridge from listeners.downloads
    */
    "notify": function (id, ok) {
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
    /*
      serialized legacy save; resolves true when the download completed, false otherwise.
      callers may ignore the result - single-save behavior stays fire-and-forget.
    */
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
        let raw = result;
        const type = "fileType" in entry ? entry.fileType : config.options[config.storage.local["cmv"]].codemirror.mode;
        /*
          the disk copy gets back the file's original line endings and BOM
        */
        result = config.linebreak.apply(result, entry.eol, entry.bom);
        /*  */
        let done = false;
        let watchdog = null;
        /*
          the job owns its blob url and waiter slot - the globals may already
          point at the NEXT queued job when a stuck save settles late
        */
        let jobUrl = null;
        let waitersId = null;
        let settle = function (ok, why) {
          if (done) return;
          done = true;
          window.clearTimeout(watchdog);
          config.save.indicate(path, name, false);
          if (jobUrl !== null) URL.revokeObjectURL(jobUrl);
          if (waitersId !== null) delete config.save.legacy.waiters[waitersId];
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
        jobUrl = config.download.url;
        /*  */
        option["url"] = config.download.url;
        option["conflictAction"] = "overwrite";
        option["saveAs"] = config.download.saveAs;
        if (config.download.saveAs === false) option["filename"] = path.replace('/', '');
        /*  */
        if (table) table.options.result = result;
        /*
          keep the session snapshot in sync with the downloaded copy -
          every snapshot writer stores editor content (line endings stay
          normalized there, the download carries them instead)
        */
        if (config.session.data && config.session.data.files && config.session.data.files[path] !== undefined) {
          config.session.data.files[path] = raw;
          chrome.storage.local.set({"session.data": config.session.data}, function () {});
        }
        /*  */
        config.listeners.changed.remove(path);
        /*
          watchdog guarantees the saving state can never stick forever
        */
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
          /*
            register for out-of-order completion/interrupt clearing; the url
            rides in the pending entry so late events revoke their own blob
          */
          waitersId = e;
          config.download.pending[e] = {"path": path, "name": name, "url": jobUrl};
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
              /*
                the disk copy gets back the file's original line endings and BOM
              */
              const safe = config.linebreak.apply(result, entry.eol, entry.bom);
              await writable.write(safe);
              await writable.close();
              /*  */
              /*
                verify the write landed on disk (cheap byte-size check, no full re-read)
              */
              if (typeof entry.picker.getFile === "function") {
                let check = await entry.picker.getFile();
                let expected = new Blob([safe]).size;
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
              /*
                keep the session snapshot in sync with the disk save
              */
              if (config.session.data && config.session.data.files) {
                config.session.data.files[path] = result;
                chrome.storage.local.set({"session.data": config.session.data}, function () {
                  //
                });
              }
              /*  */
              config.save.indicate(path, name, false);
              config.listeners.changed.remove(path);
            } catch (e) {
              /*
                surface the failure and re-mark the file as unsaved
              */
              config.save.indicate(path, name, false);
              if (config.log) console.warn("save failed for " + path + ":", e && e.message ? e.message : e);
              window.alert("Saving '" + (name || path) + "' failed! " + (e && e.message ? "(" + e.message + ")" : ""));
              config.listeners.changed.add({"path": path});
            }
          } else if (entry.session) {
            /*
              session-restored file: persist content back into the session snapshot;
              outside a live snapshot there is no save target - the dot stays on
            */
            config.save.indicate(path, name, true);
            const result = config.editor[config.storage.local["cmv"]].codemirror[path].getValue();
            if (config.session.data && config.session.data.files) {
              config.session.data.files[path] = result;
              chrome.storage.local.set({"session.data": config.session.data}, function () {});
              /*  */
              config.listeners.changed.remove(path);
            }
            /*  */
            config.save.indicate(path, name, false);
          } else {
            /*
              no handle (lost after restart / old-mode entry): download a copy
            */
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
    } else if (id === "exportSettings") {
      config.backup.export();
    } else if (id === "importSettings") {
      config.backup.import();
    } else if (id === "saveAs") {
      config.saveAs[config.support.fileio.new ? "new" : "old"]();
    } else if (id === "saveAll") {
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
      /*
        picker mode: independent concurrent writes
      */
      if (config.support.fileio.new) {
        list.forEach(function (entry) {
          config.save.new(entry);
        });
      /*
        legacy mode: firefox only services one download at a time
      */
      } else if (list.length) {
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
    } else if (id === "save") {
      if (config.current.path) {
        let entry = config.files[config.current.path];
        if (entry) {
          config.save[config.support.fileio.new ? "new" : "old"](entry);
        } else {
          config.saveAs[config.support.fileio.new ? "new" : "old"]();
        }
      }
    } else if (id === "new") {
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
    } else if (id === "openFolder") {
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
    } else if (id === "open") {
      if (config.support.fileio.new) {
        try {
          let [picker] = await window.showOpenFilePicker();
          /*  */
          let entry = {
            "isFile": true,
            "picker": picker,
            "isDirectory": false,
            "fullPath": '/' + picker.name
          };
          /*
            the readFile route detects eol/bom and persists the handle -
            a manual mirror drifts (dots, idb, create callbacks)
          */
          let options = await config.readFile(entry);
          if (options) {
            let item = document.getElementById(options.fullPath);
            if (item) item.click();
          }
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
            /*
              the input File has no entry.file() bridge, so the BOM is
              sniffed straight from the blob like readFile does
            */
            config.linebreak.head(file).then(function (bom) {
              config.files[fullPath] = {"picker": null, "fileName": fileName, "fullPath": fullPath, "fileType": fileType, "eol": config.linebreak.detect(result), "bom": bom};
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
            });
          };
        });
      }
    } else {
      /*
        files
      */
    }
  }
};
