'use client'

import { useState, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  Node,
  ReactFlowProvider,
} from '@xyflow/react'
import { StickyNoteNode } from './sticky-note'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { createNoteAction, updateNoteAction } from '@/app/(app)/notes/actions'

const nodeTypes = {
  stickyNote: StickyNoteNode,
}

const defaultNodes: Node[] = []

export function Board({ boardId, initialNodes }: { boardId: string, initialNodes: Node[] }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const handleNodeDragStop = (_event: any, node: Node) => {
    updateNoteAction(node.id, boardId, { pos_x: node.position.x, pos_y: node.position.y })
  }

  const addNote = useCallback(async () => {
    // Generate a random position near the center
    const x = window.innerWidth / 2 - 100 + (Math.random() * 50 - 25)
    const y = window.innerHeight / 2 - 100 + (Math.random() * 50 - 25)
    
    const currentMaxZ = nodes.length > 0 ? Math.max(...nodes.map(n => (n.style?.zIndex as number) || 0)) : 0
    const newZ = currentMaxZ + 1

    const newNote = {
      board_id: boardId,
      content: '',
      color: 'bg-yellow-200 dark:bg-yellow-800',
      pos_x: x,
      pos_y: y,
      width: 250,
      height: 250,
      z_index: newZ
    }

    // Persist to DB first
    const dbNote = await createNoteAction(newNote) as any
    
    setNodes((nds) => {
      const newNode: Node = {
        id: dbNote.id,
        type: 'stickyNote',
        position: { x: Number(dbNote.pos_x), y: Number(dbNote.pos_y) },
        data: { content: dbNote.content || '', color: dbNote.color || 'bg-yellow-200 dark:bg-yellow-800' },
        style: { zIndex: dbNote.z_index, width: Number(dbNote.width) || 250, height: Number(dbNote.height) || 250 }
      }
      return [...nds, newNode]
    })
  }, [setNodes, boardId, nodes])

  return (
    <div className="w-full h-full relative" style={{ height: 'calc(100vh - 4rem)' }}>
      <ReactFlowProvider>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onNodeDragStop={handleNodeDragStop}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          minZoom={0.2}
          maxZoom={4}
          panOnDrag={true}
          selectionOnDrag={false}
          panOnScroll={true}
          zoomOnPinch={true}
          zoomOnDoubleClick={false}
          className="bg-zinc-50 dark:bg-zinc-950"
        >
          <Background gap={20} size={1} />
          <Controls />
        </ReactFlow>
        <div className="absolute top-4 right-4 z-10">
          <Button onClick={addNote} className="shadow-lg">
            <Plus className="h-4 w-4 mr-2" /> Add Note
          </Button>
        </div>
      </ReactFlowProvider>
    </div>
  )
}
