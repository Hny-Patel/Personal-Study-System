'use client'

import { memo, useState } from 'react'
import { NodeProps, useReactFlow, NodeResizer, NodeToolbar, Position } from '@xyflow/react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useParams } from 'next/navigation'
import { updateNoteAction, deleteNoteAction } from '@/app/(app)/notes/actions'

const COLORS = [
  'bg-yellow-200 dark:bg-yellow-800',
  'bg-green-200 dark:bg-green-800',
  'bg-blue-200 dark:bg-blue-800',
  'bg-pink-200 dark:bg-pink-800',
  'bg-purple-200 dark:bg-purple-800'
]

export const StickyNoteNode = memo(({ id, data, selected }: NodeProps) => {
  const { updateNodeData, deleteElements, setNodes } = useReactFlow()
  const color = (data.color as string) || COLORS[0]
  const content = (data.content as string) || ''
  
  const [isEditing, setIsEditing] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [text, setText] = useState(content)

  const params = useParams()
  const boardId = params.boardId as string

  const bumpZIndex = () => {
    setNodes((nds) => {
      const maxZ = Math.max(...nds.map(n => (n.style?.zIndex as number) || 0))
      return nds.map(n => {
        if (n.id === id && ((n.style?.zIndex as number) || 0) < maxZ) {
          const newZ = maxZ + 1
          updateNoteAction(id, boardId, { z_index: newZ })
          return { ...n, style: { ...n.style, zIndex: newZ } }
        }
        return n
      })
    })
  }

  const handleBlur = () => {
    setIsEditing(false)
    if (text !== content) {
      updateNodeData(id, { content: text })
      updateNoteAction(id, boardId, { content: text })
    }
  }

  const handleDelete = () => {
    deleteElements({ nodes: [{ id }] })
    deleteNoteAction(id, boardId)
  }

  const handleColorChange = (c: string) => {
    updateNodeData(id, { color: c })
    updateNoteAction(id, boardId, { color: c })
  }

  const handleToggleChecklist = (index: number) => {
    const lines = content.split('\n')
    const line = lines[index]
    if (line.startsWith('- [ ] ')) {
      lines[index] = '- [x] ' + line.substring(6)
    } else if (line.startsWith('- [x] ')) {
      lines[index] = '- [ ] ' + line.substring(6)
    }
    const newContent = lines.join('\n')
    setText(newContent)
    updateNodeData(id, { content: newContent })
    updateNoteAction(id, boardId, { content: newContent })
  }

  // Very naive markdown parsing for display (bold, italic, checklist)
  const renderContent = (content: string) => {
    if (!content) return <span className="text-black/40 dark:text-white/40 italic select-none">Double click to edit...</span>
    
    return content.split('\n').map((line, i) => {
      let l = line
      const isCheck = l.startsWith('- [ ] ')
      const isChecked = l.startsWith('- [x] ')
      if (isCheck || isChecked) {
        l = l.substring(6)
      }
      
      let htmlLine = l
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
      
      return (
        <div key={i} className="flex items-start min-h-[1.5rem]">
          {(isCheck || isChecked) && (
            <input 
              type="checkbox" 
              checked={isChecked} 
              onChange={() => handleToggleChecklist(i)}
              className="mt-1.5 mr-2 flex-shrink-0 cursor-pointer" 
            />
          )}
          <span dangerouslySetInnerHTML={{ __html: htmlLine }} className={cn("break-words", isChecked && 'line-through opacity-70')} />
        </div>
      )
    })
  }

  return (
    <>
      <NodeToolbar 
        isVisible={selected || isHovered} 
        position={Position.Top} 
        className="flex gap-1 bg-white dark:bg-zinc-900 p-1.5 rounded-md shadow-md border border-zinc-200 dark:border-zinc-800"
      >
        <div className="flex gap-1 mr-2 items-center">
          {COLORS.map(c => (
            <button
              key={c}
              className={cn("w-5 h-5 rounded-full border border-black/10 dark:border-white/10 hover:scale-110 transition-transform", c.split(' ')[0], c === color && "ring-2 ring-black/50 dark:ring-white/50")}
              onClick={(e) => { e.stopPropagation(); handleColorChange(c) }}
            />
          ))}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 text-red-600 hover:text-red-700 hover:bg-red-100/50"
          onClick={(e) => { e.stopPropagation(); handleDelete() }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </NodeToolbar>

      <NodeResizer 
        color="#a1a1aa" 
        isVisible={selected} 
        minWidth={150} 
        minHeight={150} 
        onResizeEnd={(_, resizeParams) => {
          updateNoteAction(id, boardId, { 
            width: resizeParams.width, 
            height: resizeParams.height, 
            pos_x: resizeParams.x, 
            pos_y: resizeParams.y 
          })
        }}
      />
      <div 
        className={cn(
          "w-full h-full min-w-[150px] min-h-[150px] p-4 rounded-md flex flex-col group relative transition-shadow",
          "border border-black/10 dark:border-white/10 shadow-lg overflow-hidden",
          color,
          selected && "ring-2 ring-primary ring-offset-2 ring-offset-background"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onPointerDownCapture={bumpZIndex}
      >

        <div 
          className="flex-1 w-full h-full mt-2 overflow-hidden nodrag" 
          onDoubleClick={(e) => { e.stopPropagation(); setIsEditing(true) }}
        >
          {isEditing ? (
            <textarea
              className="w-full h-full bg-transparent resize-none outline-none text-black dark:text-white"
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                // Allow exiting edit mode with Escape
                if (e.key === 'Escape') {
                  e.currentTarget.blur()
                }
              }}
              placeholder="Write a note..."
            />
          ) : (
            <div className="w-full h-full text-black dark:text-white overflow-y-auto cursor-text">
              {renderContent(content)}
            </div>
          )}
        </div>
      </div>
    </>
  )
})

StickyNoteNode.displayName = 'StickyNoteNode'
