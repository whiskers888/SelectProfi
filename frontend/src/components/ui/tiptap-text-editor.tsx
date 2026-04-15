import { useEffect } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { cn } from '@/lib/utils'

type TiptapTextEditorProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function TiptapTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Введите текст',
  className,
}: TiptapTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getText({ blockSeparator: '\n' }))
    },
    editorProps: {
      attributes: {
        class:
          'tiptap-editor-content min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none',
      },
    },
  })

  useEffect(() => {
    if (!editor) {
      return
    }

    editor.setEditable(!disabled)
  }, [disabled, editor])

  useEffect(() => {
    if (!editor) {
      return
    }

    const currentText = editor.getText({ blockSeparator: '\n' })
    if (currentText === value) {
      return
    }

    editor.commands.setContent(value)
  }, [editor, value])

  if (!editor) {
    return null
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2 py-1">
        <button
          type="button"
          className={cn(
            'rounded border border-input px-2 py-1 text-xs',
            editor.isActive('bold') ? 'bg-slate-100' : '',
          )}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={disabled}
          aria-label="Жирный"
        >
          B
        </button>
        <button
          type="button"
          className={cn(
            'rounded border border-input px-2 py-1 text-xs italic',
            editor.isActive('italic') ? 'bg-slate-100' : '',
          )}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={disabled}
          aria-label="Курсив"
        >
          I
        </button>
        <button
          type="button"
          className={cn(
            'rounded border border-input px-2 py-1 text-xs underline',
            editor.isActive('underline') ? 'bg-slate-100' : '',
          )}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={disabled}
          aria-label="Подчеркнутый"
        >
          U
        </button>
        <button
          type="button"
          className={cn(
            'rounded border border-input px-2 py-1 text-xs line-through',
            editor.isActive('strike') ? 'bg-slate-100' : '',
          )}
          onClick={() => editor.chain().focus().toggleStrike().run()}
          disabled={disabled}
          aria-label="Зачеркнутый"
        >
          S
        </button>
        <button
          type="button"
          className={cn(
            'rounded border border-input px-2 py-1 text-xs',
            editor.isActive('bulletList') ? 'bg-slate-100' : '',
          )}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={disabled}
          aria-label="Маркированный список"
        >
          • list
        </button>
        <button
          type="button"
          className={cn(
            'rounded border border-input px-2 py-1 text-xs',
            editor.isActive('orderedList') ? 'bg-slate-100' : '',
          )}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={disabled}
          aria-label="Нумерованный список"
        >
          1. list
        </button>
        <button
          type="button"
          className={cn(
            'rounded border border-input px-2 py-1 text-xs',
            editor.isActive('heading', { level: 2 }) ? 'bg-slate-100' : '',
          )}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={disabled}
          aria-label="Заголовок"
        >
          H2
        </button>
        <button
          type="button"
          className={cn(
            'rounded border border-input px-2 py-1 text-xs',
            editor.isActive('blockquote') ? 'bg-slate-100' : '',
          )}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          disabled={disabled}
          aria-label="Цитата"
        >
          "
        </button>
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={disabled || !editor.can().chain().focus().undo().run()}
          aria-label="Отменить"
        >
          Отменить
        </button>
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={disabled || !editor.can().chain().focus().redo().run()}
          aria-label="Повторить"
        >
          Восстановить
        </button>
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
          disabled={disabled}
          aria-label="Очистить формат"
        >
          Очистить
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
