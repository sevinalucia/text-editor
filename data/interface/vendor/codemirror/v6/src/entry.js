/*
 * CodeMirror 6 vendor bundle - ENTRY SOURCE
 * ==========================================
 * This is the complete, human-readable source of what the bundle exposes.
 * Everything imported here comes from the official version-pinned npm
 * packages (see package.json / package-lock.json in this folder).
 *
 * The bundle assigns exactly ONE global: window.CodeMirror6
 */

import { basicSetup, minimalSetup } from "codemirror";
import {
  EditorView,
  keymap,
  lineNumbers,
  highlightActiveLineGutter,
  highlightSpecialChars,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  highlightActiveLine,
  placeholder
} from "@codemirror/view";
import { EditorState, Compartment, StateEffect, StateField, RangeSetBuilder, Prec, EditorSelection } from "@codemirror/state";
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
  indentSelection,
  undo,
  redo,
  undoDepth,
  redoDepth
} from "@codemirror/commands";
import {
  LanguageDescription,
  LanguageSupport,
  foldGutter,
  codeFolding,
  foldCode,
  unfoldCode,
  toggleFold,
  indentOnInput,
  bracketMatching,
  foldKeymap,
  indentUnit,
  syntaxHighlighting,
  defaultHighlightStyle,
  HighlightStyle
} from "@codemirror/language";
import { highlightSelectionMatches, searchKeymap, search, SearchQuery, setSearchQuery } from "@codemirror/search";
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
  closeBracketsKeymap,
  CompletionContext
} from "@codemirror/autocomplete";
import { lintKeymap, linter } from "@codemirror/lint";
import { languages } from "@codemirror/language-data";
import { tags as t } from "@lezer/highlight";

const extension = {
  basic: basicSetup,
  minimal: minimalSetup
};

const findModeByFileName = function (name) {
  if (!name) return null;
  const clean = String(name).replace(/^.*[\\\/]/, "");
  return LanguageDescription.matchFilename(languages, clean, true) || null;
};

const findModeByMime = function (mime) {
  if (!mime) return null;
  let sub = String(mime).toLowerCase().split("/").pop().split("+")[0].split(".")[0];
  if (sub.indexOf("x-") === 0) sub = sub.slice(2);
  return languages.find((d) => d.name.toLowerCase() === sub || (d.aliases || []).some((a) => a.toLowerCase() === sub)) || null;
};

globalThis.CodeMirror6 = Object.assign(extension, {
  "version": "6",
  "EditorView": EditorView,
  "EditorState": EditorState,
  "EditorSelection": EditorSelection,
  "indentUnit": indentUnit,
  "Compartment": Compartment,
  "StateEffect": StateEffect,
  "StateField": StateField,
  "RangeSetBuilder": RangeSetBuilder,
  "Prec": Prec,
  "LanguageDescription": LanguageDescription,
  "LanguageSupport": LanguageSupport,
  "HighlightStyle": HighlightStyle,
  "SearchQuery": SearchQuery,
  "keymap": keymap,
  "lineNumbers": lineNumbers,
  "highlightActiveLineGutter": highlightActiveLineGutter,
  "highlightSpecialChars": highlightSpecialChars,
  "drawSelection": drawSelection,
  "dropCursor": dropCursor,
  "rectangularSelection": rectangularSelection,
  "crosshairCursor": crosshairCursor,
  "highlightActiveLine": highlightActiveLine,
  "placeholder": placeholder,
  "history": history,
  "defaultKeymap": defaultKeymap,
  "historyKeymap": historyKeymap,
  "indentWithTab": indentWithTab,
  "indentSelection": indentSelection,
  "undo": undo,
  "redo": redo,
  "undoDepth": undoDepth,
  "redoDepth": redoDepth,
  "foldGutter": foldGutter,
  "codeFolding": codeFolding,
  "foldCode": foldCode,
  "unfoldCode": unfoldCode,
  "toggleFold": toggleFold,
  "indentOnInput": indentOnInput,
  "bracketMatching": bracketMatching,
  "foldKeymap": foldKeymap,
  "syntaxHighlighting": syntaxHighlighting,
  "defaultHighlightStyle": defaultHighlightStyle,
  "tags": t,
  "search": search,
  "searchKeymap": searchKeymap,
  "highlightSelectionMatches": highlightSelectionMatches,
  "setSearchQuery": setSearchQuery,
  "autocompletion": autocompletion,
  "completionKeymap": completionKeymap,
  "closeBrackets": closeBrackets,
  "closeBracketsKeymap": closeBracketsKeymap,
  "CompletionContext": CompletionContext,
  "linter": linter,
  "lintKeymap": lintKeymap,
  "languages": languages,
  "findModeByFileName": findModeByFileName,
  "findModeByMime": findModeByMime
});
