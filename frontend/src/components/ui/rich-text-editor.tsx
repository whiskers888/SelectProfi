import { type MouseEvent, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type RichTextEditorProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

const fontOptions = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier' },
] as const

export function RichTextEditor({ value, onChange, disabled = false, placeholder, className }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!editorRef.current) {
      return
    }

    if (editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value
    }
  }, [value])

  function handleCommand(event: MouseEvent<HTMLButtonElement>, command: string, commandValue?: string) {
    event.preventDefault()
    if (!editorRef.current || disabled) {
      return
    }

    editorRef.current.focus()
    document.execCommand(command, false, commandValue)
    onChange(editorRef.current.innerHTML)
  }

  function handleFontChange(fontName: string) {
    if (!editorRef.current || disabled) {
      return
    }

    editorRef.current.focus()
    document.execCommand('fontName', false, fontName)
    onChange(editorRef.current.innerHTML)
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex flex-wrap items-center gap-2 rounded-md border border-input bg-background px-2 py-1">
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs"
          onMouseDown={(event) => handleCommand(event, 'bold')}
          disabled={disabled}
          aria-label="Жирный"
        >
          B
        </button>
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs italic"
          onMouseDown={(event) => handleCommand(event, 'italic')}
          disabled={disabled}
          aria-label="Курсив"
        >
          I
        </button>
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs underline"
          onMouseDown={(event) => handleCommand(event, 'underline')}
          disabled={disabled}
          aria-label="Подчеркнутый"
        >
          U
        </button>
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs"
          onMouseDown={(event) => handleCommand(event, 'insertUnorderedList')}
          disabled={disabled}
        >
          • list
        </button>
        <button
          type="button"
          className="rounded border border-input px-2 py-1 text-xs"
          onMouseDown={(event) => handleCommand(event, 'insertOrderedList')}
          disabled={disabled}
        >
          1. list
        </button>
        <select
          className="h-8 rounded border border-input bg-background px-2 text-xs"
          onChange={(event) => handleFontChange(event.target.value)}
          disabled={disabled}
          defaultValue={fontOptions[0].value}
          aria-label="Шрифт"
        >
          {fontOptions.map((fontOption) => (
            <option key={fontOption.value} value={fontOption.value}>
              {fontOption.label}
            </option>
          ))}
        </select>
      </div>
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        className={cn(
          'min-h-28 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none',
          'empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]',
          disabled ? 'cursor-not-allowed opacity-50' : '',
        )}
      />
    </div>
  )
}
