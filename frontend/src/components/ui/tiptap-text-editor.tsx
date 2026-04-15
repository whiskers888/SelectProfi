import { useEffect } from 'react'
import { FontFamily } from '@tiptap/extension-font-family'
import { EditorContent, useEditor } from '@tiptap/react'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyle } from '@tiptap/extension-text-style'
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

const fontFamilyOptions = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier' },
] as const

const fontSizeOptions = [
  { value: '14px', label: '14' },
  { value: '16px', label: '16' },
  { value: '18px', label: '18' },
  { value: '20px', label: '20' },
  { value: '24px', label: '24' },
] as const

export function TiptapTextEditor({
  value,
  onChange,
  disabled = false,
  placeholder = 'Введите текст',
  className,
}: TiptapTextEditorProps) {
  function applyFontSize(nextSize: string) {
    if (!editor || disabled) {
      return
    }

    editor.chain().focus().setMark('textStyle', { fontSize: nextSize }).run()
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      Underline,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    editable: !disabled,
    onUpdate: ({ editor: currentEditor }) => {
      // @dvnull: Ранее наружу отдавался только plain-text, из-за чего терялось форматирование; переключено на HTML для tiptap rich-text сценариев.
      onChange(currentEditor.getHTML())
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

    const currentHtml = editor.getHTML()
    if (currentHtml === value) {
      return
    }

    editor.commands.setContent(value)
  }, [editor, value])

  if (!editor) {
    return null
  }

  const activeFontFamily = (editor.getAttributes('textStyle').fontFamily as string | undefined) ?? fontFamilyOptions[0].value
  const activeFontSize = (editor.getAttributes('textStyle').fontSize as string | undefined) ?? fontSizeOptions[1].value

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2 py-1">
        <select
          className="h-8 rounded border border-input bg-background px-2 text-xs"
          value={activeFontFamily}
          onChange={(event) => {
            editor.chain().focus().setFontFamily(event.target.value).run()
          }}
          disabled={disabled}
          aria-label="Шрифт"
        >
          {fontFamilyOptions.map((fontOption) => (
            <option key={fontOption.value} value={fontOption.value}>
              {fontOption.label}
            </option>
          ))}
        </select>
        <select
          className="h-8 rounded border border-input bg-background px-2 text-xs"
          value={activeFontSize}
          onChange={(event) => {
            applyFontSize(event.target.value)
          }}
          disabled={disabled}
          aria-label="Размер шрифта"
        >
          {fontSizeOptions.map((fontSizeOption) => (
            <option key={fontSizeOption.value} value={fontSizeOption.value}>
              {fontSizeOption.label}
            </option>
          ))}
        </select>
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
