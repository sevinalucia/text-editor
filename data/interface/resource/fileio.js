config.support = {
  "fileio": {
    "new": false, 
    "old": false
  }
};

config.remove = function (key, id, callback) {
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
      //console.error(e);
    }
  }
};

config.save = {
  "new": async function (entry) {
    const path = entry.fullPath;
    const name = entry.fileName;
    /*  */
    if (config.check.file.picker()) {
      if (path in config.editor[config.storage.local["cmv"]].codemirror) {
        const picker = entry.picker;
        if (picker) {
          try {
            const writable = await picker.createWritable();
            const table = document.getElementById("sidebar-table-for-item-" + (path || name));
            const result = config.editor[config.storage.local["cmv"]].codemirror[path].getValue();
            await writable.write(result);
            await writable.close();
            /*  */
            if (table) table.options.result = result;
            config.listeners.changed.remove(path);
          } catch (e) {
            //console.error(e);
          }
        }
      }
    }
  },
  "old": function (entry) {
    const option = {};
    const path = entry.fullPath;
    const name = entry.fileName;
    const table = document.getElementById("sidebar-table-for-item-" + (path || name));
    const result = config.editor[config.storage.local["cmv"]].codemirror[path].getValue();
    const type = "fileType" in entry ? entry.fileType : config.options[config.storage.local["cmv"]].codemirror.mode;
    /*  */
    config.download.id = '';
    config.download.saveAs = "saveAs" in entry ? entry.saveAs : false;
    config.download.url = URL.createObjectURL((new Blob([result], {"type": type})));
    /*  */
    /*  */
    option["url"] = config.download.url;
    option["conflictAction"] = "overwrite";
    option["saveAs"] = config.download.saveAs;
    if (config.download.saveAs === false) option["filename"] = path.replace('/', '');
    /*  */
    if (table) table.options.result = result;
    config.listeners.changed.remove(path);
    chrome.downloads.download(option, function (e) {
      config.download.id = e;
    });
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
                } catch (e) {}
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

config.fileio = {
  "init": async function () {
    config.support.fileio.new = config.check.file.picker();
    config.support.fileio.old = config.support.fileio.new ? false : await config.check.permission.downloads();
    
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
      for (let name in config.files) {
        if (config.editor[config.storage.local["cmv"]].codemirror[name]) {
          config.save[config.support.fileio.new ? "new" : "old"](config.files[name]);
        }
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
        } catch (e) {}
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
        } catch (e) {}
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
    else {/* files */}
  }
};