/**
 * Custom Lexical node for images. Renders <img> and exports to HTML for storage.
 */
import type { DOMConversionMap, DOMExportOutput, EditorConfig, LexicalEditor, NodeKey } from 'lexical';
import { DecoratorNode } from 'lexical';

export type SerializedImageNode = {
  type: 'image';
  version: 1;
  src: string;
  alt?: string;
};

function $convertImgElement(dom: HTMLImageElement): { node: ImageNode } | null {
  const src = dom.getAttribute('src') ?? '';
  if (!src) return null;
  const alt = dom.getAttribute('alt') ?? undefined;
  const node = $createImageNode({ src, alt });
  return { node };
}

export class ImageNode extends DecoratorNode<JSX.Element> {
  __src: string;
  __alt: string | undefined;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__alt, node.__key);
  }

  constructor(src: string, alt?: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__alt = alt;
  }

  getSrc(): string {
    return this.__src;
  }

  setSrc(src: string): this {
    const self = this.getWritable();
    self.__src = src;
    return self;
  }

  getAlt(): string | undefined {
    return this.__alt;
  }

  setAlt(alt: string | undefined): this {
    const self = this.getWritable();
    self.__alt = alt;
    return self;
  }

  createDOM(_config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    span.className = 'lexical-image-wrapper';
    return span;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(_editor: LexicalEditor, _config: EditorConfig): JSX.Element {
    return <img src={this.__src} alt={this.__alt ?? ''} className="max-w-full h-auto rounded" />;
  }

  exportDOM(_editor: LexicalEditor): DOMExportOutput {
    const img = document.createElement('img');
    img.setAttribute('src', this.__src);
    if (this.__alt != null) img.setAttribute('alt', this.__alt);
    return { element: img };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: HTMLElement) => {
        const img = node as HTMLImageElement;
        return {
          conversion: () => $convertImgElement(img),
          priority: 1,
        };
      },
    };
  }

  exportJSON(): SerializedImageNode {
    return {
      type: 'image',
      version: 1,
      src: this.__src,
      alt: this.__alt,
    };
  }

  static importJSON(serialized: SerializedImageNode): ImageNode {
    return $createImageNode({ src: serialized.src, alt: serialized.alt });
  }
}

export function $createImageNode({ src, alt }: { src: string; alt?: string }): ImageNode {
  return new ImageNode(src, alt);
}

export function $isImageNode(node: unknown): node is ImageNode {
  return node instanceof ImageNode;
}
