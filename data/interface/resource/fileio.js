config.init = async function () {
  config.support.fileio.new = config.check.file.picker();
  config.support.fileio.old = config.support.fileio.new ? false : await config.check.permission.downloads();
  /*  */
  if (config.support.fileio.old) {
    var registered = chrome.downloads.onChanged.hasListener(config.listeners.downloads);
    if (registered === false) chrome.downloads.onChanged.addListener(config.listeners.downloads);
  }
};

config.remove = function (key, id, callback) {
  if (key && id) {
    chrome.storage.local.get(null, function (e) {
      var storage = {"tabs": e.tabs || {}, "files": e.files || {}, "cursor": e.cursor || {}, "directories": e.directories || {}};
      if (storage[key][id]) delete storage[key][id];
      /*  */
      config.storage.object[key] = storage[key];
      chrome.storage.local.set(storage, callback);
    });
  }
};

config.sorted = function () {
  var sorted = [];
  var tabs = [...config.elements.tabs.querySelectorAll("table")];
  for (var i = 0; i < tabs.length; i++) {
    var id = tabs[i].getAttribute("id");
    if (id) sorted.push(id.replace("tabs-table-for-item-", ''));
  }
  /*  */
  config.storage.object.sorted = sorted;
  chrome.storage.local.set({"sorted": sorted}, function () {});
};

config.store = function (key, entry) {
  return new Promise(resolve => {
    if (key && entry) {
      chrome.storage.local.get(null, function (e) {
        var storage = {
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
        config.storage.object[key] = storage[key];
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
    var picker = await window.showSaveFilePicker();
    try {
      const OLD = config.current.path;
      var writable = await picker.createWritable();
      await writable.write(config.editor.codemirror[OLD].getValue());
      await writable.close();
      /*  */
      var entry = {
        "isFile": true,
        "picker": picker,
        "isDirectory": false,
        "fullPath": '/' + picker.name
      };
      /*  */
      config.store("files", entry).then(function () {
        config.editor.remove.codemirror(OLD, true, true);
        config.readFile(entry).then(function (options) {
          var item = document.getElementById(options.fullPath);
          if (item) item.click();
        });
      });
    } catch (e) {}
  }
};

config.save = {
  "new": async function (entry) {
    var path = entry.fullPath;
    if (config.check.file.picker()) {
      if (path in config.editor.codemirror) {
        var picker = entry.picker;
        try {
          var writable = await picker.createWritable();
          await writable.write(config.editor.codemirror[path].getValue());
          await writable.close();
          config.listeners.changed.remove(path);
        } catch (e) {}
      }
    }
  },
  "old": function (entry) {
    var option = {};
    config.download.id = '';
    config.download.saveAs = "saveAs" in entry ? entry.saveAs : false;
    var text = config.editor.codemirror[entry.fullPath].getValue();
    var type = "fileType" in entry ? entry.fileType : config.options.codemirror.mode;
    config.download.url = URL.createObjectURL((new Blob([text], {"type": type})));
    /*  */
    option["url"] = config.download.url;
    option["conflictAction"] = "overwrite";
    option["saveAs"] = config.download.saveAs;
    if (config.download.saveAs === false) option["filename"] = entry.fullPath.replace('/', '');
    /*  */
    config.listeners.changed.remove(entry.fullPath);
    chrome.downloads.download(option, function (e) {
      config.download.id = e;
    });
  }
};

config.readDirectory = async function (directory) {
  if (directory) {
    if (config.support.fileio.new) {
      for await (var [name, picker] of directory.picker) {
        await config[picker.kind === "file" ? "readFile": "readDirectory"]({
          "picker": picker,
          "isFile": picker.kind === "file",
          "isDirectory": picker.kind === "directory",
          "fullPath": directory.fullPath + '/' + picker.name
        });
      } 
    } else {
      return new Promise(resolve => {
        var lastError = chrome.runtime.lastError;
        var folder = directory.createReader();
        folder.readEntries(async entries => {
          for (var i = 0; i < entries.length; i++) {
            var entry = entries[i];
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

config.readFile = function (entry) {  
  if (entry) {
    if (entry.fullPath) {
      if ((entry.fullPath in config.editor.codemirror) === false) {
        return new Promise(async resolve => {
          if (config.support.fileio.new) {
            var file = await entry.picker.getFile();
            var result = await file.text();
            var options = {
              "result": result,
              "fileType": file.type,
              "fileName": file.name,
              "isFile": entry.isFile,
              "fullPath": entry.fullPath,
              "isDirectory": entry.isDirectory
            };
            /*  */
            config.editor.create.codemirror(options, function () {
              config.files[entry.fullPath] = {"picker": entry.picker, "fileName": file.name, "fullPath": entry.fullPath, "fileType": file.type};
              resolve(options);
            });
          } else {
            var lastError = chrome.runtime.lastError;
            entry.file(function (file) {
              var reader = new FileReader();
              reader.readAsText(file);
              reader.fileType = file.type;
              reader.fileName = entry.name;
              reader.isFile = entry.isFile;
              reader.fullPath = entry.fullPath;
              reader.isDirectory = entry.isDirectory;
              /*  */
              reader.onload = function (e) {
                var options = {
                  "isFile": e.target.isFile,
                  "result": e.target.result,
                  "fileType": e.target.fileType,
                  "fileName": e.target.fileName,
                  "fullPath": e.target.fullPath,
                  "isDirectory": e.target.isDirectory
                };
                /*  */
                config.editor.create.codemirror(options, function () {
                  config.files[entry.fullPath] = entry;
                  resolve(options);
                });
              };
            });
          }
        });
      } else {
        var item = document.getElementById(entry.fullPath);
        if (item) item.click();
      }
    }
  }
};

config.fileio = async function (e) {
  var id = e.target.getAttribute("id");
  /*  */
  if (id === "openSettings") {
    document.querySelector(".open-right").click();
  }
  else if (id === "saveAs") {
    config.saveAs[config.support.fileio.new ? "new" : "old"]();
  }
  else if (id === "saveAll") {
    for (var name in config.files) {
      if (config.editor.codemirror[name]) {
        config.save[config.support.fileio.new ? "new" : "old"](config.files[name]);
      }
    }
  }
  else if (id === "save") {
    if (config.current.path) {
      var entry = config.files[config.current.path];
      if (entry) config.save[config.support.fileio.new ? "new" : "old"](entry);
      else config.saveAs[config.support.fileio.new ? "new" : "old"]();
    }
  }
  else if (id === "new") {
    var options = {
      "result": '',
      "fileType": '',
      "fullPath": '',
      "isFile": true,
      "isDirectory": false,
      "fileName": "untitled" + config.count++
    };
    /*  */ 
    config.editor.create.codemirror(options, function () {
      var item = document.getElementById(options.fileName);
      if (item) item.click();
    });
  }
  else if (id === "openFolder") {
    if (config.support.fileio.new) {
      var picker = await window.showDirectoryPicker();
      var entry = {
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
    }
  }
  else if (id === "open") {
    if (config.support.fileio.new) {
      var [picker] = await window.showOpenFilePicker();
      try {
        var file = await picker.getFile();
        if (!file) return;
        /*  */      
        var result = await file.text();
        var fullPath = '/' + file.name;
        config.files[fullPath] = {"picker": picker, "fileName": file.name, "fullPath": fullPath, "fileType": file.type};
        config.editor.create.codemirror({
          "isFile": true,
          "result": result,
          "isDirectory": false,
          "fileType": file.type,
          "fileName": file.name,
          "fullPath": fullPath
        }, function () {
          var item = document.getElementById(fullPath);
          if (item) item.click();
        });
      } catch (e) {}
    } else {
    	var input = document.createElement("input");
      document.body.appendChild(input);
      input.style.display = "none";
      input.type = "file";
      input.click();
      /*  */
      input.addEventListener("change", function (e) {
        var file = e.target.files[0];
        if (!file) return;
        /*  */
        var tmp = e.target.value.substring(e.target.value.indexOf('\\') >= 0 ? e.target.value.lastIndexOf('\\') : e.target.value.lastIndexOf('/'));
        if (tmp.indexOf('\\') === 0 || tmp.indexOf('/') === 0) tmp = tmp.substring(1);
        var fileName = tmp ? tmp : config.make.random.name();
        /*  */
        document.body.removeChild(input);
        var fileType = file.type;
        var reader = new FileReader();
        reader.readAsText(file);
        reader.onload = function(e) {
          var result = e.target.result;
          var fullPath = '/' + fileName;
          config.files[fullPath] = {"picker": null, "fileName": fileName, "fullPath": fullPath, "fileType": fileType};
          config.editor.create.codemirror({
            "isFile": true,
            "result": result,
            "isDirectory": false,
            "fileType": fileType,
            "fileName": fileName,
            "fullPath": fullPath
          }, function () {
            var item = document.getElementById(fullPath);
            if (item) item.click();
          });
        };
      });
    }
  }
  else {/* files */}
};

config.init();