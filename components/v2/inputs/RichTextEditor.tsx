"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { useEffect } from "react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import {
    Bold, Italic, Strikethrough, List, ListOrdered,
    Heading1, Heading2, Heading3, Link2, Link2Off, Undo, Redo,
    Minus,
} from "lucide-react";

interface RichTextEditorProps {
    label: string;
    value: string;
    onChange: (html: string) => void;
    required?: boolean;
    placeholder?: string;
}

const ToolbarButton = ({
    onClick,
    active,
    disabled,
    title,
    children,
}: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    title?: string;
    children: React.ReactNode;
}) => (
    <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        title={title}
        disabled={disabled}
        className={`p-1.5 rounded transition-colors ${
            active
                ? "bg-navy-100 text-navy-700"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        } ${disabled ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
    >
        {children}
    </button>
);

const RichTextEditor = ({
    label,
    value,
    onChange,
    required = false,
    placeholder = "Masukkan konten...",
}: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({ placeholder }),
            Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-600 underline" } }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: "prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4",
            },
        },
        immediatelyRender: false,
    });

    useEffect(() => {
        if (!editor) return;
        if (value !== editor.getHTML()) {
            editor.commands.setContent(value, false);
        }
    }, [value, editor]);

    const handleSetLink = () => {
        if (!editor) return;
        const prev = editor.getAttributes("link").href ?? "";
        const url = window.prompt("Masukkan URL", prev);
        if (url === null) return;
        if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }
    };

    return (
        <div>
            <label className="block text-sm font-semibold text-black mb-2">
                {label} {required && <span className="text-red-600">*</span>}
            </label>

            <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-navy-300 focus-within:border-transparent transition-all">
                {/* Toolbar */}
                <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        active={editor?.isActive("bold")}
                        title="Bold"
                    >
                        <Bold size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        active={editor?.isActive("italic")}
                        title="Italic"
                    >
                        <Italic size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleStrike().run()}
                        active={editor?.isActive("strike")}
                        title="Strikethrough"
                    >
                        <Strikethrough size={15} />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        active={editor?.isActive("heading", { level: 1 })}
                        title="Heading 1"
                    >
                        <Heading1 size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        active={editor?.isActive("heading", { level: 2 })}
                        title="Heading 2"
                    >
                        <Heading2 size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                        active={editor?.isActive("heading", { level: 3 })}
                        title="Heading 3"
                    >
                        <Heading3 size={15} />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        active={editor?.isActive("bulletList")}
                        title="Bullet List"
                    >
                        <List size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        active={editor?.isActive("orderedList")}
                        title="Ordered List"
                    >
                        <ListOrdered size={15} />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    <ToolbarButton onClick={handleSetLink} active={editor?.isActive("link")} title="Tambah Link">
                        <Link2 size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().unsetLink().run()}
                        disabled={!editor?.isActive("link")}
                        title="Hapus Link"
                    >
                        <Link2Off size={15} />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    <ToolbarButton
                        onClick={() => editor?.chain().focus().setHorizontalRule().run()}
                        title="Garis Pemisah"
                    >
                        <Minus size={15} />
                    </ToolbarButton>

                    <div className="w-px h-4 bg-gray-300 mx-1" />

                    <ToolbarButton
                        onClick={() => editor?.chain().focus().undo().run()}
                        disabled={!editor?.can().undo()}
                        title="Undo"
                    >
                        <Undo size={15} />
                    </ToolbarButton>
                    <ToolbarButton
                        onClick={() => editor?.chain().focus().redo().run()}
                        disabled={!editor?.can().redo()}
                        title="Redo"
                    >
                        <Redo size={15} />
                    </ToolbarButton>
                </div>

                {/* Editor area */}
                <EditorContent editor={editor} />
            </div>
        </div>
    );
};

export default RichTextEditor;
