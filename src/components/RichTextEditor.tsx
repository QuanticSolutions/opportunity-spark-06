import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered,
  Quote, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCallback, useEffect } from "react";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  maxLength?: number;
  minHeight?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Write a short professional bio...",
  maxLength,
  minHeight = "120px",
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          HTMLAttributes: { class: "list-disc pl-6 space-y-1" },
        },
        orderedList: {
          keepMarks: true,
          HTMLAttributes: { class: "list-decimal pl-6 space-y-1" },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {},
        },
        blockquote: {
          HTMLAttributes: { class: "border-l-4 border-primary/30 pl-4 italic text-muted-foreground" },
        },
        listItem: {
          HTMLAttributes: { class: "ml-1" },
        },
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-primary underline" } }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || "",
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (html === "<p></p>") {
        onChange("");
      } else {
        onChange(html);
      }
    },
  });

  // Sync external value changes
  useEffect(() => {
    if (editor && value !== undefined && editor.getHTML() !== value && value !== "") {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  const setLink = useCallback(() => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  const setHeading = (val: string) => {
    if (!editor) return;
    if (val === "paragraph") {
      editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(val) as 1 | 2 | 3;
      editor.chain().focus().toggleHeading({ level }).run();
    }
  };

  const currentHeading = () => {
    if (!editor) return "paragraph";
    if (editor.isActive("heading", { level: 1 })) return "1";
    if (editor.isActive("heading", { level: 2 })) return "2";
    if (editor.isActive("heading", { level: 3 })) return "3";
    return "paragraph";
  };

  if (!editor) return null;

  const textLength = editor.getText().length;

  return (
    <div className="rounded-lg border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1.5 bg-muted/30 rounded-t-lg">
        <Select value={currentHeading()} onValueChange={setHeading}>
          <SelectTrigger className="h-8 w-[110px] text-xs border-none bg-transparent shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="paragraph">Paragraph</SelectItem>
            <SelectItem value="1">Heading 1</SelectItem>
            <SelectItem value="2">Heading 2</SelectItem>
            <SelectItem value="3">Heading 3</SelectItem>
          </SelectContent>
        </Select>

        <div className="h-5 w-px bg-border mx-1" />

        <Toggle size="sm" pressed={editor.isActive("bold")} onPressedChange={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("italic")} onPressedChange={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("underline")} onPressedChange={() => editor.chain().focus().toggleUnderline().run()}>
          <UnderlineIcon size={14} />
        </Toggle>

        <div className="h-5 w-px bg-border mx-1" />

        <Toggle size="sm" pressed={editor.isActive("bulletList")} onPressedChange={() => editor.chain().focus().toggleBulletList().run()}>
          <List size={14} />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("orderedList")} onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}>
          <ListOrdered size={14} />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive("blockquote")} onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}>
          <Quote size={14} />
        </Toggle>

        <div className="h-5 w-px bg-border mx-1" />

        <Toggle size="sm" pressed={editor.isActive({ textAlign: "left" })} onPressedChange={() => editor.chain().focus().setTextAlign("left").run()}>
          <AlignLeft size={14} />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive({ textAlign: "center" })} onPressedChange={() => editor.chain().focus().setTextAlign("center").run()}>
          <AlignCenter size={14} />
        </Toggle>
        <Toggle size="sm" pressed={editor.isActive({ textAlign: "right" })} onPressedChange={() => editor.chain().focus().setTextAlign("right").run()}>
          <AlignRight size={14} />
        </Toggle>

        <div className="h-5 w-px bg-border mx-1" />

        <Toggle size="sm" pressed={editor.isActive("link")} onPressedChange={setLink}>
          <LinkIcon size={14} />
        </Toggle>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className={`rich-text-content px-3 py-2 max-h-[500px] overflow-y-auto focus:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0`}
        style={{ minHeight }}
      />

      {maxLength && (
        <div className="px-3 py-1 text-right">
          <span className={`text-xs ${textLength > maxLength ? "text-destructive" : "text-muted-foreground"}`}>
            {textLength}/{maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
