var app = {};

app.id = {"main": '', "parent": ''};
app.version = function () {return chrome.runtime.getManifest().version};
app.homepage = function () {return chrome.runtime.getManifest().homepage_url};
app.tab = {"open": function (url) {chrome.tabs.create({"url": url, "active": true})}};

if (!navigator.webdriver) {
  chrome.runtime.setUninstallURL(app.homepage() + "?v=" + app.version() + "&type=uninstall", function () {});
  chrome.runtime.onInstalled.addListener(function (e) {
    chrome.management.getSelf(function (result) {
      if (result.installType === "normal") {
        window.setTimeout(function () {
          var previous = e.previousVersion !== undefined && e.previousVersion !== app.version();
          if (e.reason === "install" || (e.reason === "update" && previous)) {
            var parameter = (e.previousVersion ? "&p=" + e.previousVersion : '') + "&type=" + e.reason;
            app.tab.open(app.homepage() + "?v=" + app.version() + parameter);
          }
        }, 3000);
      }
    });
  });
}

app.storage = (function () {
  var objs = {};
  window.setTimeout(function () {
    chrome.storage.local.get(null, function (o) {objs = o});
  }, 0);
  /*  */
  return {
    "read": function (id) {return objs[id]},
    "write": function (id, data) {
      var tmp = {};
      tmp[id] = data;
      objs[id] = data;
      chrome.storage.local.set(tmp, function () {});
    }
  }
})();

app.interface = {
  "create": function () {
    var options = {"top": null, "left": null,"width": 970, "height": 650};
    chrome.storage.local.get(options, function (storage) {
      chrome.windows.getCurrent(function (win) {
        app.id.parent = win.id;
        var width = storage.width;
        var height = storage.height;
        var url = chrome.runtime.getURL("data/interface/index.html");
        var top = storage.top !== null ? storage.top : win.top + Math.round((win.height - height) / 2);
        var left = storage.left !== null ? storage.left : win.left + Math.round((win.width - width) / 2);
        chrome.windows.create({"url": url, "type": "popup", "width": width, "height": height, "top": top, "left": left}, function (w) {
          app.id.main = w.id;
        });
      });
    });
  }
};

chrome.windows.onRemoved.addListener(function (e) {if (e === app.id.main) {app.id.main = null}});
chrome.browserAction.onClicked.addListener(function () {app.id.main ? chrome.windows.update(app.id.main, {"focused": true}) : app.interface.create()});
