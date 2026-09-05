config.options.v6 = {
  "keyMap": [
    "default"
  ],
  "scrollbarStyle": [
    "default"
  ],
  "editor": {
    "new": undefined,
    "open": undefined,
    "save": undefined,
    "saveAs": undefined,
    "saveAll": undefined,
    "openFolder": undefined,
    "openSettings": undefined
  },
  "theme": [
    "default",
    "dark"
  ],
  "mode": (function () {
    let items = CodeMirror6.languages.map(function (d) {return d.name});
    items.push("Plain Text");
    return config.sort.array(items);
  })(),
  "excluded": {
    "intelliSense": {
      "trigger": {
        "keys": {
          "8": "backspace",
          "9": "tab",
          "13": "enter",
          "16": "shift",
          "17": "ctrl",
          "18": "alt",
          "19": "pause",
          "20": "capslock",
          "27": "escape",
          "33": "pageup",
          "34": "pagedown",
          "35": "end",
          "36": "home",
          "37": "left",
          "38": "up",
          "39": "right",
          "40": "down",
          "45": "insert",
          "46": "delete",
          "67": "c",
          "83": "s",
          "86": "v",
          "90": "z",
          "91": "left window key",
          "92": "right window key",
          "93": "select",
          "107": "add",
          "109": "subtract",
          "110": "decimal point",
          "111": "divide",
          "112": "f1",
          "113": "f2",
          "114": "f3",
          "115": "f4",
          "116": "f5",
          "117": "f6",
          "118": "f7",
          "119": "f8",
          "120": "f9",
          "121": "f10",
          "122": "f11",
          "123": "f12",
          "144": "numlock",
          "145": "scrolllock",
          "186": "semicolon",
          "187": "equalsign",
          "188": "comma",
          "189": "dash",
          "191": "slash",
          "192": "graveaccent",
          "220": "backslash",
          "222": "quote"
        }
      }
    }
  },
  "unsupported": [
    "matchTag",
    "fixedGutter",
    "smartIndent",
    "cursorHeight",
    "pollInterval",
    "flattenSpans",
    "electricChars",
    "viewportMargin",
    "cursorBlinkRate",
    "historyEventDelay",
    "lineWiseCopyCut",
    "maxHighlightLength",
    "showCursorWhenSelecting",
    "resetSelectionOnContextMenu",
    "showTrailingSpace",
    "autohint",
    "dragDrop",
    "cursorScrollMargin",
    "firstLineNumber",
    "softIndentWrappedLines",
    "showInvisibles",
    "rtlMoveVisually",
    "pasteLinesPerSelection",
    "selectionsMayTouch",
    "preferredLineLength",
    "lint",
    "undoDepth",
    "redoDepth",
    "autofocus",
    "autoCloseTags"
  ],
  "codemirror": {
    set lint (val) {config.storage.write("lint", val)},
    get lint () {return config.storage.read("lint") !== undefined ? config.storage.read("lint") : false},
    //
    set tabSize (val) {config.storage.write("tabSize", val)},
    get tabSize () {return config.storage.read("tabSize") !== undefined ? config.storage.read("tabSize") : 2},
    //
    set theme (val) {config.storage.write("theme", val)},
    get theme () {
      let value = config.storage.read("theme");
      return value !== undefined && config.options.v6.theme.indexOf(value) !== -1 ? value : "default";
    },
    //
    set keyMap (val) {config.storage.write("keyMap", val)},
    get keyMap () {
      let value = config.storage.read("keyMap");
      return value !== undefined && config.options.v6.keyMap.indexOf(value) !== -1 ? value : "default";
    },
    //
    set dragDrop (val) {config.storage.write("dragDrop", val)},
    get dragDrop () {return config.storage.read("dragDrop") !== undefined ? config.storage.read("dragDrop") : true},
    //
    set autohint (val) {config.storage.write("autohint", val)},
    get autohint () {return config.storage.read("autohint") !== undefined ? config.storage.read("autohint") : true},
    //
    set matchTag (val) {config.storage.write("matchTag", val)},
    get matchTag () {return false},
    //
    set mode (val) {config.storage.write("mode", val)},
    get mode () {
      let value = config.storage.read("mode");
      if (value === undefined || value === null || value === '') return "JavaScript";
      if (typeof CodeMirror6 === "undefined") return "JavaScript";
      let found = CodeMirror6.languages.some(function (d) {return d.name.toLowerCase() === String(value).toLowerCase()});
      return found ? value : "JavaScript";
    },
    //
    set readOnly (val) {config.storage.write("readOnly", val)},
    get readOnly () {return config.storage.read("readOnly") !== undefined ? config.storage.read("readOnly") : false},
    //
    set fontSize (val) {config.storage.write("fontSize", val)},
    get fontSize () {return config.storage.read("fontSize") !== undefined ? config.storage.read("fontSize") : "13px"},
    //
    set undoDepth (val) {config.storage.write("undoDepth", val)},
    get undoDepth () {return config.storage.read("undoDepth") !== undefined ? config.storage.read("undoDepth") : 200},
    //
    set autofocus (val) {config.storage.write("autofocus", val)},
    get autofocus () {return config.storage.read("autofocus") !== undefined ? config.storage.read("autofocus") : true},
    //
    set indentUnit (val) {config.storage.write("indentUnit", val)},
    get indentUnit () {return config.storage.read("indentUnit") !== undefined ? config.storage.read("indentUnit") : 2},
    //
    set direction (val) {config.storage.write("direction", val)},
    get direction () {return config.storage.read("direction") === "rtl" ? "rtl" : "ltr"},
    //
    set spellcheck (val) {config.storage.write("spellcheck", val)},
    get spellcheck () {return config.storage.read("spellcheck") !== undefined ? config.storage.read("spellcheck") : true},
    //
    set foldGutter (val) {config.storage.write("foldGutter", val)},
    get foldGutter () {return config.storage.read("foldGutter") !== undefined ? config.storage.read("foldGutter") : false},
    //
    set autocorrect (val) {config.storage.write("autocorrect", val)},
    get autocorrect () {return config.storage.read("autocorrect") !== undefined ? config.storage.read("autocorrect") : true},
    //
    set fixedGutter (val) {config.storage.write("fixedGutter", val)},
    get fixedGutter () {return true},
    //
    set smartIndent (val) {config.storage.write("smartIndent", val)},
    get smartIndent () {return true},
    //
    set lineNumbers (val) {config.storage.write("lineNumbers", val)},
    get lineNumbers () {return config.storage.read("lineNumbers") !== undefined ? config.storage.read("lineNumbers") : true},
    //
    set largeTabBar (val) {config.storage.write("largeTabBar", val)},
    get largeTabBar () {return config.storage.read("largeTabBar") !== undefined ? config.storage.read("largeTabBar") : false},
    //
    set cursorHeight (val) {config.storage.write("cursorHeight", val)},
    get cursorHeight () {return 1},
    //
    set lineHeight (val) {config.storage.write("lineHeight", val)},
    get lineHeight () {return config.storage.read("lineHeight") !== undefined ? config.storage.read("lineHeight") : "normal"},
    //
    set pollInterval (val) {config.storage.write("pollInterval", val)},
    get pollInterval () {return 100},
    //
    set autoComplete (val) {config.storage.write("autoComplete", val)},
    get autoComplete () {return config.storage.read("autoComplete") !== undefined ? config.storage.read("autoComplete") : true},
    //
    set flattenSpans (val) {config.storage.write("flattenSpans", val)},
    get flattenSpans () {return true},
    //
    set lineWrapping (val) {config.storage.write("lineWrapping", val)},
    get lineWrapping () {return config.storage.read("lineWrapping") !== undefined ? config.storage.read("lineWrapping") : true},
    //
    set matchBrackets (val) {config.storage.write("matchBrackets", val)},
    get matchBrackets () {return config.storage.read("matchBrackets") !== undefined ? config.storage.read("matchBrackets") : true},
    //
    set electricChars (val) {config.storage.write("electricChars", val)},
    get electricChars () {return true},
    //
    set autoCloseTags (val) {config.storage.write("autoCloseTags", val)},
    get autoCloseTags () {return config.storage.read("autoCloseTags") !== undefined ? config.storage.read("autoCloseTags") : false},
    //
    set viewportMargin (val) {config.storage.write("viewportMargin", val)},
    get viewportMargin () {return 10},
    //
    set autocapitalize (val) {config.storage.write("autocapitalize", val)},
    get autocapitalize () {return true},
    //
    set indentWithTabs (val) {config.storage.write("indentWithTabs", val)},
    get indentWithTabs () {return config.storage.read("indentWithTabs") !== undefined ? config.storage.read("indentWithTabs") : true},
    //
		set showInvisibles (val) {config.storage.write("showInvisibles", val)},
    get showInvisibles () {return config.storage.read("showInvisibles") !== undefined ? config.storage.read("showInvisibles") : false},
    //
    set cursorBlinkRate (val) {config.storage.write("cursorBlinkRate", val)},
    get cursorBlinkRate () {return 530},
    //
    set styleActiveLine (val) {config.storage.write("styleActiveLine", val)},
    get styleActiveLine () {return config.storage.read("styleActiveLine") !== undefined ? config.storage.read("styleActiveLine") : true},
    //
    set rtlMoveVisually (val) {config.storage.write("rtlMoveVisually", val)},
    get rtlMoveVisually () {return true},
    //
    set firstLineNumber (val) {config.storage.write("firstLineNumber", val)},
    get firstLineNumber () {
      let val = config.storage.read("firstLineNumber");
      /* unsupported in cm6, keep the row numeric and consistent with v5 */
      return typeof val === "number" && isFinite(val) && Math.floor(val) >= 1 ? Math.floor(val) : 1;
    },
    //
    set lineWiseCopyCut (val) {config.storage.write("lineWiseCopyCut", val)},
    get lineWiseCopyCut () {return true},
    //
    set scrollbarStyle (val) {config.storage.write("scrollbarStyle", val)},
    get scrollbarStyle () {return "default"},
    //
    set matchHighlighter (val) {config.storage.write("matchHighlighter", val)},
    get matchHighlighter () {return config.storage.read("matchHighlighter") !== undefined ? config.storage.read("matchHighlighter") : true},
    //
		set showTrailingSpace (val) {config.storage.write("showTrailingSpace", val)},
    get showTrailingSpace () {return config.storage.read("showTrailingSpace") !== undefined ? config.storage.read("showTrailingSpace") : false},
    //
    set historyEventDelay (val) {config.storage.write("historyEventDelay", val)},
    get historyEventDelay () {return 1250},
    //
    set annotateScrollbar (val) {config.storage.write("annotateScrollbar", val)},
    get annotateScrollbar () {return true},
    //
    set autoCloseBrackets (val) {config.storage.write("autoCloseBrackets", val)},
    get autoCloseBrackets () {return config.storage.read("autoCloseBrackets") !== undefined ? config.storage.read("autoCloseBrackets") : false},
    //
    set cursorScrollMargin (val) {config.storage.write("cursorScrollMargin", val)},
    get cursorScrollMargin () {return 0},
    //
    set sidebarFontColor (val) {config.storage.write("sidebarFontColor", val)},
    get sidebarFontColor () {return config.storage.read("sidebarFontColor") !== undefined ? config.storage.read("sidebarFontColor") : "#e1e1e1"},
    //
    set maxHighlightLength (val) {config.storage.write("maxHighlightLength", val)},
    get maxHighlightLength () {return 10000},
    //
    set selectionsMayTouch (val) {config.storage.write("selectionsMayTouch", val)},
    get selectionsMayTouch () {return false},
    //
    set preferredLineLength (val) {config.storage.write("preferredLineLength", val)},
    get preferredLineLength () {return config.storage.read("preferredLineLength") !== undefined ? config.storage.read("preferredLineLength") : 120},
    //
    set pasteLinesPerSelection (val) {config.storage.write("pasteLinesPerSelection", val)},
    get pasteLinesPerSelection () {return true},
    //
    set softIndentWrappedLines (val) {config.storage.write("softIndentWrappedLines", val)},
    get softIndentWrappedLines () {return false},
    //
    set showCursorWhenSelecting (val) {config.storage.write("showCursorWhenSelecting", val)},
    get showCursorWhenSelecting () {return true},
    //
    set sidebarBackgroundColor (val) {config.storage.write("sidebarBackgroundColor", val)},
    get sidebarBackgroundColor () {return config.storage.read("sidebarBackgroundColor") !== undefined ? config.storage.read("sidebarBackgroundColor") : "#26292f"},
    //
    set resetSelectionOnContextMenu (val) {config.storage.write("resetSelectionOnContextMenu", val)},
    get resetSelectionOnContextMenu () {return true},
    //
    set matchHighlighterColor (val) {config.storage.write("matchHighlighterColor", val)},
    get matchHighlighterColor () {return config.storage.read("matchHighlighterColor") !== undefined ? config.storage.read("matchHighlighterColor") : "rgba(31,162,31,0.37)"},
    //
    set matchHighlighterWhenSelected (val) {config.storage.write("matchHighlighterWhenSelected", val)},
    get matchHighlighterWhenSelected () {return true},
    //
    set changeAppColorsWhenThemeIsChanged (val) {config.storage.write("changeAppColorsWhenThemeIsChanged", val)},
    get changeAppColorsWhenThemeIsChanged () {return config.storage.read("changeAppColorsWhenThemeIsChanged") !== undefined ? config.storage.read("changeAppColorsWhenThemeIsChanged") : false},
    //
    set hideLeftSidebarWhenEditorIsFocused (val) {config.storage.write("hideLeftSidebarWhenEditorIsFocused", val)},
    get hideLeftSidebarWhenEditorIsFocused () {return config.storage.read("hideLeftSidebarWhenEditorIsFocused") !== undefined ? config.storage.read("hideLeftSidebarWhenEditorIsFocused") : false},
    //
    set hideRightSidebarWhenEditorIsFocused (val) {config.storage.write("hideRightSidebarWhenEditorIsFocused", val)},
    get hideRightSidebarWhenEditorIsFocused () {return config.storage.read("hideRightSidebarWhenEditorIsFocused") !== undefined ? config.storage.read("hideRightSidebarWhenEditorIsFocused") : true}
  }
};
