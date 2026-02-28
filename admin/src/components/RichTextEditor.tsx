/**
 * Shared Lexical rich text editor. Value/onChange in HTML for DB storage.
 * Supports: bold, italic, underline, lists, link, image (optional upload).
 */
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, REMOVE_LIST_COMMAND, registerList } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { LexicalComposer, type InitialConfigType } from '@lexical/react/LexicalComposer';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { $getRoot, $insertNodes, createCommand, FORMAT_TEXT_COMMAND, LexicalCommand } from 'lexical';
import { useEffect, useMemo, useRef } from 'react';
import { HeadingNode, QuoteNode, registerRichText } from '@lexical/rich-text';
import { $createParagraphNode, $createTextNode } from 'lexical';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { ImageNode, $createImageNode } from './ImageNode';

export const INSERT_IMAGE_COMMAND: LexicalCommand<{ src: string; alt?: string }> = createCommand('INSERT_IMAGE');

const theme = {
  paragraph: 'mb-2',
  list: { ul: 'list-disc pl-6', ol: 'list-decimal pl-6', listitem: 'mb-1' },
  link: 'text-primary-600 underline',
  heading: { h1: 'text-2xl font-bold', h2: 'text-xl font-bold', h3: 'text-lg font-bold' },
  quote: 'border-l-4 border-bgray-300 pl-4 italic',
  text: { bold: 'font-bold', italic: 'italic', underline: 'underline' },
};

function RegisterRichTextPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return registerRichText(editor);
  }, [editor]);
  return null;
}

function RegisterListPlugin() {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    return registerList(editor);
  }, [editor]);
  return null;
}

function ToolbarPlugin({
  onImageUpload,
}: {
  onImageUpload?: (file: File) => Promise<string>;
}) {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const applyFormat = (format: 'bold' | 'italic' | 'underline') => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertList = (ordered: boolean) => {
    editor.dispatchCommand(ordered ? INSERT_ORDERED_LIST_COMMAND : INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const removeList = () => {
    editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
  };

  const toggleLink = () => {
    const url = window.prompt('Link URL:');
    if (url != null) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url === '' ? null : url);
  };

  const insertImage = (src: string, alt?: string) => {
    editor.update(() => {
      const imageNode = $createImageNode({ src, alt });
      $insertNodes([imageNode]);
    });
  };

  const handleImageClick = () => {
    if (onImageUpload) {
      fileInputRef.current?.click();
    } else {
      const url = window.prompt('Resim URL:');
      if (url) insertImage(url);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onImageUpload) return;
    e.target.value = '';
    try {
      const src = await onImageUpload(file);
      insertImage(src);
    } catch (err) {
      console.error('Resim yükleme hatası:', err);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-bgray-200 bg-bgray-50 p-2 dark:border-darkblack-400 dark:bg-darkblack-500 rounded-t-lg">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
      <button type="button" className="rounded p-1.5 hover:bg-bgray-200 dark:hover:bg-darkblack-400" onClick={() => applyFormat('bold')} title="Kalın">B</button>
      <button type="button" className="rounded p-1.5 hover:bg-bgray-200 dark:hover:bg-darkblack-400 italic" onClick={() => applyFormat('italic')} title="İtalik">İ</button>
      <button type="button" className="rounded p-1.5 hover:bg-bgray-200 dark:hover:bg-darkblack-400 underline" onClick={() => applyFormat('underline')} title="Altı çizili">U</button>
      <span className="mx-1 text-bgray-400">|</span>
      <button type="button" className="rounded p-1.5 hover:bg-bgray-200 dark:hover:bg-darkblack-400" onClick={() => insertList(false)} title="Madde işareti">• Liste</button>
      <button type="button" className="rounded p-1.5 hover:bg-bgray-200 dark:hover:bg-darkblack-400" onClick={() => insertList(true)} title="Numaralı liste">1. Liste</button>
      <button type="button" className="rounded p-1.5 hover:bg-bgray-200 dark:hover:bg-darkblack-400" onClick={removeList} title="Listeyi kaldır">Liste kaldır</button>
      <span className="mx-1 text-bgray-400">|</span>
      <button type="button" className="rounded p-1.5 hover:bg-bgray-200 dark:hover:bg-darkblack-400" onClick={toggleLink} title="Link">Link</button>
      <button type="button" className="rounded p-1.5 hover:bg-bgray-200 dark:hover:bg-darkblack-400" onClick={handleImageClick} title="Resim">Resim</button>
    </div>
  );
}

function HtmlOnChangePlugin({ onChange }: { onChange: (html: string) => void }) {
  return (
    <OnChangePlugin
      onChange={(editorState, editor) => {
        editorState.read(() => {
          const html = $generateHtmlFromNodes(editor, null);
          onChange(html);
        });
      }}
    />
  );
}

export type RichTextEditorProps = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  height?: number;
  onImageUpload?: (file: File) => Promise<string>;
};

export function RichTextEditor({ value, onChange, placeholder = 'Metin girin…', height = 260, onImageUpload }: RichTextEditorProps) {
  const initialConfig = useMemo(
    () => ({
      namespace: 'RichTextEditor',
      theme,
      onError: (e: Error) => console.error('Lexical:', e),
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, ImageNode],
      editorState: (editor: import('lexical').LexicalEditor) => {
        const html = (value || '').trim() || '<p></p>';
        const parser = typeof DOMParser !== 'undefined' ? new DOMParser() : null;
        if (!parser) return;
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          try {
            const dom = parser.parseFromString(html, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            nodes.forEach((n) => root.append(n));
          } catch {
            const p = $createParagraphNode();
            p.append($createTextNode(''));
            root.append(p);
          }
        });
      },
    }),
    [value]
  );

  return (
    <div className="rich-editor-wrap rounded-lg border border-bgray-200 dark:border-darkblack-400 overflow-hidden" style={{ minHeight: height }}>
      <LexicalComposer initialConfig={initialConfig as InitialConfigType}>
        <RegisterRichTextPlugin />
        <RegisterListPlugin />
        <LinkPlugin />
        <ToolbarPlugin onImageUpload={onImageUpload} />
        <div className="min-h-[200px] overflow-auto bg-white dark:bg-darkblack-600 p-3" style={{ height }}>
          <RichTextPlugin
            contentEditable={<ContentEditable className="outline-none min-h-[180px]" />}
            placeholder={<span className="absolute text-bgray-400 pointer-events-none">{placeholder}</span>}
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <HtmlOnChangePlugin onChange={onChange} />
      </LexicalComposer>
    </div>
  );
}
