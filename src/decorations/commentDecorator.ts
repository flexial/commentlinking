import * as vscode from "vscode";

import {
  getSuppressDecorationOnJump,
  clearSuppressDecorationOnJump,
} from "../utils/helpers";
import { anchorIndex } from "../anchors/AnchorIndex";
import { isSupportedDocument } from "../utils/helpers";
import { createDecorationTypes } from "./styles";
import { buildDecorationRanges } from "./buildRanges";

let _decorateEditorRef: ((editor?: vscode.TextEditor) => void) | null = null;
let _decorationTypes: ReturnType<typeof createDecorationTypes> | null = null;
let _listenersRegistered = false;

export function refreshDecorationsNow() {
  const editor = vscode.window.activeTextEditor;
  if (_decorateEditorRef && editor) {
    _decorateEditorRef(editor);
  }
}

export function registerCommentDecorations(context: vscode.ExtensionContext) {
  if (_decorationTypes) {
    for (const editor of vscode.window.visibleTextEditors) {
      editor.setDecorations(_decorationTypes.anchorTextDecoration, []);
      editor.setDecorations(_decorationTypes.anchorTextActiveDecoration, []);
      editor.setDecorations(_decorationTypes.linkTextDecoration, []);
      editor.setDecorations(_decorationTypes.linkTextActiveDecoration, []);
      editor.setDecorations(_decorationTypes.hiddenDecoration, []);
    }
    _decorationTypes.anchorTextDecoration.dispose();
    _decorationTypes.anchorTextActiveDecoration.dispose();
    _decorationTypes.linkTextDecoration.dispose();
    _decorationTypes.linkTextActiveDecoration.dispose();
    _decorationTypes.hiddenDecoration.dispose();
  }
  _decorationTypes = createDecorationTypes(context);

  const decorateEditor = async (editor?: vscode.TextEditor) => {
    if (!editor) return;
    const doc = editor.document;
    if (!isSupportedDocument(doc)) return;
    if (doc.fileName.endsWith(".md")) return;
    if (!anchorIndex.isFileProcessed(doc.uri)) return;

    const types = _decorationTypes;
    if (!types) return;

    const ranges = buildDecorationRanges(doc, editor.selection);
    editor.setDecorations(types.anchorTextDecoration, ranges.anchorTextRanges);
    editor.setDecorations(
      types.anchorTextActiveDecoration,
      ranges.anchorTextActiveRanges
    );
    editor.setDecorations(types.linkTextDecoration, ranges.linkTextRanges);
    editor.setDecorations(types.hiddenDecoration, ranges.hiddenRanges);
    editor.setDecorations(types.linkTextActiveDecoration, ranges.linkTextActiveRanges);
  };

  _decorateEditorRef = decorateEditor;

  for (const editor of vscode.window.visibleTextEditors) {
    decorateEditor(editor);
  }

  // . Register listeners
  if (!_listenersRegistered) {
    // Ensure listeners are only registered once
    _listenersRegistered = true;
    context.subscriptions.push(
      // Rebuild decorations when switching to a different tab/document
      vscode.window.onDidChangeActiveTextEditor((e) => decorateEditor(e)),
      // Rebuild decorations when current document changes
      vscode.workspace.onDidChangeTextDocument((e) => {
        const active = vscode.window.activeTextEditor;
        if (active && e.document === active.document) decorateEditor(active);
      }),
      // Rebuild decorations when cursor position changes
      // Necessary to view/edit anchors on the current cursor position
      vscode.window.onDidChangeTextEditorSelection((e) => {
        const suppr = getSuppressDecorationOnJump();
        if (suppr) {
          const pos = e.textEditor.selection.active;
          const sameDoc = e.textEditor.document.uri.toString() === suppr.uri;
          const samePos =
            sameDoc &&
            pos.line === suppr.line &&
            pos.character === suppr.character;
          if (!samePos) {
            clearSuppressDecorationOnJump();
          }
        }
        const active = vscode.window.activeTextEditor;
        if (active) decorateEditor(active);
      })
    );
  }
}
