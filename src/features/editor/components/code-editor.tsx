import { useEffect, useMemo, useRef } from "react";
import { customSetup } from "../extensions/custom-setup";
import { EditorView, keymap } from "@codemirror/view";
import { oneDark } from "@codemirror/theme-one-dark";
import { indentWithTab } from "@codemirror/commands";
import { customTheme } from "../extensions/theme";
import { getLanguageExtension } from "../extensions/language-extension";
import { minimap } from  "../extensions/minimap";
import {indentationMarkers} from "@replit/codemirror-indentation-markers"


interface Props{
    fileName:string;
}

export const CodeEditor = ({fileName}:Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const languageExtension=useMemo(()=> getLanguageExtension(fileName), [fileName])

  useEffect(() => {
    if(!editorRef.current) return;

    const view = new EditorView({
      doc: "Start document",
      parent: editorRef.current,
      extensions:[oneDark, customTheme, customSetup,languageExtension, keymap.of([indentWithTab]), minimap(), indentationMarkers()]
    });
    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  return (
    <div
      ref={editorRef}
      className="size-full pl-4 bg-background"
    />
  );
};