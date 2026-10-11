var core = {
  "start": function () {
    core.load();
  },
  "install": function () {
    core.load();
  },
  "load": function () {
    app.interface.id = '';
  },
  "action": {
    "storage": function (changes, namespace) {
      /*  */
    },
    "removed": function (e) {
      if (e === app.interface.id) {
        app.interface.id = '';
      }
    },
    "tab": {
      "totab": function () {
        app.window.query.normal(function (windows) {
          let properties = {"url": app.interface.path, "active": true};
          let focused = windows && windows.length ? windows.find(function (win) {return win.focused}) : null;
          if (!focused) focused = windows && windows.length ? windows[0] : null;
          if (focused) properties.windowId = focused.id;
          app.tab.create(properties, function () {
            if (app.interface.id) app.window.remove(app.interface.id, function () {
              app.interface.id = '';
            });
          });
        });
      },
      "towindow": function (data, sender) {
        if (sender && sender.tab) {
          app.tab.remove(sender.tab.id, function () {
            setTimeout(function () {
              app.interface.create(app.interface.path + "?win");
            }, 250);
          });
        }
      }
    },
    "button": function () {
      if (app.interface.id) {
        app.window.get(app.interface.id, function (win) {
          if (win) {
            app.window.update(app.interface.id, {"focused": true});
          } else {
            app.interface.id = '';
            app.interface.create();
          }
        });
      } else {
        app.interface.create(app.interface.path + "?win");
      }
    }
  }
};

app.button.on.clicked(core.action.button);
app.window.on.removed(core.action.removed);
app.interface.receive("totab", core.action.tab.totab);
app.interface.receive("towindow", core.action.tab.towindow);

app.on.startup(core.start);
app.on.installed(core.install);
app.on.storage(core.action.storage);
