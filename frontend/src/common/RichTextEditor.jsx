import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
    Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, 
    List, ListOrdered, Quote, Undo, Redo, RemoveFormatting 
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder = "Write content here..." }) {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
        ],
        content: value || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (onChange) {
                onChange(html === '<p></p>' ? '' : html);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm dark:prose-invert max-w-none p-4 min-h-[120px] max-h-[400px] overflow-y-auto outline-none text-gray-900 dark:text-gray-100 font-sans leading-relaxed',
                'data-placeholder': placeholder,
            },
        },
    });

    useEffect(() => {
        if (editor && value !== undefined) {
            const currentContent = editor.getHTML();
            if (value !== currentContent && !(value === '' && currentContent === '<p></p>')) {
                editor.commands.setContent(value || '');
            }
        }
    }, [value, editor]);

    if (!editor) return null;

    return (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 overflow-hidden transition-all focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            {/* TOOLBAR */}
            <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ${editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    title="Bold"
                >
                    <Bold className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ${editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    title="Italic"
                >
                    <Italic className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ${editor.isActive('strike') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    title="Strikethrough"
                >
                    <Strikethrough className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    title="Heading 2"
                >
                    <Heading2 className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ${editor.isActive('heading', { level: 3 }) ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    title="Heading 3"
                >
                    <Heading3 className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ${editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    title="Bullet List"
                >
                    <List className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ${editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    title="Ordered List"
                >
                    <ListOrdered className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer ${editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold' : ''}`}
                    title="Quote"
                >
                    <Quote className="w-4 h-4" />
                </button>

                <div className="w-px h-5 bg-gray-300 dark:bg-gray-700 mx-1" />

                <button
                    type="button"
                    onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer text-gray-500"
                    title="Clear Formatting"
                >
                    <RemoveFormatting className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-40"
                    title="Undo"
                >
                    <Undo className="w-4 h-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer disabled:opacity-40"
                    title="Redo"
                >
                    <Redo className="w-4 h-4" />
                </button>
            </div>

            {/* EDITOR AREA */}
            <EditorContent editor={editor} />
        </div>
    );
}
